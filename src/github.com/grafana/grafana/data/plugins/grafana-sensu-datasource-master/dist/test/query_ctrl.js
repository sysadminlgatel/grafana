"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SensuDatasourceQueryCtrl = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _angular = require("angular");

var _angular2 = _interopRequireDefault(_angular);

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _sdk = require("app/plugins/sdk");

require("./css/query-editor.css!");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SensuDatasourceQueryCtrl = exports.SensuDatasourceQueryCtrl = function (_QueryCtrl) {
  _inherits(SensuDatasourceQueryCtrl, _QueryCtrl);

  function SensuDatasourceQueryCtrl($scope, $injector, templateSrv, uiSegmentSrv) {
    _classCallCheck(this, SensuDatasourceQueryCtrl);

    var _this = _possibleConstructorReturn(this, (SensuDatasourceQueryCtrl.__proto__ || Object.getPrototypeOf(SensuDatasourceQueryCtrl)).call(this, $scope, $injector));

    _this.scope = $scope;
    _this.uiSegmentSrv = uiSegmentSrv;
    _this.templateSrv = templateSrv;
    // source types for the popdown
    _this.sourceTypes = [{
      text: 'Aggregates',
      value: 'aggregates'
    }, {
      text: 'Check Subscriptions',
      value: 'check_subscriptions'
    }, {
      text: 'Clients',
      value: 'clients_json'
    }, {
      text: 'Client History',
      value: 'clienthistory'
    }, {
      text: 'Events',
      value: 'events'
    }, {
      text: 'Results as JSON',
      value: 'results_json'
    }, {
      text: 'Results as Table',
      value: 'results_table'
    }, {
      text: 'Sensu Health',
      value: 'sensu_health_json'
    }, {
      text: 'Silenced Entries',
      value: 'silenced_entries_json'
    }, {
      text: 'Stashes',
      value: 'stashes_json'
    }];

    // Each source type have different dimensions
    _this.dimensionTypes = {
      events: [{
        text: 'Client Name',
        value: 'clientName'
      }, {
        text: 'Check Name',
        value: 'checkName'
      }],
      results_json: [{
        text: 'Client Name',
        value: 'clientName'
      }, {
        text: 'Check Name',
        value: 'checkName'
      }],
      results_table: [{
        text: 'Client Name',
        value: 'clientName'
      }, {
        text: 'Check Name',
        value: 'checkName'
      }],
      aggregates: [{
        text: 'Aggregate Name',
        value: 'aggregateName'
      }],
      clienthistory: [{
        text: 'Client Name',
        value: 'clientName'
      }]
    };

    _this.aggregateModes = [{
      text: 'List',
      value: 'list'
    }, {
      text: 'Clients',
      value: 'clients'
    }, {
      text: 'Checks',
      value: 'checks'
    }];

    _this.target.aggregateMode = _this.target.aggregateMode || 'list';
    // default source type is events
    _this.target.sourceType = _this.target.sourceType || 'events';
    // no dimensions initially
    _this.target.dimensions = _this.target.dimensions || [];
    return _this;
  }

  /**
   * [removeDimension description]
   * @param  {[type]} dimension [description]
   * @return {[type]}           [description]
   */


  _createClass(SensuDatasourceQueryCtrl, [{
    key: "removeDimension",
    value: function removeDimension(dimension) {
      if (this.target.dimensions) {
        this.target.dimensions.splice(this.target.dimensions.indexOf(dimension), 1);
        this.panelCtrl.refresh();
      }
    }

    /**
     * [addDimension description]
     */

  }, {
    key: "addDimension",
    value: function addDimension() {
      if (!this.target.dimensions) {
        this.target.dimensions = [];
      }
      var dimensionsForSourceType = this.dimensionTypes[this.target.sourceType];
      var defaultDimensionType = dimensionsForSourceType[0].value;
      this.target.dimensions.push({
        name: null,
        value: null,
        dimensionType: defaultDimensionType
      });
    }

    /**
     * [getDimensionValues description]
     * @param  {[type]} dimension [description]
     * @return {[type]}           [description]
     */

  }, {
    key: "getDimensionValues",
    value: function getDimensionValues(dimension) {
      if (dimension) {
        //console.log("have a dimension, getting available values");
        return this.datasource.dimensionFindValues(this.target, dimension).then(this.uiSegmentSrv.transformToSegments(true));
      }
    }

    /**
     * [getOptions description]
     * @return {[type]} [description]
     */

  }, {
    key: "getOptions",
    value: function getOptions() {
      return this.datasource.metricFindQuery(this.target).then(this.uiSegmentSrv.transformToSegments(true));
      // Options have to be transformed by uiSegmentSrv to be usable by metric-segment-model directive
    }

    /**
     * [sourceTypeChanged description]
     * @return {[type]} [description]
     */

  }, {
    key: "sourceTypeChanged",
    value: function sourceTypeChanged() {
      // reset dimensions
      if (this.target.dimensions) {
        this.target.dimensions = [];
      }
      this.onChangeInternal();
    }

    /**
     * [aggregateModeChanged description]
     * @return {[type]} [description]
     */

  }, {
    key: "aggregateModeChanged",
    value: function aggregateModeChanged() {
      //console.log("Aggregate Mode is now " + this.target.aggregateMode);
      this.onChangeInternal();
    }

    /**
     * [onChangeInternal description]
     * @return {[type]} [description]
     */

  }, {
    key: "onChangeInternal",
    value: function onChangeInternal() {
      this.panelCtrl.refresh(); // Asks the panel to refresh data.
    }
  }]);

  return SensuDatasourceQueryCtrl;
}(_sdk.QueryCtrl);

SensuDatasourceQueryCtrl.templateUrl = 'partials/query.editor.html';
//# sourceMappingURL=query_ctrl.js.map
