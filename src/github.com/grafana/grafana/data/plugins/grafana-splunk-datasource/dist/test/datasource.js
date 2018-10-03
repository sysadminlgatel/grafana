'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SplunkDatasource = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _datemath = require('app/core/utils/datemath');

var dateMath = _interopRequireWildcard(_datemath);

var _Rx = require('vendor/npm/rxjs/Rx');

var _Rx2 = _interopRequireDefault(_Rx);

var _response_handler = require('./response_handler');

var _response_handler2 = _interopRequireDefault(_response_handler);

var _query_builder = require('./query_builder');

require('./splunk_api');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TIME_STAMP_FIELD = '_time',
    INTERNAL_FIELD_PATTERN = /^_.+/,
    RT_PATTERN = /^now($|-)/;

var SplunkDatasource = exports.SplunkDatasource = function () {

  /** @ngInject */
  function SplunkDatasource(instanceSettings, SplunkAPI, templateSrv) {
    _classCallCheck(this, SplunkDatasource);

    this.type = instanceSettings.type;
    this.url = instanceSettings.url;
    this.name = instanceSettings.name;
    this.templateSrv = templateSrv;

    // Get data as they become available (use chunked transfer encoding)
    this.streamMode = instanceSettings.jsonData.streamMode;

    // Search id
    this.next_sid = 0;
    this.runningSearches = {};

    var jsonData = instanceSettings.jsonData;
    this.fieldSearchType = jsonData.fieldSearchType || 'quick';
    this.tsField = jsonData.tsField || TIME_STAMP_FIELD;
    this.internalFieldPattern = jsonData.internalFieldPattern ? new RegExp(jsonData.internalFieldPattern) : INTERNAL_FIELD_PATTERN;

    this.splunk = new SplunkAPI(instanceSettings);
  }

  _createClass(SplunkDatasource, [{
    key: 'query',
    value: function query(options) {
      var _this = this;

      var timeRange = void 0;

      var isRTSearch = isRelativeTime(options.rangeRaw);
      if (isRTSearch) {
        timeRange = toRTRange(options.rangeRaw);
      } else {
        var timeFrom = Math.ceil(dateMath.parse(options.range.from) / 1000);
        var timeTo = Math.ceil(dateMath.parse(options.range.to) / 1000);
        timeRange = { timeFrom: timeFrom, timeTo: timeTo };
      }

      if (this.streamMode) {
        // Stream mode
        this.cancelRunningJobs(options.panelId);

        // Return one RxJs Subject instance per panel
        var subject = new _Rx2.default.Subject();
        this.streamQuery(options, timeRange, subject);
        return subject;
      } else {
        // Regular mode
        this.cancelRunningJobs(options.panelId);

        var enabledTargets = _lodash2.default.filter(options.targets, function (target) {
          return !target.hide;
        });

        var queries = enabledTargets.map(function (target) {
          var search = void 0;

          if (!target.rawQuery) {
            search = _query_builder.SplunkQueryBuilder.build(target);
          } else {
            search = target.query;
          }

          search = _this.templateSrv.replace(search, options.scopedVars);

          var sid = _this.getNextSid();
          _this.addRunningSearch(sid, options.panelId);

          if (!search) {
            return [];
          }

          var searchOptions = {
            namespace: target.namespace
          };

          return _this.invokeSplunkSearchWithFullResult(search, timeRange, sid, searchOptions).then(function (response) {
            if (target.resultFormat === 'table') {
              return _response_handler2.default.handleTableResponse(response.results, _this.tsField, _this.internalFieldPattern);
            } else {
              return _response_handler2.default.handleRawQueryResponse(response, _this.tsField, _this.internalFieldPattern);
            }
          });
        });

        return Promise.all(queries).then(function (result) {
          return {
            data: _lodash2.default.flatten(result)
          };
        });
      }
    }
  }, {
    key: 'streamQuery',
    value: function streamQuery(options, timeRange, subject) {
      var _this2 = this;

      // let isRTSearch = isRelativeTime(options.rangeRaw);
      var enabledTargets = _lodash2.default.filter(options.targets, function (target) {
        return !target.hide;
      });

      var targetSubjects = _lodash2.default.map(enabledTargets, function (target) {
        var search = void 0;
        if (!target.rawQuery) {
          search = _query_builder.SplunkQueryBuilder.build(target);
        } else {
          search = target.query;
        }

        if (search) {
          var query = _this2.templateSrv.replace(search, options.scopedVars);
          var queryOptions = {
            namespace: target.namespace
          };

          var sid = _this2.getNextSid();
          _this2.addRunningSearch(sid, options.panelId);

          var targetSubject = new _Rx2.default.Subject();
          _this2.splunk.searchWithPreview(query, timeRange, targetSubject, sid, queryOptions);

          return targetSubject.map(function (response) {
            if (target.resultFormat === 'table') {
              return _response_handler2.default.handleTableResponse(response.results, _this2.tsField, _this2.internalFieldPattern);
            } else {
              var data = _response_handler2.default.handleRawQueryResponse(response, _this2.tsField, _this2.internalFieldPattern);
              sortDataPoints(data);
              return data;
            }
          });
        } else {
          return _Rx2.default.Observable.empty();
        }
      });

      // Get all targets and combine it into one data stream
      // combineAll() takes events from all streams and combine it by applying combineLatest(),
      // so latest combined event contains latest data from each target
      var higherOrderSubjects = _Rx2.default.Observable.from(targetSubjects);
      return higherOrderSubjects.combineAll().map(function (data) {
        return _lodash2.default.flatten(data);
      }).subscribe({
        next: function next(data) {
          subject.next({
            data: data
          });
        },
        error: function error(_error) {
          subject.error(_error);
        },
        complete: function complete() {
          subject.complete();
        }
      });
    }
  }, {
    key: 'addRunningSearch',
    value: function addRunningSearch(sid, panelId) {
      if (this.runningSearches[panelId]) {
        this.runningSearches[panelId].push(sid);
      } else {
        this.runningSearches[panelId] = [sid];
      }
    }
  }, {
    key: 'removeRunningSearch',
    value: function removeRunningSearch(sid, panelId) {
      if (this.runningSearches[panelId]) {
        _lodash2.default.pull(this.runningSearches[panelId], sid);
      }
    }
  }, {
    key: 'cancelRunningJobs',
    value: function cancelRunningJobs(panelId) {
      var _this3 = this;

      if (this.runningSearches[panelId]) {
        var promises = this.runningSearches[panelId].map(function (sid) {
          _this3.removeRunningSearch(sid, panelId);
          return _this3.splunk.cancelSearchJob(sid).catch(function (error) {
            console.log(error);
          });
        });
        return Promise.all(promises);
      }
    }

    // Required
    // Used for testing datasource in datasource configuration pange

  }, {
    key: 'testDatasource',
    value: function testDatasource() {
      return this.splunk.getServerStatus().then(function () {
        return {
          status: "success",
          message: "Connected to Splunk",
          title: "Success"
        };
      }).catch(function (error) {
        console.log(error);

        var message = 'Connection error.\n          Check protocol and Splunk API port (default are https and 8089).\n          If you use direct access mode, you\'ll need to configure the Splunk server\n          to allow Grafana to communicate with it using a CORS connection\n          (crossOriginSharingPolicy option in server.conf).\n        ';

        if (!error.cancelled && error.message) {
          message = error.message;
        }

        return { status: "error", title: "Error", message: message };
      });
    }

    // Used for templating

  }, {
    key: 'metricFindQuery',
    value: function metricFindQuery(query) {
      if (!query) {
        return Promise.resolve([]);
      }

      query = this.templateSrv.replace(query);
      return this.invokeSplunkSearch(query).then(function (results) {
        if (results && results.length) {
          var values = _lodash2.default.flatten(_lodash2.default.values(results[0]));
          return values.map(function (val) {
            return { text: val };
          });
        } else {
          return [];
        }
      });
    }

    // Get Splunk alerts as annotations

  }, {
    key: 'annotationQuery',
    value: function annotationQuery(options) {
      if (options.annotation.alert || !options.annotation.alert && !options.annotation.search) {
        // Get saved Splunk alerts
        var alertName = this.templateSrv.replace(options.annotation.alert, options.scopedVars);

        return this.splunk.getFiredAlerts(alertName).then(function (alerts) {
          return alerts.map(function (alert) {
            return {
              annotation: options.annotation,
              time: alert.content.trigger_time * 1000,
              title: alert.content.savedsearch_name
              // text: alert.content.savedsearch_name
            };
          });
        });
      } else {
        // Get annotations from Splunk search
        var timeFrom = options.range.from.unix();
        var timeTo = options.range.to.unix();
        var search = this.templateSrv.replace(options.annotation.search, options.scopedVars);

        return this.invokeSplunkSearch(search, timeFrom, timeTo).then(function (events) {
          var regex = void 0;
          if (options.annotation.regex) {
            regex = new RegExp(options.annotation.regex);
          }

          var field = options.annotation.field;
          var annotation_text = '';

          return events.map(function (event) {
            if (field) {
              if (regex) {
                var match = regex.exec(event[field]);
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
  }, {
    key: 'invokeSplunkSearch',
    value: function invokeSplunkSearch(query, timeFrom, timeTo, sid) {
      var options = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};

      // return this.invokeBlockingSearch(query, timeFrom, timeTo, sid);
      return this.splunk.invokeAsyncSearch(query, timeFrom, timeTo, sid, options);
    }
  }, {
    key: 'invokeSplunkSearchWithFullResult',
    value: function invokeSplunkSearchWithFullResult(query, timeRange, sid) {
      var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
      var timeFrom = timeRange.timeFrom,
          timeTo = timeRange.timeTo;

      return this.splunk.invokeAsyncSearchWithFullResult(query, timeFrom, timeTo, sid, options);
    }

    // Metric suggestions

  }, {
    key: 'getIndexes',
    value: function getIndexes() {
      return this.splunk.getMetrics('data/indexes');
    }
  }, {
    key: 'getSourcetypes',
    value: function getSourcetypes() {
      return this.splunk.getMetrics('saved/sourcetypes');
    }
  }, {
    key: 'getApps',
    value: function getApps() {
      return this.splunk.getApps();
    }
  }, {
    key: 'getFields',
    value: function getFields(index, sourcetype, timeFrom, timeTo) {
      var query = _query_builder.SplunkQueryBuilder.buildGetFields(index, sourcetype);
      var fieldSearch = void 0;

      if (this.fieldSearchType === 'quick') {
        fieldSearch = this.splunk.invokeSearchWithPreview(query, timeFrom, timeTo);
      } else {
        fieldSearch = this.invokeSplunkSearch(query, timeFrom, timeTo);
      }
      return fieldSearch.then(function (results) {
        return _lodash2.default.map(results, 'field');
      });
    }
  }, {
    key: 'getNextSid',
    value: function getNextSid(isRealTime) {
      var ts = Math.ceil(Date.now() / 1000);
      var sid = 'grafana_' + ts + '.' + this.next_sid;
      if (isRealTime) {
        sid = 'rt_' + sid;
      }

      this.next_sid++;
      return sid;
    }
  }]);

  return SplunkDatasource;
}();

function sortDataPoints(data) {
  _lodash2.default.forEach(data, function (series) {
    series.datapoints = _lodash2.default.sortBy(series.datapoints, function (point) {
      return point[1];
    });
  });
}

function isRelativeTime(timeRange) {
  return _lodash2.default.every(timeRange, function (timeModifier) {
    return RT_PATTERN.test(timeModifier);
  });
}

function toRTRange(rangeRaw) {
  var timeFrom = toSplunkRelativeTime(rangeRaw.from);
  var timeTo = toSplunkRelativeTime(rangeRaw.to);
  return { timeFrom: timeFrom, timeTo: timeTo };
}

function toSplunkRelativeTime(timeModifier) {
  var nowPattern = /^now$/;
  if (nowPattern.test(timeModifier)) {
    return 'now';
  } else if (RT_PATTERN.test(timeModifier)) {
    return timeModifier.replace('now', '');
  } else {
    throw 'Not a valid Splunk time modifier';
  }
}
//# sourceMappingURL=datasource.js.map
