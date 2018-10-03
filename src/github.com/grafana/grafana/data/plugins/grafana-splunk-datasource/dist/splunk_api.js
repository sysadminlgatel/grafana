'use strict';

System.register(['angular', 'lodash'], function (_export, _context) {
  "use strict";

  var angular, _, _createClass, GENERATING_COMMAND_PATTERN;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function splunkAPIFactory($httpParamSerializerJQLike, backendSrv) {
    var SplunkAPI = function () {
      function SplunkAPI(instanceSettings) {
        _classCallCheck(this, SplunkAPI);

        var options = instanceSettings.jsonData;
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

      _createClass(SplunkAPI, [{
        key: 'invokeAsyncSearch',
        value: function invokeAsyncSearch(query, timeFrom, timeTo, sid) {
          var _this = this;

          var options = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};

          return this.createSearchJob(query, options, timeFrom, timeTo, sid).then(function (result) {
            var sid = result.sid;
            return _this.waitForJobFinish(sid);
          }).then(function (result) {
            if (result.status === 'done') {
              return _this.getSearchJobResult(result.sid);
            } else {
              return [];
            }
          }).then(function (response) {
            if (response && response.results) {
              return response.results;
            } else {
              // Return empty result if job was canceled
              return [];
            }
          });
        }
      }, {
        key: 'invokeAsyncSearchWithFullResult',
        value: function invokeAsyncSearchWithFullResult(query, timeFrom, timeTo, sid) {
          var _this2 = this;

          var options = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};

          return this.createSearchJob(query, options, timeFrom, timeTo, sid).then(function (result) {
            var sid = result.sid;
            return _this2.waitForJobFinish(sid);
          }).then(function (result) {
            if (result.status === 'done') {
              return _this2.getSearchJobResult(result.sid);
            } else {
              return [];
            }
          });
        }
      }, {
        key: 'invokeSearchWithPreview',
        value: function invokeSearchWithPreview(query, timeFrom, timeTo, sid) {
          var _this3 = this;

          var options = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};

          return this.createSearchJob(query, options, timeFrom, timeTo, sid).then(function (result) {
            var sid = result.sid;
            return _this3.waitForJobResultPreview(sid);
          }).then(function (response) {
            if (response && response.results) {
              return response.results;
            } else {
              // Return empty result if job was canceled
              return [];
            }
          });
        }
      }, {
        key: 'invokeBlockingSearch',
        value: function invokeBlockingSearch(query, timeFrom, timeTo, sid) {
          var options = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};

          options.exec_mode = 'oneshot';

          return this.createSearchJob(query, options, timeFrom, timeTo, sid).then(function (response) {
            if (response && response.results) {
              return response.results;
            } else {
              // Return empty result if job was canceled
              return [];
            }
          });
        }
      }, {
        key: 'waitForJobFinish',
        value: function waitForJobFinish(sid) {
          var _this4 = this;

          return this.getSearchJobStatus(sid).then(function (status) {
            if (status.isDone) {
              return { sid: sid, status: 'done' };
            } else if (status === 'canceled') {
              return { sid: sid, status: 'canceled' };
            } else {
              var interval = getRandomInterval(_this4.MIN_POLL_INTERVAL, _this4.MAX_POLL_INTERVAL);
              return new Promise(function (resolve) {
                setTimeout(resolve, interval);
              }).then(function () {
                return _this4.waitForJobFinish(sid);
              });
            }
          });
        }
      }, {
        key: 'waitForJobResultPreview',
        value: function waitForJobResultPreview(sid) {
          var _this5 = this;

          return this.getSearchJobResultPreview(sid).then(function (result) {
            if (result && result.results && result.results.length) {
              return result;
            } else {
              var interval = getRandomInterval(_this5.MIN_POLL_INTERVAL, _this5.MAX_POLL_INTERVAL);
              return new Promise(function (resolve) {
                setTimeout(resolve, interval);
              }).then(function () {
                return _this5.waitForJobResultPreview(sid);
              });
            }
          });
        }
      }, {
        key: 'searchWithPreview',
        value: function searchWithPreview(query, timeRange, subject, sid) {
          var _this6 = this;

          var options = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};
          var timeFrom = timeRange.timeFrom,
              timeTo = timeRange.timeTo;


          this.createSearchJob(query, options, timeFrom, timeTo, sid).then(function (result) {
            return _this6.previewResults(result.sid, subject);
          }).catch(function (error) {
            console.log(error);
            subject.next([]);
            subject.complete();
            // TODO: improve error handling in Grafana
            // subject.error(error);
          });
        }
      }, {
        key: 'previewResults',
        value: function previewResults(sid, subject) {
          var _this7 = this;

          return this.getSearchJobStatus(sid).then(function (job) {
            if (job.isDone || job.dispatchState === 'RUNNING') {
              return _this7.getSearchJobResultPreview(sid).then(function (result) {
                if (result && result.results) {
                  subject.next(result);
                }

                if (job.isDone) {
                  subject.complete();
                  return;
                }

                return _this7.waitForPreview(sid, subject);
              });
            } else {
              return _this7.waitForPreview(sid, subject);
            }
          });
        }
      }, {
        key: 'waitForPreview',
        value: function waitForPreview(sid, subject) {
          var _this8 = this;

          var interval = getRandomInterval(this.MIN_POLL_INTERVAL, this.MAX_POLL_INTERVAL);
          return new Promise(function (resolve) {
            setTimeout(resolve, interval);
          }).then(function () {
            return _this8.previewResults(sid, subject);
          });
        }
      }, {
        key: 'createSearchJob',
        value: function createSearchJob(search, options, timeFrom, timeTo, sid) {
          timeFrom = timeFrom || this.DEFAULT_EARLIEST_TIME;
          var exec_mode = options.exec_mode,
              namespace = options.namespace;

          var endpoint = '/services/search/jobs';

          var data = {
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
            endpoint = '/servicesNS/-/' + namespace + '/search/jobs';
          }

          return this._post(endpoint, data);
        }
      }, {
        key: 'cancelSearchJob',
        value: function cancelSearchJob(sid) {
          var data = {
            action: 'cancel'
          };

          return this._post('/services/search/jobs/' + sid + '/control', data);
        }
      }, {
        key: 'getSearchJobStatus',
        value: function getSearchJobStatus(sid) {
          return this._get('/services/search/jobs/' + sid).then(function (result) {
            return result.entry[0].content;
          }).catch(function () {
            return 'canceled';
          });
        }
      }, {
        key: 'getSearchJobResult',
        value: function getSearchJobResult(sid) {
          var params = {
            count: 0
          };

          return this._get('/services/search/jobs/' + sid + '/results', params).then(function (result) {
            return result;
          });
        }
      }, {
        key: 'getSearchJobResultPreview',
        value: function getSearchJobResultPreview(sid) {
          var count = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

          var params = {
            count: count
          };

          return this._get('/services/search/jobs/' + sid + '/results_preview', params).then(function (result) {
            return result;
          });
        }
      }, {
        key: 'getSearchJobs',
        value: function getSearchJobs() {
          return this._get('/services/search/jobs').then(function (result) {
            return result;
          });
        }
      }, {
        key: 'getServerStatus',
        value: function getServerStatus() {
          return this._get('/services/server/status').then(function (result) {
            return result;
          });
        }
      }, {
        key: 'getFiredAlerts',
        value: function getFiredAlerts(name) {
          // Use '-' for name to return all fired alerts.
          name = name ? encodeURI(name) : '-';

          return this._get('/services/alerts/fired_alerts/' + name).then(function (result) {
            if (result && result.entry) {
              return result.entry;
            } else {
              return [];
            }
          }).catch(function () {
            // Alert with given name isn't existed
            return [];
          });
        }
      }, {
        key: 'getIndexes',
        value: function getIndexes() {
          return this.getMetrics('data/indexes');
        }
      }, {
        key: 'getSourcetypes',
        value: function getSourcetypes() {
          return this.getMetrics('saved/sourcetypes');
        }
      }, {
        key: 'getApps',
        value: function getApps() {
          return this.getMetrics('apps/local');
        }
      }, {
        key: 'getMetrics',
        value: function getMetrics(resource) {
          var params = {
            count: 0
          };

          return this._get('/services/' + resource, params).then(function (result) {
            if (result && result.entry) {
              return result.entry;
            } else {
              return [];
            }
          });
        }
      }, {
        key: '_get',
        value: function _get(url, params) {
          params = params ? params : {};
          params.output_mode = 'json';

          var options = {
            method: 'GET',
            url: this.url + url,
            params: params
          };

          if (this.basicAuth || this.withCredentials) {
            options.withCredentials = true;
          }
          if (this.basicAuth) {
            options.headers = {
              "Authorization": this.basicAuth
            };
          }

          return this.backendSrv.datasourceRequest(options).then(function (response) {
            return response.data;
          }).catch(handleSplunkApiRequestError);
        }
      }, {
        key: '_post',
        value: function _post(url, data) {
          data.output_mode = 'json';

          var options = {
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

          return this.backendSrv.datasourceRequest(options).then(function (response) {
            var data = response.data;
            if (data && data.messages && data.messages.length) {
              var error = data.messages[0];
              if (error.type === 'FATAL') {
                return Promise.reject(error);
              } else {
                console.log(error.type + ': ' + error.text);
              }
            }

            return data;
          }).catch(handleSplunkApiRequestError);
        }
      }]);

      return SplunkAPI;
    }();

    return SplunkAPI;
  }

  _export('splunkAPIFactory', splunkAPIFactory);

  function handleSplunkApiRequestError(err) {
    if (err.cancelled) {
      err = err.err;
      err.cancelled = true;
    }

    if (err.status !== 0 || err.status >= 300) {
      if (err.data && err.data.messages && err.data.messages.length) {
        var message = err.data.messages[0];
        return Promise.reject({
          message: 'Splunk Error: ' + message.type + ' ' + message.text,
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

  function isGeneratingCommand(query) {
    return GENERATING_COMMAND_PATTERN.test(query);
  }

  function formatSearch(query) {
    if (isGeneratingCommand(query)) {
      return query;
    } else {
      return 'search ' + query;
    }
  }

  _export('formatSearch', formatSearch);

  return {
    setters: [function (_angular) {
      angular = _angular.default;
    }, function (_lodash) {
      _ = _lodash.default;
    }],
    execute: function () {
      _createClass = function () {
        function defineProperties(target, props) {
          for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
          }
        }

        return function (Constructor, protoProps, staticProps) {
          if (protoProps) defineProperties(Constructor.prototype, protoProps);
          if (staticProps) defineProperties(Constructor, staticProps);
          return Constructor;
        };
      }();

      GENERATING_COMMAND_PATTERN = /^\s*\|/;
      angular.module('grafana.services').factory('SplunkAPI', splunkAPIFactory);
    }
  };
});
//# sourceMappingURL=splunk_api.js.map
