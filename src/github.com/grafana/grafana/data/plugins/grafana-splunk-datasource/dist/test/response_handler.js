'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _table_model = require('app/core/table_model');

var _table_model2 = _interopRequireDefault(_table_model);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var TIME_STAMP_FIELD = '_time',
    INTERNAL_FIELD_PATTERN = /^_.+/;

function handleRawQueryResponse(response) {
  var tsField = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : TIME_STAMP_FIELD;
  var internalFieldPattern = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : INTERNAL_FIELD_PATTERN;

  var results = response.results;
  var data = {};
  var dataFields = filterNonInternalFields(_lodash2.default.map(response.fields, 'name'), false, internalFieldPattern);

  _lodash2.default.forEach(results, function (entry) {
    // Handle response with 'BY' clause - group points by each non-time field
    _lodash2.default.forEach(dataFields, function (field) {
      if (!data[field]) {
        data[field] = [];
      }

      var point = convertToDataPoint(entry[field], entry[tsField]);
      data[field].push(point);
    });
  });

  return _lodash2.default.map(data, function (value, key) {
    return {
      target: key,
      datapoints: value
    };
  });
}

function handleTableResponse(results) {
  var tsField = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : TIME_STAMP_FIELD;
  var internalFieldPattern = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : INTERNAL_FIELD_PATTERN;

  // let fields = _.map(response.fields, 'name');
  // let results = response.results;
  var table = new _table_model2.default();

  var fields = _lodash2.default.map(_lodash2.default.head(results), function (v, k) {
    return k;
  });

  // Remove internal fields
  fields = filterNonInternalFields(fields, true, internalFieldPattern);

  _lodash2.default.forEach(fields, function (field) {
    if (field === tsField) {
      // Add TIME_STAMP_FIELD as standard time column
      table.columns.push({ text: 'Time', type: 'time' });
    } else {
      table.columns.push({ text: field });
    }
  });

  _lodash2.default.forEach(results, function (entry) {
    var row = _lodash2.default.map(fields, function (field) {
      return tryToNumber(entry[field]);
    });
    table.rows.push(row);
  });

  return table;
}

function convertToDataPoint(value, timeStamp) {
  var ts = _moment2.default.utc(timeStamp).valueOf();
  var val = value ? Number(value) : null;
  return [val, ts];
}

function tryToNumber(value) {
  if (value && !isNaN(Number(value))) {
    return Number(value);
  } else {
    return value;
  }
}

function filterNonInternalFields(fields) {
  var includeTimeStamp = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
  var internalFieldPattern = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : INTERNAL_FIELD_PATTERN;

  return _lodash2.default.filter(fields, function (field) {
    return !isInternalField(field, internalFieldPattern) || field === TIME_STAMP_FIELD && includeTimeStamp;
  });
}

function isInternalField(field) {
  var internalFieldPattern = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : INTERNAL_FIELD_PATTERN;

  return internalFieldPattern.test(field);
}

exports.default = {
  handleRawQueryResponse: handleRawQueryResponse,
  handleTableResponse: handleTableResponse
};
//# sourceMappingURL=response_handler.js.map
