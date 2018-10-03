import angular from 'angular';
import _ from 'lodash';

export function splunkAPIFactory($httpParamSerializerJQLike, backendSrv) {

  class SplunkAPI {

    constructor(instanceSettings) {
      let options = instanceSettings.jsonData;
      this.url = instanceSettings.url;

      this.basicAuth = instanceSettings.basicAuth;
      this.withCredentials = instanceSettings.withCredentials;

      this.paramSerializer = $httpParamSerializerJQLike;
      this.backendSrv = backendSrv;

      this.AUTO_CANCEL = _.isNumber(options.autoCancel) ? options.autoCancel : 30;
      this.STATUS_BUCKETS = _.isNumber(options.statusBuckets) ? options.statusBuckets : 300;
      this.DEFAULT_EARLIEST_TIME = options.defaultEarliestTime || '-1hr';

      // Search result polling intervals. Interval for next poll choosing randomly
      // from [MIN_POLL_INTERVAL, MAX_POLL_INTERVAL]
      this.MIN_POLL_INTERVAL = options.minPollInterval || 500;
      this.MAX_POLL_INTERVAL = options.maxPollInterval || 3000;
    }

    invokeAsyncSearch(query, timeFrom, timeTo, sid, options = {}) {
      return this.createSearchJob(query, options, timeFrom, timeTo, sid)
      .then(result => {
        let sid = result.sid;
        return this.waitForJobFinish(sid);
      })
      .then(result => {
        if (result.status === 'done') {
          return this.getSearchJobResult(result.sid);
        } else {
          return [];
        }
      })
      .then(response => {
        if (response && response.results) {
          return response.results;
        } else {
          // Return empty result if job was canceled
          return [];
        }
      });
    }

    invokeAsyncSearchWithFullResult(query, timeFrom, timeTo, sid, options = {}) {
      return this.createSearchJob(query, options, timeFrom, timeTo, sid)
      .then(result => {
        let sid = result.sid;
        return this.waitForJobFinish(sid);
      })
      .then(result => {
        if (result.status === 'done') {
          return this.getSearchJobResult(result.sid);
        } else {
          return [];
        }
      });
    }

    invokeSearchWithPreview(query, timeFrom, timeTo, sid, options = {}) {
      return this.createSearchJob(query, options, timeFrom, timeTo, sid)
      .then(result => {
        let sid = result.sid;
        return this.waitForJobResultPreview(sid);
      })
      .then(response => {
        if (response && response.results) {
          return response.results;
        } else {
          // Return empty result if job was canceled
          return [];
        }
      });

    }

    invokeBlockingSearch(query, timeFrom, timeTo, sid, options = {}) {
      options.exec_mode = 'oneshot';

      return this.createSearchJob(query, options, timeFrom, timeTo, sid)
      .then(response => {
        if (response && response.results) {
          return response.results;
        } else {
          // Return empty result if job was canceled
          return [];
        }
      });
    }

    waitForJobFinish(sid) {
      return this.getSearchJobStatus(sid)
      .then(status => {
        if (status.isDone) {
          return {sid: sid, status: 'done'};
        } else if (status === 'canceled') {
          return {sid: sid, status: 'canceled'};
        } else {
          let interval = getRandomInterval(this.MIN_POLL_INTERVAL, this.MAX_POLL_INTERVAL);
          return new Promise((resolve) => {
            setTimeout(resolve, interval);
          })
          .then(() => {
            return this.waitForJobFinish(sid);
          });
        }
      });
    }

    waitForJobResultPreview(sid) {
      return this.getSearchJobResultPreview(sid)
      .then(result => {
        if (result && result.results && result.results.length) {
          return result;
        } else {
          let interval = getRandomInterval(this.MIN_POLL_INTERVAL, this.MAX_POLL_INTERVAL);
          return new Promise((resolve) => {
            setTimeout(resolve, interval);
          })
          .then(() => {
            return this.waitForJobResultPreview(sid);
          });
        }
      });
    }

    ////////////////////////
    // Stream mode (RxJs) //
    ////////////////////////

    searchWithPreview(query, timeRange, subject, sid, options = {}) {
      let {timeFrom, timeTo} = timeRange;

      this.createSearchJob(query, options, timeFrom, timeTo, sid)
      .then(result => {
        return this.previewResults(result.sid, subject);
      })
      .catch(error => {
        console.log(error);
        subject.next([]);
        subject.complete();
        // TODO: improve error handling in Grafana
        // subject.error(error);
      });
    }

    /**
     * Check for job status and get results preview using random inteval util
     * job is finished.
     * @param {*} sid
     * @param {*} subject
     */
    previewResults(sid, subject) {
      return this.getSearchJobStatus(sid)
      .then(job => {
        if (job.isDone || job.dispatchState === 'RUNNING') {
          return this.getSearchJobResultPreview(sid)
          .then(result => {
            if (result && result.results) {
              subject.next(result);
            }

            if (job.isDone) {
              subject.complete();
              return;
            }

            return this.waitForPreview(sid, subject);
          });
        } else {
          return this.waitForPreview(sid, subject);
        }
      });
    }

    waitForPreview(sid, subject) {
      let interval = getRandomInterval(this.MIN_POLL_INTERVAL, this.MAX_POLL_INTERVAL);
      return new Promise((resolve) => {
        setTimeout(resolve, interval);
      }).then(() => {
        return this.previewResults(sid, subject);
      });
    }

    /////////////////
    // Search Jobs //
    /////////////////

    createSearchJob(search, options, timeFrom, timeTo, sid) {
      timeFrom = timeFrom || this.DEFAULT_EARLIEST_TIME;
      let {exec_mode, namespace} = options;
      let endpoint = '/services/search/jobs';

      let data = {
        search: formatSearch(search),
        earliest_time: timeFrom,
        latest_time: timeTo,
        auto_cancel: this.AUTO_CANCEL,
        status_buckets: this.STATUS_BUCKETS
      };

      if (exec_mode) {
        data.exec_mode = exec_mode;
      }

      if (sid) {
        data.id = sid;
      }

      if (namespace) {
        data.namespace = namespace;
        endpoint = `/servicesNS/-/${namespace}/search/jobs`;
      }

      return this._post(endpoint, data);
    }

    cancelSearchJob(sid) {
      let data = {
        action: 'cancel'
      };

      return this._post(`/services/search/jobs/${sid}/control`, data);
    }

    getSearchJobStatus(sid) {
      return this._get('/services/search/jobs/' + sid)
      .then(result => {
        return result.entry[0].content;
      })
      .catch(() => {
        return 'canceled';
      });
    }

    getSearchJobResult(sid) {
      let params = {
        count: 0
      };

      return this._get('/services/search/jobs/' + sid + '/results', params)
      .then(result => {
        return result;
      });
    }

    getSearchJobResultPreview(sid, count=0) {
      let params = {
        count: count
      };

      return this._get('/services/search/jobs/' + sid + '/results_preview', params)
      .then(result => {
        return result;
      });
    }

    getSearchJobs() {
      return this._get('/services/search/jobs')
      .then(result => {
        return result;
      });
    }

    //////////////////////////
    // API Methods Wrappers //
    //////////////////////////

    getServerStatus() {
      return this._get('/services/server/status')
      .then(result => {
        return result;
      });
    }

    getFiredAlerts(name) {
      // Use '-' for name to return all fired alerts.
      name = name ? encodeURI(name) : '-';

      return this._get('/services/alerts/fired_alerts/' + name)
      .then(result => {
        if (result && result.entry) {
          return result.entry;
        } else {
          return [];
        }
      })
      .catch(() => {
        // Alert with given name isn't existed
        return [];
      });
    }

    // Metric suggestions
    getIndexes() {
      return this.getMetrics('data/indexes');
    }

    getSourcetypes() {
      return this.getMetrics('saved/sourcetypes');
    }

    getApps() {
      return this.getMetrics('apps/local');
    }

    getMetrics(resource) {
      let params = {
        count: 0
      };

      return this._get('/services/' + resource, params)
      .then(result => {
        if (result && result.entry) {
          return result.entry;
        } else {
          return [];
        }
      });
    }

    ///////////////////////////
    // Core request wrappers //
    ///////////////////////////

    _get(url, params) {
      params = params ? params : {};
      params.output_mode = 'json';

      let options = {
        method: 'GET',
        url: this.url + url,
        params: params,
      };

      if (this.basicAuth || this.withCredentials) {
        options.withCredentials = true;
      }
      if (this.basicAuth) {
        options.headers = {
          "Authorization": this.basicAuth
        };
      }

      return this.backendSrv.datasourceRequest(options)
      .then(response => {
        return response.data;
      })
      .catch(handleSplunkApiRequestError);
    }

    _post(url, data) {
      data.output_mode = 'json';

      let options = {
        method: 'POST',
        url: this.url + url,
        // Data should sent as Form Data and proper serialized
        data: this.paramSerializer(data),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      };

      if (this.basicAuth || this.withCredentials) {
        options.withCredentials = true;
      }
      if (this.basicAuth) {
        options.headers["Authorization"] = this.basicAuth;
      }

      return this.backendSrv.datasourceRequest(options)
      .then(response => {
        let data = response.data;
        if (data && data.messages && data.messages.length) {
          let error = data.messages[0];
          if (error.type === 'FATAL') {
            return Promise.reject(error);
          } else {
            console.log(`${error.type}: ${error.text}`);
          }
        }

        return data;
      })
      .catch(handleSplunkApiRequestError);
    }
  }

  return SplunkAPI;
}

function handleSplunkApiRequestError(err) {
  if (err.cancelled) {
    err = err.err;
    err.cancelled = true;
  }

  if (err.status !== 0 || err.status >= 300) {
    if (err.data && err.data.messages && err.data.messages.length) {
      let message = err.data.messages[0];
      return Promise.reject({
        message: `Splunk Error: ${message.type} ${message.text}`,
        data: err.data,
        config: err.config
      });
    } else {
      return Promise.reject({
        message: 'Network Error: ' + err.statusText + '(' + err.status + ')',
        data: err.data,
        config: err.config,
        cancelled: err.cancelled
      });
    }
  } else {
    console.log(err);
    return [];
  }
}

function getRandomInterval(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

const GENERATING_COMMAND_PATTERN = /^\s*\|/;

function isGeneratingCommand(query) {
  return GENERATING_COMMAND_PATTERN.test(query);
}

export function formatSearch(query) {
  if (isGeneratingCommand(query)) {
    return query;
  } else {
    return 'search ' + query;
  }
}

angular
  .module('grafana.services')
  .factory('SplunkAPI', splunkAPIFactory);
