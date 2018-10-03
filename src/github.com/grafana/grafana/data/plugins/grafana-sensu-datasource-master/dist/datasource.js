"use strict";

System.register(["angular", "lodash", "app/core/utils/datemath", "app/core/utils/kbn"], function (_export, _context) {
  "use strict";

  var angular, _, dateMath, kbn, _typeof, _createClass, SensuDatasource;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  return {
    setters: [function (_angular) {
      angular = _angular.default;
    }, function (_lodash) {
      _ = _lodash.default;
    }, function (_appCoreUtilsDatemath) {
      dateMath = _appCoreUtilsDatemath.default;
    }, function (_appCoreUtilsKbn) {
      kbn = _appCoreUtilsKbn.default;
    }],
    execute: function () {
      _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
        return typeof obj;
      } : function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };

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

      _export("SensuDatasource", SensuDatasource = function () {
        function SensuDatasource(instanceSettings, $q, backendSrv, templateSrv) {
          _classCallCheck(this, SensuDatasource);

          this.type = instanceSettings.type;
          this.url = instanceSettings.url;
          this.name = instanceSettings.name;
          this.basicAuth = instanceSettings.basicAuth;
          this.withCredentials = instanceSettings.withCredentials;
          this.q = $q;
          this.backendSrv = backendSrv;
          this.templateSrv = templateSrv;
        }

        // Required for templating
        // gets the clients from Sensu API
        // https://sensuapp.org/docs/0.26/api/clients-api.html

        /**
         * [metricFindQuery description]
         * @param  {[type]} options [description]
         * @return {[type]}         [description]
         */


        _createClass(SensuDatasource, [{
          key: "metricFindQuery",
          value: function metricFindQuery(options) {
            //console.log("metricFindQuery entered");
            return this.backendSrv.datasourceRequest({
              url: this.url + '/clients',
              data: options,
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                "Authorization": this.basicAuth
              }
            }).then(this.mapToClientNameAndVersion);
          }
        }, {
          key: "mapToClientNameAndVersion",
          value: function mapToClientNameAndVersion(result) {
            return _.map(result.data, function (d, i) {
              return {
                text: d.name,
                value: d.version
              };
            });
          }
        }, {
          key: "getClientNames",
          value: function getClientNames(dimensions) {
            var clients = [];
            for (var i = 0; i < dimensions.length; i++) {
              if (dimensions[i].dimensionType === 'clientName') {
                var aClientName = dimensions[i].value;
                clients.push(aClientName);
              }
            }
            return clients;
          }
        }, {
          key: "getCheckNames",
          value: function getCheckNames(dimensions) {
            var checks = [];
            for (var i = 0; i < dimensions.length; i++) {
              if (dimensions[i].dimensionType === 'checkName') {
                var aCheck = dimensions[i].value;
                checks.push(aCheck);
              }
            }
            return checks;
          }
        }, {
          key: "getAggregateNames",
          value: function getAggregateNames(dimensions) {
            var aggregates = [];
            for (var i = 0; i < dimensions.length; i++) {
              if (dimensions[i].dimensionType === 'aggregateName') {
                var anAggregate = dimensions[i].value;
                aggregates.push(anAggregate);
              }
            }
            return aggregates;
          }
        }, {
          key: "getQueryURIByType",
          value: function getQueryURIByType(target) {
            var uris = [];
            var dimensionURI = '/events';
            var clientNames = this.getClientNames(target.dimensions);
            var checkNames = this.getCheckNames(target.dimensions);
            var aggregateNames = this.getAggregateNames(target.dimensions);

            var aClientName = null;
            var aCheckName = null;
            var anAggregateName = null;
            switch (target.sourceType) {
              case 'events':
                // https://sensuapp.org/docs/0.26/api/events-api.html
                dimensionURI = '/events';
                aClientName = null;
                aCheckName = null;
                if (clientNames.length) {
                  for (var i = 0; i < clientNames.length; i++) {
                    aClientName = clientNames[i];
                    dimensionURI = '/events/' + aClientName;
                    uris.push(dimensionURI);
                  }
                }
                if (checkNames.length && clientNames.length) {
                  for (var _i = 0; _i < clientNames.length; _i++) {
                    aClientName = clientNames[_i];
                    for (var j = 0; j < checkNames.length; j++) {
                      aCheckName = checkNames[_i];
                      dimensionURI = '/events/' + aClientName + '/' + aCheckName;
                      uris.push(dimensionURI);
                    }
                  }
                }
                if (uris.length === 0) {
                  uris.push(dimensionURI);
                }
                break;
              case 'results_json':
              case 'results_table':
                // https://sensuapp.org/docs/0.26/api/results-api.html
                dimensionURI = '/results';
                if (clientNames.length) {
                  for (var _i2 = 0; _i2 < clientNames.length; _i2++) {
                    aClientName = clientNames[_i2];
                    dimensionURI = '/results/' + aClientName;
                    uris.push(dimensionURI);
                  }
                }
                if (checkNames.length && clientNames.length) {
                  for (var _i3 = 0; _i3 < clientNames.length; _i3++) {
                    aClientName = clientNames[_i3];
                    for (var _j = 0; _j < checkNames.length; _j++) {
                      aCheckName = checkNames[_i3];
                      dimensionURI = '/results/' + aClientName + '/' + aCheckName;
                      uris.push(dimensionURI);
                    }
                  }
                }
                if (uris.length === 0) {
                  uris.push(dimensionURI);
                }
                break;
              case 'aggregates':
                // https://sensuapp.org/docs/0.26/api/aggregates-api.html
                dimensionURI = '/aggregates';
                // name, name/clients, name/checks, name/results/severity
                if (aggregateNames.length) {
                  for (var _i4 = 0; _i4 < aggregateNames.length; _i4++) {
                    anAggregateName = aggregateNames[_i4];
                    dimensionURI = '/aggregates/' + anAggregateName;
                    switch (target.aggregateMode) {
                      case 'clients':
                        dimensionURI = '/aggregates/' + anAggregateName + '/clients';
                        break;
                      case 'checks':
                        dimensionURI = '/aggregates/' + anAggregateName + '/checks';
                        break;
                      case 'list':
                        dimensionURI = '/aggregates/' + anAggregateName;
                        break;
                    }
                    uris.push(dimensionURI);
                  }
                }
                if (uris.length === 0) {
                  uris.push(dimensionURI);
                }
                break;
              case 'clienthistory':
                // look for clientName in dimensions
                dimensionURI = '/clients';
                if (clientNames.length) {
                  for (var _i5 = 0; _i5 < clientNames.length; _i5++) {
                    aClientName = clientNames[_i5];
                    dimensionURI = '/clients/' + aClientName + '/history';
                    uris.push(dimensionURI);
                  }
                }
                if (uris.length === 0) {
                  uris.push(dimensionURI);
                }
                break;
            }

            return uris;
          }
        }, {
          key: "parseQueryResult",
          value: function parseQueryResult(aTarget, response) {
            var result = [];
            if (!response || !response.data) {
              return result;
            }
            switch (aTarget.sourceType) {
              case 'events':
                result = this.convertEventsToDataPoints(response);
                break;
              case 'results_json':
                result = this.convertResultsToJSON(response);
                break;
              case 'results_table':
                result = this.convertResultsToTable(response);
                break;
              case 'aggregates':
                result = this.convertAggregatesToDataPoints(response);
                break;
              case 'clienthistory':
                result = this.convertClientHistoryToDataPoints(response);
                break;
              default:
                console.log("Unknown source type");
                break;
            }
            return result;
          }
        }, {
          key: "convertEventsToDataPoints",
          value: function convertEventsToDataPoints(response) {
            // convert history to datapoints

            // the result has no "datapoints", need to create it based on the check data

            // when we have a checkname and an clientName, the response is different, the
            // data is not an array, but contains the same information, recreate and push
            if (response.data.length === undefined) {
              var singleData = response.data;
              response.data = [];
              response.data.push(singleData);
            }
            for (var i = 0; i < response.data.length; i++) {
              var anEvent = response.data[i];
              var datapoints = [];
              var startingTimestamp = 0;
              // an event with client param has a timestamp at the toplevel
              if (anEvent.timestamp !== undefined) {
                startingTimestamp = anEvent.timestamp - 60 * anEvent.check.history.length;
              }
              if (anEvent.last_execution !== undefined) {
                startingTimestamp = anEvent.last_execution - 60 * anEvent.history.length;
              }
              // time needs to be in MS, we get EPOCH from Sensu
              for (var y = 0; y < anEvent.check.history.length; y++) {
                datapoints[y] = [anEvent.check.history[y], (startingTimestamp + 60 * y) * 1000];
              }
              anEvent.datapoints = datapoints;
              // set the target to be the check name
              if (anEvent.check.name !== undefined) {
                anEvent.target = anEvent.check.name;
              } else {
                anEvent.target = anEvent.check;
              }
            }
            return response;
          }
        }, {
          key: "convertResultsToDataPoints",
          value: function convertResultsToDataPoints(response) {
            // the result has no "datapoints", need to create it based on the check data
            // when we have a checkname and an clientName, the response is different, the
            // data is not an array, but contains the same information, recreate and push
            if (response.data.length === undefined) {
              var singleData = response.data;
              response.data = [];
              response.data.push(singleData);
            }
            for (var i = 0; i < response.data.length; i++) {
              var anEvent = response.data[i];
              //var str = JSON.stringify(anEvent, null, 2);
              //console.log(str);
              var datapoints = [];
              if (anEvent.check.issued !== undefined) {
                datapoints[0] = [anEvent.check.status, anEvent.check.issued * 1000];
                // the duration is here...
                // datapoints[0] = [anEvent.check.duration, (anEvent.check.issued * 1000)];
              }
              anEvent.datapoints = datapoints;
              // set the target to be the check name
              if (anEvent.check.name !== undefined) {
                anEvent.target = anEvent.check.name;
              } else {
                anEvent.target = anEvent.check;
              }
            }
            return response;
          }
        }, {
          key: "convertResultsToTable",
          value: function convertResultsToTable(response) {
            // the result has no "datapoints", need to create it based on the check data
            // when we have a checkname and a clientName, the response is different, the
            // data is not an array, but contains the same information, recreate and push
            if (response.data.length === undefined) {
              var singleData = response.data;
              response.data = [];
              response.data.push(singleData);
            }
            // this will be collapsed into table format, where the columns are predefined
            // and each row is a response formatted to the columns
            var rowData = [];
            for (var i = 0; i < response.data.length; i++) {
              var rowInfo = response.data[i];
              var aRow = [rowInfo.check.issued * 1000, rowInfo.client, rowInfo.check.name, rowInfo.check.status, rowInfo.check.issued * 1000, rowInfo.check.executed * 1000, rowInfo.check.output, rowInfo.check.type, rowInfo.check.thresholds.warning, rowInfo.check.thresholds.critical];
              // now push into rowData
              rowData.push(aRow);
            }
            // collapse everything into data[0]
            var anEvent = response.data[0];
            var datapoints = [];
            datapoints[0] = [anEvent.check.status, anEvent.check.issued * 1000];
            anEvent.datapoints = datapoints;
            anEvent.type = "table";
            anEvent.columns = [{ text: 'Time', type: 'date' }, { text: 'client' }, { text: 'check.name' }, { text: 'check.status' }, { text: 'check.issued', type: 'date' }, { text: 'check.executed', type: 'date' }, { text: 'check.output' }, { text: 'check.type' }, { text: 'check.thresholds.warning' }, { text: 'check.thresholds.critical' }];
            anEvent.rows = rowData;
            // truncate the rest
            response.data = [anEvent];
            //var str = JSON.stringify(response, null, 2);
            //console.log(str);
            return response;
          }
        }, {
          key: "convertResultsToJSON",
          value: function convertResultsToJSON(response) {
            for (var i = 0; i < response.data.length; i++) {
              var anEvent = response.data[i];
              var datapoints = [];
              if (anEvent.check.issued !== undefined) {
                var data = {
                  timestamp: anEvent.check.issued * 1000,
                  message: anEvent.check.name,
                  client: anEvent.client,
                  check: {
                    name: anEvent.check.name,
                    issued: anEvent.check.issued * 1000,
                    executed: anEvent.check.executed * 1000,
                    output: anEvent.check.output,
                    status: anEvent.check.status,
                    type: anEvent.check.type
                  }
                };
                datapoints.push(data);
                anEvent.datapoints = datapoints;
                delete anEvent.check;
                delete anEvent.client;
                anEvent.type = 'docs';
              }
            }
            //var str = JSON.stringify(response, null, 2);
            //console.log(str);
            return response;
          }
        }, {
          key: "convertAggregatesToDataPoints",
          value: function convertAggregatesToDataPoints(response) {
            // convert history to datapoints

            // the result has no "datapoints", need to create it based on the check data

            // when we have a checkname and an clientName, the response is different, the
            // data is not an array, but contains the same information, recreate and push
            if (response.data.length === undefined) {
              var singleData = response.data;
              response.data = [];
              response.data.push(singleData);
            }
            // storage for new data series constructed by aggregate responses
            var newData = null;
            for (var i = 0; i < response.data.length; i++) {
              var anEvent = response.data[i];
              if (anEvent.checks !== undefined) {
                // create a new block of datapoints for each aggregate result json entry
                //
                var checkType = _typeof(anEvent.checks);
                switch (checkType) {
                  case 'number':
                    // checks is a number, this is an aggregate list response
                    newData = this.convertEventDataToAggregateList(anEvent, newData);
                    break;
                  case 'object':
                    // check is an object, which is an aggregate clients response
                    newData = this.convertEventDataToAggregateClient(anEvent, newData);
                    break;
                }
                continue;
              }
              if (anEvent.clients !== undefined) {
                newData = this.convertEventDataToAggregateChecks(anEvent, newData);
                continue;
              }

              // this is a simple aggregate response (no mode)
              var datapoints = [];
              // timestamp is the query now (just use now)
              var timestamp = Math.floor(Date.now());
              datapoints[0] = [0, timestamp];
              anEvent.datapoints = datapoints;
              // set the target to be the name of the aggregate
              anEvent.target = anEvent.name;
            }
            if (newData !== null) {
              // overwrite the old data field with the new expanded set
              response.data = newData;
            }
            return response;
          }
        }, {
          key: "convertEventDataToAggregateChecks",
          value: function convertEventDataToAggregateChecks(anEvent, dataSet) {
            var timestamp = Math.floor(Date.now());
            if (dataSet === null) {
              // initialize empty array
              dataSet = [];
            }
            // iterate over the checks
            for (var i = 0; i < anEvent.clients.length; i++) {
              var clientName = anEvent.clients[i];
              var checkData = {
                target: anEvent.name,
                datapoints: [[clientName, timestamp]]
              };
              dataSet.push(checkData);
            }
            return dataSet;
          }
        }, {
          key: "convertEventDataToAggregateClient",
          value: function convertEventDataToAggregateClient(anEvent, dataSet) {
            var timestamp = Math.floor(Date.now());
            if (dataSet === null) {
              // initialize empty array
              dataSet = [];
            }
            // iterate over the checks
            for (var i = 0; i < anEvent.checks.length; i++) {
              var checkName = anEvent.checks[i];
              var clientData = {
                target: anEvent.name,
                datapoints: [[checkName, timestamp]]
              };
              dataSet.push(clientData);
            }
            return dataSet;
          }
        }, {
          key: "convertEventDataToAggregateList",
          value: function convertEventDataToAggregateList(anEvent, dataSet) {
            if (dataSet === null) {
              // initialize empty array
              dataSet = [];
            }
            var timestamp = Math.floor(Date.now());
            var item = {
              target: 'checks',
              datapoints: [[anEvent.checks, timestamp]]
            };
            dataSet.push(item);
            item = {
              target: 'clients',
              datapoints: [[anEvent.clients, timestamp]]
            };
            dataSet.push(item);
            item = {
              target: 'critical',
              datapoints: [[anEvent.results.critical, timestamp]]
            };
            dataSet.push(item);
            item = {
              target: 'ok',
              datapoints: [[anEvent.results.ok, timestamp]]
            };
            dataSet.push(item);
            item = {
              target: 'stale',
              datapoints: [[anEvent.results.stale, timestamp]]
            };
            dataSet.push(item);
            item = {
              target: 'total',
              datapoints: [[anEvent.results.total, timestamp]]
            };
            dataSet.push(item);
            item = {
              target: 'unknown',
              datapoints: [[anEvent.results.unknown, timestamp]]
            };
            dataSet.push(item);
            item = {
              target: 'warning',
              datapoints: [[anEvent.results.warning, timestamp]]
            };
            dataSet.push(item);

            return dataSet;
          }
        }, {
          key: "convertClientHistoryToDataPoints",
          value: function convertClientHistoryToDataPoints(response) {
            // the result has no "datapoints", need to create it based on the check data
            // when we have a checkname and an clientName, the response is different, the
            // data is not an array, but contains the same information, recreate and push
            //if (response.data.length === undefined) {
            //  var singleData = response.data;
            //  response.data = [];
            //  response.data.push(singleData);
            //}
            for (var i = 0; i < response.data.length; i++) {
              var anEvent = response.data[i];
              var datapoints = [];
              var startingTimestamp = 0;
              if (anEvent.last_execution !== undefined) {
                startingTimestamp = anEvent.last_execution - 60 * anEvent.history.length;
              }
              // time needs to be in MS, we get EPOCH from Sensu
              if (anEvent.history !== undefined) {
                for (var y = 0; y < anEvent.history.length; y++) {
                  datapoints[y] = [anEvent.history[y], (startingTimestamp + 60 * y) * 1000];
                }
              }
              anEvent.datapoints = datapoints;
              // set the target to be the check name
              anEvent.target = 'unknown';
              if (anEvent.name !== undefined) {
                anEvent.target = anEvent.name;
              }
              if (anEvent.check !== undefined) {
                anEvent.target = anEvent.check;
              }
            }
            return response;
          }
        }, {
          key: "getCheckInterval",
          value: function getCheckInterval(client, checkName) {}
          // http://10.227.86.62/results/default-oel-67-x86-64/keepalive
          /* The check may not have interval defined, which means it is defaulted to 60 seconds
          {
            "client": "default-oel-67-x86-64",
            "check": {
              "thresholds": {
                "warning": 120,
                "critical": 180
              },
              "name": "keepalive",
              "issued": 1476277039,
              "executed": 1476277039,
              "output": "No keepalive sent from client for 40860 seconds (>=180)",
              "status": 2,
              "type": "standard"
            }
          }
           */


          /**
           * [dimensionFindValues description]
           * @param  {[type]} target    [description]
           * @param  {[type]} dimension [description]
           * @return {[type]}           [description]
           */

        }, {
          key: "dimensionFindValues",
          value: function dimensionFindValues(target, dimension) {
            var dimensionURI = '/clients';

            switch (dimension.dimensionType) {
              case 'clientName':
                dimensionURI = '/clients';
                break;
              case 'checkName':
                dimensionURI = '/checks';
                break;
              case 'aggregateName':
                dimensionURI = '/aggregates';
                break;
            }
            return this.backendSrv.datasourceRequest({
              url: this.url + dimensionURI,
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                "Authorization": this.basicAuth
              }
            }).then(this.mapToTextValue);
          }
        }, {
          key: "mapToTextValue",
          value: function mapToTextValue(result) {
            return _.map(result.data, function (d, i) {
              return {
                text: d.name,
                value: d.name
              };
            });
          }
        }, {
          key: "queryWorks",
          value: function queryWorks(options) {
            //console.log("query entered");
            var queries = [];
            var _this = this;
            var singleTarget = null;
            options.targets.forEach(function (target) {
              singleTarget = target;
              if (target.hide || !target.target) {
                return;
              }
            });
            var fullQuery = queries.join(',');
            var interval = options.interval;
            //console.log("options interval = " + interval);
            if (kbn.interval_to_ms(interval) < this.minimumInterval) {
              // console.log("Detected interval smaller than allowed: " + interval);
              interval = kbn.secondsToHms(this.minimumInterval / 1000);
              // console.log("New Interval: " + interval);
            }
            //console.log("interval after min check = " + interval);
            var deferred = this.q.defer();
            var response = this.singleDataQuery(singleTarget);
            if (response !== null) {
              deferred.resolve(response);
            } else {
              console.error('Unable to load data.');
              var error = new Error("Unable to load data");
              deferred.reject(error);
            }
            return deferred.promise;
          }
        }, {
          key: "query",
          value: function query(options) {
            //console.log("query entered");
            var queries = [];
            var _this = this;
            var singleTarget = null;
            options.targets.forEach(function (target) {
              // TODO handle hide and no target specified
              //if (target.hide || !target.target) {
              //  continue;
              //}
              queries.push(target);
            });
            var interval = options.interval;
            //console.log("options interval = " + interval);
            if (kbn.interval_to_ms(interval) < this.minimumInterval) {
              // console.log("Detected interval smaller than allowed: " + interval);
              interval = kbn.secondsToHms(this.minimumInterval / 1000);
              // console.log("New Interval: " + interval);
            }
            //console.log("interval after min check = " + interval);
            var deferred = this.q.defer();

            // if there are no queries, return empty data
            if (queries.length === 0) {
              // console.log("no tags visible or specified, no data to fetch");
              deferred.resolve({
                data: []
              });
              return deferred.promise;
            }
            var allQueries = this.q.all({
              first: _this.multipleDataQueries(queries)
            });
            allQueries.then(function (results) {
              // return results from queries
              deferred.resolve(results.first);
            });
            return deferred.promise;
          }
        }, {
          key: "singleDataQuery",
          value: function singleDataQuery(singleTarget, uriType) {
            //console.log("singleDataQuery entered");
            var _this = this;
            var deferred = this.q.defer();
            var params = {};
            var httpOptions = {
              method: 'GET',
              url: this.url + uriType,
              params: params,
              headers: {
                'Content-Type': 'application/json',
                "Authorization": this.basicAuth
              }
            };
            this.backendSrv.datasourceRequest(httpOptions).then(function (response) {
              var anError = null;
              if (response.status !== 200) {
                console.log("error...");
                anError = new Error("Bad Status: " + response.status);
                deferred.reject(anError);
              }
              if (!response.data) {
                anError = new Error("No data");
                deferred.reject(anError);
              }
              deferred.resolve(_this.parseQueryResult(singleTarget, response));
            }, function (response) {
              console.error('Unable to load data. Response: %o', response.data ? response.data.message : response);
              var error = new Error("Unable to load data");
              deferred.reject(error);
            });

            return deferred.promise;
          }
        }, {
          key: "multipleDataQueries",
          value: function multipleDataQueries(pendingQueries) {
            var deferred = this.q.defer();
            var dataCalls = [];
            var _this = this;
            // for each query, we get a list of sensu uris' to hit
            // to retrieve the data
            angular.forEach(pendingQueries, function (aTarget) {
              var uriList = _this.getQueryURIByType(aTarget);
              for (var i = 0; i < uriList.length; i++) {
                dataCalls.push(_this.singleDataQuery(aTarget, uriList[i]));
              }
            });
            this.q.all(dataCalls).then(function (results) {
              var response = {
                data: []
              };
              // merge all of the results into one response
              angular.forEach(results, function (result) {
                angular.forEach(result.data, function (dataSet) {
                  response.data.push(dataSet);
                });
              });
              deferred.resolve(response);
            }, function (errors) {
              deferred.reject(errors);
            }, function (updates) {
              deferred.update(updates);
            });
            return deferred.promise;
          }
        }, {
          key: "testDatasource",
          value: function testDatasource() {
            return this.backendSrv.datasourceRequest({
              url: this.url + '/info',
              headers: {
                'Content-Type': 'application/json',
                "Authorization": this.basicAuth
              },
              method: 'GET'
            }).then(function (response) {
              if (response.status === 200) {
                return {
                  status: "success",
                  message: "Data source is working",
                  title: "Success"
                };
              }
            });
          }
        }]);

        return SensuDatasource;
      }());

      _export("SensuDatasource", SensuDatasource);
    }
  };
});
//# sourceMappingURL=datasource.js.map
