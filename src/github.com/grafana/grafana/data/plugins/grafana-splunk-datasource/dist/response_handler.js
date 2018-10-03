'use strict';

System.register(['lodash', 'moment', 'app/core/table_model'], function (_export, _context) {
  "use strict";

  var _, moment, TableModel, TIME_STAMP_FIELD, INTERNAL_FIELD_PATTERN;

  function handleRawQueryResponse(response) {
    var tsField = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : TIME_STAMP_FIELD;
    var internalFieldPattern = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : INTERNAL_FIELD_PATTERN;

    var results = response.results;
    var data = {};
    var dataFields = filterNonInternalFields(_.map(response.fields, 'name'), false, internalFieldPattern);

    _.forEach(results, function (entry) {
      // Handle response with 'BY' clause - group points by each non-time field
      _.forEach(dataFields, function (field) {
        if (!data[field]) {
          data[field] = [];
        }

        var point = convertToDataPoint(entry[field], entry[tsField]);
        data[field].push(point);
      });
    });

    return _.map(data, function (value, key) {
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
    var table = new TableModel();

    var fields = _.map(_.head(results), function (v, k) {
      return k;
    });

    // Remove internal fields
    fields = filterNonInternalFields(fields, true, internalFieldPattern);

    _.forEach(fields, function (field) {
      if (field === tsField) {
        // Add TIME_STAMP_FIELD as standard time column
        table.columns.push({ text: 'Time', type: 'time' });
      } else {
        table.columns.push({ text: field });
      }
    });

    _.forEach(results, function (entry) {
      var row = _.map(fields, function (field) {
        return tryToNumber(entry[field]);
      });
      table.rows.push(row);
    });

    return table;
  }

  function convertToDataPoint(value, timeStamp) {
    var ts = moment.utc(timeStamp).valueOf();
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

    return _.filter(fields, function (field) {
      return !isInternalField(field, internalFieldPattern) || field === TIME_STAMP_FIELD && includeTimeStamp;
    });
  }

  function isInternalField(field) {
    var internalFieldPattern = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : INTERNAL_FIELD_PATTERN;

    return internalFieldPattern.test(field);
  }

  return {
    setters: [function (_lodash) {
      _ = _lodash.default;
    }, function (_moment) {
      moment = _moment.default;
    }, function (_appCoreTable_model) {
      TableModel = _appCoreTable_model.default;
    }],
    execute: function () {
      TIME_STAMP_FIELD = '_time';
      INTERNAL_FIELD_PATTERN = /^_.+/;

      _export('default', {
        handleRawQueryResponse: handleRawQueryResponse,
        handleTableResponse: handleTableResponse
      });
    }
  };
});
//# sourceMappingURL=response_handler.js.map
