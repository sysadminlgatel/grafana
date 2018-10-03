// import angular from 'angular';
import _ from 'lodash';
import {QueryCtrl} from 'app/plugins/sdk';
import {SplunkQueryBuilder} from './query_builder';
import queryDef from './query_def';

const DEFAULT_INDEX      = 'select index',
      DEFAULT_SOURCETYPE = 'select sourcetype',
      DEFAULT_FIELD      = 'select field';

export class SplunkQueryCtrl extends QueryCtrl {

  constructor($scope, $injector, uiSegmentSrv, templateSrv)  {
    super($scope, $injector);

    this.scope = $scope;
    this.uiSegmentSrv = uiSegmentSrv;
    this.templateSrv = templateSrv;
    this.ds = this.datasource;

    this.getFieldsPromise = {};

    var target_defaults = {
      rawQuery: true,
      query: '',
      namespace: '',
      resultFormat: 'time_series',
      index: DEFAULT_INDEX,
      sourcetype: DEFAULT_SOURCETYPE,
      metricAggs: [
        {func: 'avg', field: DEFAULT_FIELD, alias: ''}
      ],
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
        bins: null,
      },
      options: {
        limit: null,
        cont: true,
        partial: true
      }
    };
    _.defaultsDeep(this.target, target_defaults);

    this.resultFormats = [
      {text: 'Time series', value: 'time_series'},
      {text: 'Table', value: 'table'},
    ];

    // Build segments
    this.removeSegment = uiSegmentSrv.newSegment({fake: true, value: '-- remove --'});
    this.splitBySegments = _.map(this.target.splitByFields, uiSegmentSrv.newSegment);
    this.buildWhereSegments();
    this.fixSplitBySegments();

    this.metrics = {
      indexes: [],
      sourcetypes: [],
      apps: [],
      fields: {}
    };

    if (!this.target.rawQuery) {
      this.updateSuggestions();
      this.renderOptions();
    } else {
      this.getApps();
    }

    this.getAppsTypeAhead = _.bind(getAppsTypeAhead, this);
  }

  ////////////////////////
  // Metric suggestions //
  ////////////////////////

  getIndex() {
    let getIndexesPromise;
    if (this.metrics.indexes.length) {
      getIndexesPromise = Promise.resolve(this.metrics.indexes);
    } else {
      getIndexesPromise = this.ds.getIndexes();
    }

    return getIndexesPromise.then(indexes => {
      this.metrics.indexes = indexes;
      return indexes;
    });
  }

  getSourcetype() {
    let getSourcetypePromise;
    if (this.metrics.sourcetypes.length) {
      getSourcetypePromise = Promise.resolve(this.metrics.sourcetypes);
    } else {
      getSourcetypePromise = this.ds.getSourcetypes();
    }

    return getSourcetypePromise.then(sourcetypes => {
      this.metrics.sourcetypes = sourcetypes;
      return sourcetypes;
    });
  }

  getApps() {
    let getAppsPromise;
    if (this.metrics.apps.length) {
      getAppsPromise = Promise.resolve(this.metrics.apps);
    } else {
      getAppsPromise = this.ds.getApps();
    }

    return getAppsPromise.then(apps => {
      this.metrics.apps = _.map(apps, 'name');
      return apps;
    });
  }

  // Fetching fields list cause high resources consumption,
  // so if query already running, wait for result and don't run new search.
  getFields() {
    let {index, sourcetype} = this.target;
    let sourceId = getSourceId(index, sourcetype);
    let getFieldsPromise;

    if (this.getFieldsPromise[sourceId]) {
      getFieldsPromise = this.getFieldsPromise[sourceId];
    } else {
      if (this.metrics.fields[sourceId] && this.metrics.fields[sourceId].length) {
        getFieldsPromise = Promise.resolve(this.metrics.fields[sourceId]);
      } else {
        let timeFrom = this.panelCtrl.range.from.unix();
        let timeTo = this.panelCtrl.range.to.unix();

        getFieldsPromise = this.ds.getFields(index, sourcetype, timeFrom, timeTo);
      }
      this.getFieldsPromise[sourceId] = getFieldsPromise;
    }

    return getFieldsPromise
    .then(fields => {
      this.getFieldsPromise[sourceId] = null;
      this.metrics.fields[sourceId] = fields;
      return fields;
    })
    .catch(() => {
      this.getFieldsPromise[sourceId] = null;
    });
  }

  getIndexSegments() {
    return this.getIndex().then(indexes => {
      return indexes.map(index => {
        return {text: index.name, value: index.name};
      });
    });
  }

  getSourcetypeSegments() {
    return this.getSourcetype().then(sourcetypes => {
      return sourcetypes.map(sourcetype => {
        return {text: sourcetype.name, value: sourcetype.name};
      });
    });
  }

  getFieldSegments() {
    return this.getFields()
    .then(fields => {
      return fields.map(field => {
        return {text: field, value: field};
      });
    })
    .then(this.uiSegmentSrv.transformToSegments(true));
  }

  updateSuggestions() {
    this.getApps();
    this.getIndex();
    this.getSourcetype();
    this.getFields();
  }

  getMetricAggTypes() {
    return queryDef.getMetricAggTypes();
  }

  getSplitBySegment() {
    return this.getFieldSegments()
    .then(this.uiSegmentSrv.transformToSegments(false))
    .then(segments => {
      segments.splice(0, 0, _.cloneDeep(this.removeSegment));
      return segments;
    });
  }

  getWhereSegment(index) {
    let getOptions;
    if (index === 0) {
      getOptions = Promise.resolve(queryDef.getWhereOptions());
    } else {
      getOptions = Promise.resolve(queryDef.getWhereConditions());
    }

    return getOptions.then(this.uiSegmentSrv.transformToSegments(false))
    .then(segments => {
      if (this.target.whereClause.type && index === 0) {
        segments.splice(0, 0, _.cloneDeep(this.removeSegment));
      }
      return segments;
    });
  }

  getSpan() {
    return Promise.resolve(queryDef.getSpanOptions());
  }

  //////////////////////////////
  // Editor control functions //
  //////////////////////////////

  onChangeInternal() {
    this.refresh();
  }

  toggleEditorMode() {
    this.target.rawQuery = !this.target.rawQuery;
  }

  getCollapsedText() {
    if (this.target.rawQuery) {
      return this.target.query;
    } else {
      return SplunkQueryBuilder.build(this.target);
    }
  }

  toggleShowMetric(agg) {
    agg.hide = !agg.hide;
    this.onChangeInternal();
  }

  toggleOptions() {
    this.showOptions = !this.showOptions;
  }

  onOptionChange() {
    this.renderOptions();
    this.onChangeInternal();
  }

  renderOptions() {
    let {options, tcOptions, binOptions} = this.target;
    this.settingsLinkText = SplunkQueryBuilder.renderOptions(tcOptions, binOptions, options);
  }

  onMetricChange() {
    if (isTargetSet(this.target)) {
      this.getFields();
      this.onChangeInternal();
    }
  }

  onSourceChange() {
    if (isSourceSet(this.target)) {
      this.getFields();
    }
  }

  onResultFormatChange() {
    this.splitBySegments = _.map(this.target.splitByFields, this.uiSegmentSrv.newSegment);
    this.fixSplitBySegments();
    this.onChangeInternal();
  }

  addMetricAgg() {
    this.target.metricAggs.push({func: 'avg', field: 'value'});
    this.onChangeInternal();
  }

  removeMetricAgg(index) {
    this.target.metricAggs.splice(index, 1);
    this.onChangeInternal();
  }

  disableWhereEditor() {
    return (
      this.target.splitByFields.length === 0 ||
      this.target.metricAggs.length > 1
    );
  }

  splitBySegmentChanged(segment, index) {
    if (segment.type === 'plus-button') {
      segment.type = undefined;
    }
    this.target.splitByFields = _.map(_.filter(this.splitBySegments, segment => {
      return (segment.type !== 'plus-button' &&
              segment.value !== this.removeSegment.value);
    }), 'value');
    this.splitBySegments = _.map(this.target.splitByFields, this.uiSegmentSrv.newSegment);

    if (segment.value === this.removeSegment.value) {
      this.splitBySegments.splice(index, 1);
    }

    this.fixSplitBySegments();
    this.onChangeInternal();
  }

  buildWhereSegments() {
    this.whereSegments = [];
    if (this.target.whereClause.type === 'wherein') {
      let operatorSegment = this.uiSegmentSrv.newSegment(
        {value: this.target.whereClause.operator, expandable: false}
      );
      let conditionSegment = this.uiSegmentSrv.newSegment(
        {value: this.target.whereClause.condition, expandable: false}
      );

      this.whereSegments.push(operatorSegment);
      this.whereSegments.push(conditionSegment);
    } else if (this.target.whereClause.type === 'wherethresh') {
      let operatorSegment = this.uiSegmentSrv.newSegment(
        {value: this.target.whereClause.operator, expandable: false}
      );

      this.whereSegments.push(operatorSegment);
    } else {
      this.whereSegments.push(this.uiSegmentSrv.newPlusButton());
    }
  }

  whereSegmentChanged() {
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
        let conditionSegment = this.uiSegmentSrv.newSegment(
          {value: 'top', expandable: false}
        );
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

  whereTypeChanged(operatorSegment) {
    return ((
        _.includes(['in', 'notin'], operatorSegment.value) &&
        !_.includes(['in', 'notin'], this.target.whereClause.operator)
      ) || (
        _.includes(['<', '>'], operatorSegment.value) &&
        !_.includes(['<', '>'], this.target.whereClause.operator)
      )
    );
  }

  fixSplitBySegments() {
    if (this.target.resultFormat === 'time_series') {
      this.fixTCSplitBySegments();
    } else {
      this.fixSegments(this.splitBySegments);
    }
  }

  fixTCSplitBySegments() {
    if (this.splitBySegments.length === 0) {
      this.splitBySegments.push(this.uiSegmentSrv.newPlusButton());
    } else {
      // Split by in timechart supports only one field
      this.splitBySegments = this.splitBySegments.slice(0, 1);
    }
  }

  fixSegments(segments) {
    var count = segments.length;
    var lastSegment = segments[Math.max(count-1, 0)];

    if (!lastSegment || lastSegment.type !== 'plus-button') {
      segments.push(this.uiSegmentSrv.newPlusButton());
    }
  }
}

function getSourceId(index, sourcetype) {
  return index + '&' + sourcetype;
}

function isTargetSet(target) {
  let isMetricSet = _.every(target.metricAggs, agg => {
    return agg.field !== DEFAULT_FIELD;
  });

  return isMetricSet &&
    target.index !== DEFAULT_INDEX &&
    target.sourcetype !== DEFAULT_SOURCETYPE;
}

function isSourceSet(target) {
  return target.index !== DEFAULT_INDEX && target.sourcetype !== DEFAULT_SOURCETYPE;
}

function getAppsTypeAhead() {
  return this.metrics.apps;
}

SplunkQueryCtrl.templateUrl = 'partials/query.editor.html';
