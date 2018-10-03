import angular from "angular";
import _ from "lodash";
import { QueryCtrl } from 'app/plugins/sdk';
import './css/query-editor.css!';

export class SensuDatasourceQueryCtrl extends QueryCtrl {

  constructor($scope, $injector, templateSrv, uiSegmentSrv) {
    super($scope, $injector);
    this.scope = $scope;
    this.uiSegmentSrv = uiSegmentSrv;
    this.templateSrv = templateSrv;
    // source types for the popdown
    this.sourceTypes = [
      {
        text: 'Aggregates',
        value: 'aggregates',
      },
      {
        text: 'Check Subscriptions',
        value: 'check_subscriptions',
      },
      {
        text: 'Clients',
        value: 'clients_json',
      },
      {
        text: 'Client History',
        value: 'clienthistory',
      },
      {
        text: 'Events',
        value: 'events',
      },
      {
        text: 'Results as JSON',
        value: 'results_json',
      },
      {
        text: 'Results as Table',
        value: 'results_table',
      },
      {
        text: 'Sensu Health',
        value: 'sensu_health_json',
      },
      {
        text: 'Silenced Entries',
        value: 'silenced_entries_json',
      },
      {
        text: 'Stashes',
        value: 'stashes_json',
      }
    ];

    // Each source type have different dimensions
    this.dimensionTypes = {
      events: [
      {
        text: 'Client Name',
        value: 'clientName'
      },
      {
        text: 'Check Name',
        value: 'checkName'
      }],
      results_json: [
      {
        text: 'Client Name',
        value: 'clientName'
      },
      {
        text: 'Check Name',
        value: 'checkName',
      }],
      results_table: [
      {
        text: 'Client Name',
        value: 'clientName'
      },
      {
        text: 'Check Name',
        value: 'checkName',
      }],
      aggregates: [
      {
        text: 'Aggregate Name',
        value: 'aggregateName',
      }],
      clienthistory: [
      {
        text: 'Client Name',
        value: 'clientName'
      }],
    };

    this.aggregateModes = [
      {
        text: 'List',
        value: 'list'
      },
      {
        text: 'Clients',
        value: 'clients'
      },
      {
        text: 'Checks',
        value: 'checks'
      },
    ];

    this.target.aggregateMode = this.target.aggregateMode || 'list';
    // default source type is events
    this.target.sourceType = this.target.sourceType || 'events';
    // no dimensions initially
    this.target.dimensions = this.target.dimensions || [];
  }

  /**
   * [removeDimension description]
   * @param  {[type]} dimension [description]
   * @return {[type]}           [description]
   */
  removeDimension(dimension) {
    if (this.target.dimensions) {
      this.target.dimensions.splice(this.target.dimensions.indexOf(dimension), 1);
      this.panelCtrl.refresh();
    }
  }

  /**
   * [addDimension description]
   */
  addDimension() {
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
  getDimensionValues(dimension) {
    if (dimension) {
      //console.log("have a dimension, getting available values");
      return this.datasource.dimensionFindValues(this.target, dimension)
        .then(this.uiSegmentSrv.transformToSegments(true));
    }
  }

  /**
   * [getOptions description]
   * @return {[type]} [description]
   */
  getOptions() {
    return this.datasource.metricFindQuery(this.target)
      .then(this.uiSegmentSrv.transformToSegments(true));
    // Options have to be transformed by uiSegmentSrv to be usable by metric-segment-model directive
  }

  /**
   * [sourceTypeChanged description]
   * @return {[type]} [description]
   */
  sourceTypeChanged() {
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
  aggregateModeChanged() {
    //console.log("Aggregate Mode is now " + this.target.aggregateMode);
    this.onChangeInternal();
  }

  /**
   * [onChangeInternal description]
   * @return {[type]} [description]
   */
  onChangeInternal() {
    this.panelCtrl.refresh(); // Asks the panel to refresh data.
  }

}

SensuDatasourceQueryCtrl.templateUrl = 'partials/query.editor.html';
