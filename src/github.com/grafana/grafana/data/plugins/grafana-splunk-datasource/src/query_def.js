let _metricAggTypes = [
  // Aggregate functions
  {text: "avg",            value: 'avg'},
  {text: "count",          value: 'count'},
  {text: "distinct_count", value: 'distinct_count'},
  {text: "estdc",          value: 'estdc'},
  {text: "estdc_error",    value: 'estdc_error'},
  {text: "max",            value: 'max'},
  {text: "mean",           value: 'mean'},
  {text: "median",         value: 'median'},
  {text: "min",            value: 'min'},
  {text: "mode",           value: 'mode'},
  {text: "perc95",         value: 'perc95'},
  {text: "range",          value: 'range'},
  {text: "range",          value: 'range'},
  {text: "stdev",          value: 'stdev'},
  {text: "stdevp",         value: 'stdevp'},
  {text: "stdevp",         value: 'stdevp'},
  {text: "sum",            value: 'sum'},
  {text: "sumsq",          value: 'sumsq'},
  {text: "var",            value: 'var'},
  {text: "varp",           value: 'varp'},

  // Event order functions
  {text: "earliest",       value: 'earliest'},
  {text: "first",          value: 'first'},
  {text: "last",           value: 'last'},
  {text: "latest",         value: 'latest'},
];

let _span = [
  {text: 'auto',  value: 'auto'},
  {text: '10s',   value: '10s'},
  {text: '1m',    value: '1m'},
  {text: '10m',   value: '10m'},
  {text: '1h',    value: '1h'},
  {text: '12h',   value: '12h'},
  {text: '1d',    value: '1d'},
  {text: '7d',    value: '7d'},
  {text: '1mon',  value: '1mon'},
];

let _wherein = {
  operator: [
    {text: 'in',  value: 'in'},
    {text: 'notin',  value: 'notin'}
  ],
  condition: [
    {text: 'top',  value: 'top'},
    {text: 'bottom',  value: 'bottom'}
  ]
};

let _wherethresh = {
  operator: [
    {text: '<',  value: '<'},
    {text: '>',  value: '>'}
  ]
};

export default class QueryDef {

  static getMetricAggTypes() {
    return _metricAggTypes;
  }

  static getSpanOptions() {
    return _span;
  }

  static getWhereOptions() {
    let options = _wherein.operator.concat(_wherethresh.operator);
    return options;
  }

  static getWhereConditions() {
    return _wherein.condition;
  }
}
