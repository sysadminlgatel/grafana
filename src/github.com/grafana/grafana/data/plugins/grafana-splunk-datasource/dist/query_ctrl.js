'use strict';

System.register(['lodash', 'app/plugins/sdk', './query_builder', './query_def'], function (_export, _context) {
  "use strict";

  var _, QueryCtrl, SplunkQueryBuilder, queryDef, _createClass, DEFAULT_INDEX, DEFAULT_SOURCETYPE, DEFAULT_FIELD, SplunkQueryCtrl;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _possibleConstructorReturn(self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  }

  function getSourceId(index, sourcetype) {
    return index + '&' + sourcetype;
  }

  function isTargetSet(target) {
    var isMetricSet = _.every(target.metricAggs, function (agg) {
      return agg.field !== DEFAULT_FIELD;
    });

    return isMetricSet && target.index !== DEFAULT_INDEX && target.sourcetype !== DEFAULT_SOURCETYPE;
  }

  function isSourceSet(target) {
    return target.index !== DEFAULT_INDEX && target.sourcetype !== DEFAULT_SOURCETYPE;
  }

  function getAppsTypeAhead() {
    return this.metrics.apps;
  }

  return {
    setters: [function (_lodash) {
      _ = _lodash.default;
    }, function (_appPluginsSdk) {
      QueryCtrl = _appPluginsSdk.QueryCtrl;
    }, function (_query_builder) {
      SplunkQueryBuilder = _query_builder.SplunkQueryBuilder;
    }, function (_query_def) {
      queryDef = _query_def.default;
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

      DEFAULT_INDEX = 'select index';
      DEFAULT_SOURCETYPE = 'select sourcetype';
      DEFAULT_FIELD = 'select field';

      _export('SplunkQueryCtrl', SplunkQueryCtrl = function (_QueryCtrl) {
        _inherits(SplunkQueryCtrl, _QueryCtrl);

        function SplunkQueryCtrl($scope, $injector, uiSegmentSrv, templateSrv) {
          _classCallCheck(this, SplunkQueryCtrl);

          var _this = _possibleConstructorReturn(this, (SplunkQueryCtrl.__proto__ || Object.getPrototypeOf(SplunkQueryCtrl)).call(this, $scope, $injector));

          _this.scope = $scope;
          _this.uiSegmentSrv = uiSegmentSrv;
          _this.templateSrv = templateSrv;
          _this.ds = _this.datasource;

          _this.getFieldsPromise = {};

          var target_defaults = {
            rawQuery: true,
            query: '',
            namespace: '',
            resultFormat: 'time_series',
            index: DEFAULT_INDEX,
            sourcetype: DEFAULT_SOURCETYPE,
            metricAggs: [{ func: 'avg', field: DEFAULT_FIELD, alias: '' }],
            splitByFields: [],
            whereClause: {
              type: null,
              agg: 'avg',
              condition: '',
              operator: '',
              value: ''
            },
            tcOptions: {
              span: 'auto',
              useother: true,
              otherstr: '',
              usenull: false,
              nullstr: ''
            },
            binOptions: {
              bins: null
            },
            options: {
              limit: null,
              cont: true,
              partial: true
            }
          };
          _.defaultsDeep(_this.target, target_defaults);

          _this.resultFormats = [{ text: 'Time series', value: 'time_series' }, { text: 'Table', value: 'table' }];

          // Build segments
          _this.removeSegment = uiSegmentSrv.newSegment({ fake: true, value: '-- remove --' });
          _this.splitBySegments = _.map(_this.target.splitByFields, uiSegmentSrv.newSegment);
          _this.buildWhereSegments();
          _this.fixSplitBySegments();

          _this.metrics = {
            indexes: [],
            sourcetypes: [],
            apps: [],
            fields: {}
          };

          if (!_this.target.rawQuery) {
            _this.updateSuggestions();
            _this.renderOptions();
          } else {
            _this.getApps();
          }

          _this.getAppsTypeAhead = _.bind(getAppsTypeAhead, _this);
          return _this;
        }

        ////////////////////////
        // Metric suggestions //
        ////////////////////////

        _createClass(SplunkQueryCtrl, [{
          key: 'getIndex',
          value: function getIndex() {
            var _this2 = this;

            var getIndexesPromise = void 0;
            if (this.metrics.indexes.length) {
              getIndexesPromise = Promise.resolve(this.metrics.indexes);
            } else {
              getIndexesPromise = this.ds.getIndexes();
            }

            return getIndexesPromise.then(function (indexes) {
              _this2.metrics.indexes = indexes;
              return indexes;
            });
          }
        }, {
          key: 'getSourcetype',
          value: function getSourcetype() {
            var _this3 = this;

            var getSourcetypePromise = void 0;
            if (this.metrics.sourcetypes.length) {
              getSourcetypePromise = Promise.resolve(this.metrics.sourcetypes);
            } else {
              getSourcetypePromise = this.ds.getSourcetypes();
            }

            return getSourcetypePromise.then(function (sourcetypes) {
              _this3.metrics.sourcetypes = sourcetypes;
              return sourcetypes;
            });
          }
        }, {
          key: 'getApps',
          value: function getApps() {
            var _this4 = this;

            var getAppsPromise = void 0;
            if (this.metrics.apps.length) {
              getAppsPromise = Promise.resolve(this.metrics.apps);
            } else {
              getAppsPromise = this.ds.getApps();
            }

            return getAppsPromise.then(function (apps) {
              _this4.metrics.apps = _.map(apps, 'name');
              return apps;
            });
          }
        }, {
          key: 'getFields',
          value: function getFields() {
            var _this5 = this;

            var _target = this.target,
                index = _target.index,
                sourcetype = _target.sourcetype;

            var sourceId = getSourceId(index, sourcetype);
            var getFieldsPromise = void 0;

            if (this.getFieldsPromise[sourceId]) {
              getFieldsPromise = this.getFieldsPromise[sourceId];
            } else {
              if (this.metrics.fields[sourceId] && this.metrics.fields[sourceId].length) {
                getFieldsPromise = Promise.resolve(this.metrics.fields[sourceId]);
              } else {
                var timeFrom = this.panelCtrl.range.from.unix();
                var timeTo = this.panelCtrl.range.to.unix();

                getFieldsPromise = this.ds.getFields(index, sourcetype, timeFrom, timeTo);
              }
              this.getFieldsPromise[sourceId] = getFieldsPromise;
            }

            return getFieldsPromise.then(function (fields) {
              _this5.getFieldsPromise[sourceId] = null;
              _this5.metrics.fields[sourceId] = fields;
              return fields;
            }).catch(function () {
              _this5.getFieldsPromise[sourceId] = null;
            });
          }
        }, {
          key: 'getIndexSegments',
          value: function getIndexSegments() {
            return this.getIndex().then(function (indexes) {
              return indexes.map(function (index) {
                return { text: index.name, value: index.name };
              });
            });
          }
        }, {
          key: 'getSourcetypeSegments',
          value: function getSourcetypeSegments() {
            return this.getSourcetype().then(function (sourcetypes) {
              return sourcetypes.map(function (sourcetype) {
                return { text: sourcetype.name, value: sourcetype.name };
              });
            });
          }
        }, {
          key: 'getFieldSegments',
          value: function getFieldSegments() {
            return this.getFields().then(function (fields) {
              return fields.map(function (field) {
                return { text: field, value: field };
              });
            }).then(this.uiSegmentSrv.transformToSegments(true));
          }
        }, {
          key: 'updateSuggestions',
          value: function updateSuggestions() {
            this.getApps();
            this.getIndex();
            this.getSourcetype();
            this.getFields();
          }
        }, {
          key: 'getMetricAggTypes',
          value: function getMetricAggTypes() {
            return queryDef.getMetricAggTypes();
          }
        }, {
          key: 'getSplitBySegment',
          value: function getSplitBySegment() {
            var _this6 = this;

            return this.getFieldSegments().then(this.uiSegmentSrv.transformToSegments(false)).then(function (segments) {
              segments.splice(0, 0, _.cloneDeep(_this6.removeSegment));
              return segments;
            });
          }
        }, {
          key: 'getWhereSegment',
          value: function getWhereSegment(index) {
            var _this7 = this;

            var getOptions = void 0;
            if (index === 0) {
              getOptions = Promise.resolve(queryDef.getWhereOptions());
            } else {
              getOptions = Promise.resolve(queryDef.getWhereConditions());
            }

            return getOptions.then(this.uiSegmentSrv.transformToSegments(false)).then(function (segments) {
              if (_this7.target.whereClause.type && index === 0) {
                segments.splice(0, 0, _.cloneDeep(_this7.removeSegment));
              }
              return segments;
            });
          }
        }, {
          key: 'getSpan',
          value: function getSpan() {
            return Promise.resolve(queryDef.getSpanOptions());
          }
        }, {
          key: 'onChangeInternal',
          value: function onChangeInternal() {
            this.refresh();
          }
        }, {
          key: 'toggleEditorMode',
          value: function toggleEditorMode() {
            this.target.rawQuery = !this.target.rawQuery;
          }
        }, {
          key: 'getCollapsedText',
          value: function getCollapsedText() {
            if (this.target.rawQuery) {
              return this.target.query;
            } else {
              return SplunkQueryBuilder.build(this.target);
            }
          }
        }, {
          key: 'toggleShowMetric',
          value: function toggleShowMetric(agg) {
            agg.hide = !agg.hide;
            this.onChangeInternal();
          }
        }, {
          key: 'toggleOptions',
          value: function toggleOptions() {
            this.showOptions = !this.showOptions;
          }
        }, {
          key: 'onOptionChange',
          value: function onOptionChange() {
            this.renderOptions();
            this.onChangeInternal();
          }
        }, {
          key: 'renderOptions',
          value: function renderOptions() {
            var _target2 = this.target,
                options = _target2.options,
                tcOptions = _target2.tcOptions,
                binOptions = _target2.binOptions;

            this.settingsLinkText = SplunkQueryBuilder.renderOptions(tcOptions, binOptions, options);
          }
        }, {
          key: 'onMetricChange',
          value: function onMetricChange() {
            if (isTargetSet(this.target)) {
              this.getFields();
              this.onChangeInternal();
            }
          }
        }, {
          key: 'onSourceChange',
          value: function onSourceChange() {
            if (isSourceSet(this.target)) {
              this.getFields();
            }
          }
        }, {
          key: 'onResultFormatChange',
          value: function onResultFormatChange() {
            this.splitBySegments = _.map(this.target.splitByFields, this.uiSegmentSrv.newSegment);
            this.fixSplitBySegments();
            this.onChangeInternal();
          }
        }, {
          key: 'addMetricAgg',
          value: function addMetricAgg() {
            this.target.metricAggs.push({ func: 'avg', field: 'value' });
            this.onChangeInternal();
          }
        }, {
          key: 'removeMetricAgg',
          value: function removeMetricAgg(index) {
            this.target.metricAggs.splice(index, 1);
            this.onChangeInternal();
          }
        }, {
          key: 'disableWhereEditor',
          value: function disableWhereEditor() {
            return this.target.splitByFields.length === 0 || this.target.metricAggs.length > 1;
          }
        }, {
          key: 'splitBySegmentChanged',
          value: function splitBySegmentChanged(segment, index) {
            var _this8 = this;

            if (segment.type === 'plus-button') {
              segment.type = undefined;
            }
            this.target.splitByFields = _.map(_.filter(this.splitBySegments, function (segment) {
              return segment.type !== 'plus-button' && segment.value !== _this8.removeSegment.value;
            }), 'value');
            this.splitBySegments = _.map(this.target.splitByFields, this.uiSegmentSrv.newSegment);

            if (segment.value === this.removeSegment.value) {
              this.splitBySegments.splice(index, 1);
            }

            this.fixSplitBySegments();
            this.onChangeInternal();
          }
        }, {
          key: 'buildWhereSegments',
          value: function buildWhereSegments() {
            this.whereSegments = [];
            if (this.target.whereClause.type === 'wherein') {
              var operatorSegment = this.uiSegmentSrv.newSegment({ value: this.target.whereClause.operator, expandable: false });
              var conditionSegment = this.uiSegmentSrv.newSegment({ value: this.target.whereClause.condition, expandable: false });

              this.whereSegments.push(operatorSegment);
              this.whereSegments.push(conditionSegment);
            } else if (this.target.whereClause.type === 'wherethresh') {
              var _operatorSegment = this.uiSegmentSrv.newSegment({ value: this.target.whereClause.operator, expandable: false });

              this.whereSegments.push(_operatorSegment);
            } else {
              this.whereSegments.push(this.uiSegmentSrv.newPlusButton());
            }
          }
        }, {
          key: 'whereSegmentChanged',
          value: function whereSegmentChanged() {
            if (this.whereSegments[0].value === this.removeSegment.value) {
              this.target.whereClause = {
                type: null,
                agg: 'avg',
                condition: '',
                operator: '',
                value: ''
              };
              this.whereSegments = [];
              this.whereSegments.push(this.uiSegmentSrv.newPlusButton());
            } else if (_.includes(['in', 'notin'], this.whereSegments[0].value)) {
              this.target.whereClause.type = 'wherein';

              if (this.whereTypeChanged(this.whereSegments[0])) {
                this.whereSegments.splice(1, 2);
                var conditionSegment = this.uiSegmentSrv.newSegment({ value: 'top', expandable: false });
                this.whereSegments.push(conditionSegment);

                this.target.whereClause.operator = this.whereSegments[0].value;
                this.target.whereClause.condition = this.whereSegments[1].value;

                // Set default top5
                if (!this.target.whereClause.value) {
                  this.target.whereClause.value = 5;
                }
              } else if (this.whereSegments[0].value !== this.target.whereClause.operator) {
                this.target.whereClause.operator = this.whereSegments[0].value;
              } else if (this.whereSegments[1].value !== this.target.whereClause.condition) {
                this.target.whereClause.condition = this.whereSegments[1].value;
              }
            } else if (_.includes(['<', '>'], this.whereSegments[0].value)) {
              this.target.whereClause.type = 'wherethresh';

              if (this.whereTypeChanged(this.whereSegments[0])) {
                this.whereSegments.splice(1, 2);
                this.target.whereClause.operator = this.whereSegments[0].value;
              } else if (this.whereSegments[0].value !== this.target.whereClause.operator) {
                this.target.whereClause.operator = this.whereSegments[0].value;
              }
            }
            this.onChangeInternal();
          }
        }, {
          key: 'whereTypeChanged',
          value: function whereTypeChanged(operatorSegment) {
            return _.includes(['in', 'notin'], operatorSegment.value) && !_.includes(['in', 'notin'], this.target.whereClause.operator) || _.includes(['<', '>'], operatorSegment.value) && !_.includes(['<', '>'], this.target.whereClause.operator);
          }
        }, {
          key: 'fixSplitBySegments',
          value: function fixSplitBySegments() {
            if (this.target.resultFormat === 'time_series') {
              this.fixTCSplitBySegments();
            } else {
              this.fixSegments(this.splitBySegments);
            }
          }
        }, {
          key: 'fixTCSplitBySegments',
          value: function fixTCSplitBySegments() {
            if (this.splitBySegments.length === 0) {
              this.splitBySegments.push(this.uiSegmentSrv.newPlusButton());
            } else {
              // Split by in timechart supports only one field
              this.splitBySegments = this.splitBySegments.slice(0, 1);
            }
          }
        }, {
          key: 'fixSegments',
          value: function fixSegments(segments) {
            var count = segments.length;
            var lastSegment = segments[Math.max(count - 1, 0)];

            if (!lastSegment || lastSegment.type !== 'plus-button') {
              segments.push(this.uiSegmentSrv.newPlusButton());
            }
          }
        }]);

        return SplunkQueryCtrl;
      }(QueryCtrl));

      _export('SplunkQueryCtrl', SplunkQueryCtrl);

      SplunkQueryCtrl.templateUrl = 'partials/query.editor.html';
    }
  };
});
//# sourceMappingURL=query_ctrl.js.map
