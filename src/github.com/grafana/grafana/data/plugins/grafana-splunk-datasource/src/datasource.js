import _ from 'lodash';
import * as dateMath from 'app/core/utils/datemath';
import Rx from 'vendor/npm/rxjs/Rx';
import responseHandler from './response_handler';
import {SplunkQueryBuilder} from './query_builder';
import './splunk_api';

let TIME_STAMP_FIELD = '_time',
    INTERNAL_FIELD_PATTERN = /^_.+/,
    RT_PATTERN = /^now($|-)/;

export class SplunkDatasource {

  /** @ngInject */
  constructor(instanceSettings, SplunkAPI, templateSrv) {
    this.type = instanceSettings.type;
    this.url = instanceSettings.url;
    this.name = instanceSettings.name;
    this.templateSrv = templateSrv;

    // Get data as they become available (use chunked transfer encoding)
    this.streamMode = instanceSettings.jsonData.streamMode;

    // Search id
    this.next_sid = 0;
    this.runningSearches = {};

    let jsonData = instanceSettings.jsonData;
    this.fieldSearchType = jsonData.fieldSearchType || 'quick';
    this.tsField = jsonData.tsField || TIME_STAMP_FIELD;
    this.internalFieldPattern = jsonData.internalFieldPattern ? new RegExp(jsonData.internalFieldPattern) : INTERNAL_FIELD_PATTERN;

    this.splunk = new SplunkAPI(instanceSettings);
  }

  query(options) {
    let timeRange;

    let isRTSearch = isRelativeTime(options.rangeRaw);
    if (isRTSearch) {
      timeRange = toRTRange(options.rangeRaw);
    } else {
      let timeFrom = Math.ceil(dateMath.parse(options.range.from) / 1000);
      let timeTo = Math.ceil(dateMath.parse(options.range.to) / 1000);
      timeRange = { timeFrom, timeTo };
    }

    if (this.streamMode) {
      // Stream mode
      this.cancelRunningJobs(options.panelId);

      // Return one RxJs Subject instance per panel
      let subject = new Rx.Subject();
      this.streamQuery(options, timeRange, subject);
      return subject;
    } else {
      // Regular mode
      this.cancelRunningJobs(options.panelId);

      let enabledTargets = _.filter(options.targets, target => {
        return !target.hide;
      });

      let queries = enabledTargets.map(target => {
        let search;

        if (!target.rawQuery) {
          search = SplunkQueryBuilder.build(target);
        } else {
          search = target.query;
        }

        search = this.templateSrv.replace(search, options.scopedVars);

        let sid = this.getNextSid();
        this.addRunningSearch(sid, options.panelId);

        if (!search) {
          return [];
        }

        let searchOptions = {
          namespace: target.namespace
        };

        return this.invokeSplunkSearchWithFullResult(search, timeRange, sid, searchOptions)
        .then(response => {
          if (target.resultFormat === 'table') {
            return responseHandler.handleTableResponse(response.results, this.tsField, this.internalFieldPattern);
          } else {
            return responseHandler.handleRawQueryResponse(response, this.tsField, this.internalFieldPattern);
          }
        });
      });

      return Promise.all(queries)
      .then(result => {
        return {
          data: _.flatten(result)
        };
      });
    }
  }

  streamQuery(options, timeRange, subject) {
    // let isRTSearch = isRelativeTime(options.rangeRaw);
    let enabledTargets = _.filter(options.targets, target => {
      return !target.hide;
    });

    let targetSubjects = _.map(enabledTargets, target => {
      let search;
      if (!target.rawQuery) {
        search = SplunkQueryBuilder.build(target);
      } else {
        search = target.query;
      }

      if (search) {
        let query = this.templateSrv.replace(search, options.scopedVars);
        let queryOptions = {
          namespace: target.namespace
        };

        let sid = this.getNextSid();
        this.addRunningSearch(sid, options.panelId);

        let targetSubject = new Rx.Subject();
        this.splunk.searchWithPreview(query, timeRange, targetSubject, sid, queryOptions);

        return targetSubject.map(response => {
          if (target.resultFormat === 'table') {
            return responseHandler.handleTableResponse(response.results, this.tsField, this.internalFieldPattern);
          } else {
            let data = responseHandler.handleRawQueryResponse(response, this.tsField, this.internalFieldPattern);
            sortDataPoints(data);
            return data;
          }
        });
      } else {
        return Rx.Observable.empty();
      }
    });

    // Get all targets and combine it into one data stream
    // combineAll() takes events from all streams and combine it by applying combineLatest(),
    // so latest combined event contains latest data from each target
    let higherOrderSubjects = Rx.Observable.from(targetSubjects);
    return higherOrderSubjects.combineAll()
    .map(data => {
      return _.flatten(data);
    })
    .subscribe({
      next: (data) => {
        subject.next({
          data: data
        });
      },
      error: (error) => {
        subject.error(error);
      },
      complete: () => {
        subject.complete();
      }
    });
  }

  addRunningSearch(sid, panelId) {
    if (this.runningSearches[panelId]) {
      this.runningSearches[panelId].push(sid);
    } else {
      this.runningSearches[panelId] = [sid];
    }
  }

  removeRunningSearch(sid, panelId) {
    if (this.runningSearches[panelId]) {
      _.pull(this.runningSearches[panelId], sid);
    }
  }

  cancelRunningJobs(panelId) {
    if (this.runningSearches[panelId]) {
      let promises = this.runningSearches[panelId].map(sid => {
        this.removeRunningSearch(sid, panelId);
        return this.splunk.cancelSearchJob(sid)
        .catch(error => {
          console.log(error);
        });
      });
      return Promise.all(promises);
    }
  }

  // Required
  // Used for testing datasource in datasource configuration pange
  testDatasource() {
    return this.splunk.getServerStatus()
    .then(() => {
      return {
        status: "success",
        message: "Connected to Splunk",
        title: "Success"
      };
    })
    .catch(error => {
      console.log(error);

      let message = `Connection error.
          Check protocol and Splunk API port (default are https and 8089).
          If you use direct access mode, you'll need to configure the Splunk server
          to allow Grafana to communicate with it using a CORS connection
          (crossOriginSharingPolicy option in server.conf).
        `;

      if (!error.cancelled && error.message) {
        message = error.message;
      }

      return { status: "error", title: "Error", message: message };
    });
  }

  // Used for templating
  metricFindQuery(query) {
    if (!query) {
      return Promise.resolve([]);
    }

    query = this.templateSrv.replace(query);
    return this.invokeSplunkSearch(query).then(results => {
      if (results && results.length) {
        let values = _.flatten(_.values(results[0]));
        return values.map(val => {
          return {text: val};
        });
      } else {
        return [];
      }
    });
  }

  // Get Splunk alerts as annotations
  annotationQuery(options) {
    if (options.annotation.alert || (!options.annotation.alert && !options.annotation.search)) {
      // Get saved Splunk alerts
      let alertName = this.templateSrv.replace(options.annotation.alert, options.scopedVars);

      return this.splunk.getFiredAlerts(alertName)
      .then(alerts => {
        return alerts.map(alert => {
          return {
            annotation: options.annotation,
            time: alert.content.trigger_time * 1000,
            title: alert.content.savedsearch_name,
            // text: alert.content.savedsearch_name
          };
        });
      });
    } else {
      // Get annotations from Splunk search
      let timeFrom = options.range.from.unix();
      let timeTo = options.range.to.unix();
      let search = this.templateSrv.replace(options.annotation.search, options.scopedVars);

      return this.invokeSplunkSearch(search, timeFrom, timeTo)
      .then(events => {
        let regex;
        if (options.annotation.regex) {
          regex = new RegExp(options.annotation.regex);
        }

        let field = options.annotation.field;
        let annotation_text = '';

        return events.map(event => {
          if (field) {
            if (regex) {
              let match = regex.exec(event[field]);
              if (match) {
                annotation_text = match[1] ? match[1] : match[0];
              }
            } else {
              annotation_text = event[field];
            }
          }

          return {
            annotation: options.annotation,
            time: Date.parse(event._time),
            title: options.annotation.name,
            text: annotation_text
          };
        });
      });
    }
  }

  invokeSplunkSearch(query, timeFrom, timeTo, sid, options = {}) {
    // return this.invokeBlockingSearch(query, timeFrom, timeTo, sid);
    return this.splunk.invokeAsyncSearch(query, timeFrom, timeTo, sid, options);
  }

  invokeSplunkSearchWithFullResult(query, timeRange, sid, options = {}) {
    let { timeFrom, timeTo } = timeRange;
    return this.splunk.invokeAsyncSearchWithFullResult(query, timeFrom, timeTo, sid, options);
  }

  // Metric suggestions
  getIndexes() {
    return this.splunk.getMetrics('data/indexes');
  }

  getSourcetypes() {
    return this.splunk.getMetrics('saved/sourcetypes');
  }

  getApps() {
    return this.splunk.getApps();
  }

  getFields(index, sourcetype, timeFrom, timeTo) {
    let query = SplunkQueryBuilder.buildGetFields(index, sourcetype);
    let fieldSearch;

    if (this.fieldSearchType === 'quick') {
      fieldSearch = this.splunk.invokeSearchWithPreview(query, timeFrom, timeTo);
    } else {
      fieldSearch = this.invokeSplunkSearch(query, timeFrom, timeTo);
    }
    return fieldSearch.then(results => {
      return _.map(results, 'field');
    });
  }

  getNextSid(isRealTime) {
    let ts = Math.ceil(Date.now() / 1000);
    let sid = `grafana_${ts}.${this.next_sid}`;
    if (isRealTime) {
      sid = 'rt_' + sid;
    }

    this.next_sid++;
    return sid;
  }
}

function sortDataPoints(data) {
  _.forEach(data, series => {
    series.datapoints = _.sortBy(series.datapoints, (point) => {
      return point[1];
    });
  });
}

function isRelativeTime(timeRange) {
  return _.every(timeRange, timeModifier => RT_PATTERN.test(timeModifier));
}

function toRTRange(rangeRaw) {
  let timeFrom = toSplunkRelativeTime(rangeRaw.from);
  let timeTo = toSplunkRelativeTime(rangeRaw.to);
  return {timeFrom, timeTo};
}

function toSplunkRelativeTime(timeModifier) {
  const nowPattern = /^now$/;
  if (nowPattern.test(timeModifier)) {
    return 'now';
  } else if (RT_PATTERN.test(timeModifier)) {
    return timeModifier.replace('now', '');
  } else {
    throw 'Not a valid Splunk time modifier';
  }
}
