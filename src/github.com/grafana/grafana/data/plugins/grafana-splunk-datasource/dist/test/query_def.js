"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _metricAggTypes = [
// Aggregate functions
{ text: "avg", value: 'avg' }, { text: "count", value: 'count' }, { text: "distinct_count", value: 'distinct_count' }, { text: "estdc", value: 'estdc' }, { text: "estdc_error", value: 'estdc_error' }, { text: "max", value: 'max' }, { text: "mean", value: 'mean' }, { text: "median", value: 'median' }, { text: "min", value: 'min' }, { text: "mode", value: 'mode' }, { text: "perc95", value: 'perc95' }, { text: "range", value: 'range' }, { text: "range", value: 'range' }, { text: "stdev", value: 'stdev' }, { text: "stdevp", value: 'stdevp' }, { text: "stdevp", value: 'stdevp' }, { text: "sum", value: 'sum' }, { text: "sumsq", value: 'sumsq' }, { text: "var", value: 'var' }, { text: "varp", value: 'varp' },

// Event order functions
{ text: "earliest", value: 'earliest' }, { text: "first", value: 'first' }, { text: "last", value: 'last' }, { text: "latest", value: 'latest' }];

var _span = [{ text: 'auto', value: 'auto' }, { text: '10s', value: '10s' }, { text: '1m', value: '1m' }, { text: '10m', value: '10m' }, { text: '1h', value: '1h' }, { text: '12h', value: '12h' }, { text: '1d', value: '1d' }, { text: '7d', value: '7d' }, { text: '1mon', value: '1mon' }];

var _wherein = {
  operator: [{ text: 'in', value: 'in' }, { text: 'notin', value: 'notin' }],
  condition: [{ text: 'top', value: 'top' }, { text: 'bottom', value: 'bottom' }]
};

var _wherethresh = {
  operator: [{ text: '<', value: '<' }, { text: '>', value: '>' }]
};

var QueryDef = function () {
  function QueryDef() {
    _classCallCheck(this, QueryDef);
  }

  _createClass(QueryDef, null, [{
    key: "getMetricAggTypes",
    value: function getMetricAggTypes() {
      return _metricAggTypes;
    }
  }, {
    key: "getSpanOptions",
    value: function getSpanOptions() {
      return _span;
    }
  }, {
    key: "getWhereOptions",
    value: function getWhereOptions() {
      var options = _wherein.operator.concat(_wherethresh.operator);
      return options;
    }
  }, {
    key: "getWhereConditions",
    value: function getWhereConditions() {
      return _wherein.condition;
    }
  }]);

  return QueryDef;
}();

exports.default = QueryDef;
//# sourceMappingURL=query_def.js.map
