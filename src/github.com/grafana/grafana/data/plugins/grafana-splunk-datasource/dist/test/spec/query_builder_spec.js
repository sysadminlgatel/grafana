'use strict';

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _query_builder = require('../query_builder');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('SplunkQueryBuilder', function () {
  var defaultTarget = {
    rawQuery: true,
    query: '',
    index: 'os',
    sourcetype: 'iostat',
    metricAggs: [{ func: 'avg', field: 'total_ops', alias: '' }],
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

  var defaultSrc = 'index="os" sourcetype="iostat"';

  var ctx = {};

  beforeEach(function () {
    ctx.target = _lodash2.default.cloneDeep(defaultTarget);
  });

  describe('When building timechart search', function () {

    beforeEach(function () {
      ctx.target = _lodash2.default.cloneDeep(defaultTarget);
    });

    it('should build proper timechart search', function (done) {
      var expected = 'index="os" sourcetype="iostat" | timechart avg(total_ops)';
      var query = _query_builder.SplunkQueryBuilder.build(ctx.target);
      expect(query).to.equal(expected);
      done();
    });

    it('should add alias', function (done) {
      ctx.target.metricAggs = [{ func: 'avg', field: 'total_ops', alias: 'total' }];

      var expected = 'index="os" sourcetype="iostat" | timechart avg(total_ops) as "total"';

      var query = _query_builder.SplunkQueryBuilder.build(ctx.target);
      expect(query).to.equal(expected);
      done();
    });

    it('should build proper search for multiple metrics', function (done) {
      ctx.target.metricAggs = [{ func: 'avg', field: 'read_ops', alias: '' }, { func: 'avg', field: 'write_ops', alias: '' }];

      var expected = 'index="os" sourcetype="iostat" | timechart avg(read_ops), avg(write_ops)';

      var query = _query_builder.SplunkQueryBuilder.build(ctx.target);
      expect(query).to.equal(expected);
      done();
    });

    it('should add proper split by clause', function (done) {
      ctx.target.splitByFields = ['Device'];

      var expected = 'index="os" sourcetype="iostat" | timechart avg(total_ops) by Device';

      var query = _query_builder.SplunkQueryBuilder.build(ctx.target);
      expect(query).to.equal(expected);
      done();
    });

    it('should add only one split by field', function (done) {
      ctx.target.splitByFields = ['device', 'host'];

      var expected = 'index="os" sourcetype="iostat" | timechart avg(total_ops) by device';

      var query = _query_builder.SplunkQueryBuilder.build(ctx.target);
      expect(query).to.equal(expected);
      done();
    });

    it('should add proper where-in clause (as a part of split by)', function (done) {
      ctx.target.splitByFields = ['Device'];
      ctx.target.whereClause = {
        type: 'wherein',
        agg: 'avg',
        condition: 'top',
        operator: 'in',
        value: '5'
      };

      var expected = 'index="os" sourcetype="iostat" | timechart avg(total_ops) by Device where avg in top5';

      var query = _query_builder.SplunkQueryBuilder.build(ctx.target);
      expect(query).to.equal(expected);
      done();
    });

    it('should add proper where-thresh clause (as a part of split by)', function (done) {
      ctx.target.splitByFields = ['Device'];
      ctx.target.whereClause = {
        type: 'wherethresh',
        agg: 'avg',
        condition: '',
        operator: '>',
        value: '100'
      };

      var expected = 'index="os" sourcetype="iostat" | timechart avg(total_ops) by Device where avg > 100';

      var query = _query_builder.SplunkQueryBuilder.build(ctx.target);
      expect(query).to.equal(expected);
      done();
    });
  });

  describe('When building stats search', function () {

    beforeEach(function () {
      ctx.target = _lodash2.default.cloneDeep(defaultTarget);
      ctx.target.resultFormat = 'table';
    });

    it('should build proper stats search', function (done) {
      var expected = 'index="os" sourcetype="iostat" | stats avg(total_ops)';
      var query = _query_builder.SplunkQueryBuilder.build(ctx.target);
      expect(query).to.equal(expected);
      done();
    });

    it('should add proper split by clause', function (done) {
      ctx.target.splitByFields = ['device', 'host'];

      var expected = 'index="os" sourcetype="iostat" | stats avg(total_ops) by device, host';

      var query = _query_builder.SplunkQueryBuilder.build(ctx.target);
      expect(query).to.equal(expected);
      done();
    });
  });

  describe('When rendering options', function () {

    beforeEach(function () {
      ctx.target = _lodash2.default.cloneDeep(defaultTarget);
    });

    it('should add "span" option', function (done) {
      ctx.target.tcOptions.span = '1m';

      var expected = 'index="os" sourcetype="iostat" | timechart span=1m avg(total_ops)';

      var query = _query_builder.SplunkQueryBuilder.build(ctx.target);
      expect(query).to.equal(expected);
      done();
    });

    it('should add "useother" option', function (done) {
      ctx.target.tcOptions.useother = false;

      var expected = 'index="os" sourcetype="iostat" | timechart useother=false avg(total_ops)';

      var query = _query_builder.SplunkQueryBuilder.build(ctx.target);
      expect(query).to.equal(expected);
      done();
    });

    it('should add "otherstr" option', function (done) {
      ctx.target.tcOptions.otherstr = 'another';

      var expected = 'index="os" sourcetype="iostat" | timechart useother=true otherstr="another" avg(total_ops)';

      var query = _query_builder.SplunkQueryBuilder.build(ctx.target);
      expect(query).to.equal(expected);
      done();
    });

    it('should add "bins" option', function (done) {
      ctx.target.binOptions.bins = 50;

      var expected = 'index="os" sourcetype="iostat" | timechart bins=50 avg(total_ops)';

      var query = _query_builder.SplunkQueryBuilder.build(ctx.target);
      expect(query).to.equal(expected);
      done();
    });

    it('should add "limit" option', function (done) {
      ctx.target.options.limit = 5;

      var expected = 'index="os" sourcetype="iostat" | timechart limit=5 avg(total_ops)';

      var query = _query_builder.SplunkQueryBuilder.build(ctx.target);
      expect(query).to.equal(expected);
      done();
    });

    it('should add "cont" option', function (done) {
      ctx.target.options.cont = false;

      var expected = 'index="os" sourcetype="iostat" | timechart cont=false avg(total_ops)';

      var query = _query_builder.SplunkQueryBuilder.build(ctx.target);
      expect(query).to.equal(expected);
      done();
    });

    it('should add "partial" option', function (done) {
      ctx.target.options.partial = false;

      var expected = 'index="os" sourcetype="iostat" | timechart partial=false avg(total_ops)';

      var query = _query_builder.SplunkQueryBuilder.build(ctx.target);
      expect(query).to.equal(expected);
      done();
    });
  });
});
//# sourceMappingURL=query_builder_spec.js.map
