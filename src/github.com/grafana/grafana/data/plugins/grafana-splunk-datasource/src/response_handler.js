import _ from 'lodash';
import moment from 'moment';
import TableModel from 'app/core/table_model';

let TIME_STAMP_FIELD = '_time',
    INTERNAL_FIELD_PATTERN = /^_.+/;

function handleRawQueryResponse(response, tsField=TIME_STAMP_FIELD, internalFieldPattern=INTERNAL_FIELD_PATTERN) {
  let results = response.results;
  let data = {};
  let dataFields = filterNonInternalFields(_.map(response.fields, 'name'), false, internalFieldPattern);

  _.forEach(results, (entry) => {
    // Handle response with 'BY' clause - group points by each non-time field
    _.forEach(dataFields, (field) => {
      if (!data[field]) {
        data[field] = [];
      }

      let point = convertToDataPoint(entry[field], entry[tsField]);
      data[field].push(point);
    });
  });

  return _.map(data, (value, key) => {
    return {
      target: key,
      datapoints: value
    };
  });
}

function handleTableResponse(results, tsField=TIME_STAMP_FIELD, internalFieldPattern=INTERNAL_FIELD_PATTERN) {
  // let fields = _.map(response.fields, 'name');
  // let results = response.results;
  let table = new TableModel();

  let fields = _.map(_.head(results), (v, k) => {
    return k;
  });

  // Remove internal fields
  fields = filterNonInternalFields(fields, true, internalFieldPattern);

  _.forEach(fields, field => {
    if (field === tsField) {
      // Add TIME_STAMP_FIELD as standard time column
      table.columns.push({text: 'Time', type: 'time'});
    } else {
      table.columns.push({text: field});
    }
  });

  _.forEach(results, (entry) => {
    let row = _.map(fields, field => {
      return tryToNumber(entry[field]);
    });
    table.rows.push(row);
  });

  return table;
}

function convertToDataPoint(value, timeStamp) {
  let ts = moment.utc(timeStamp).valueOf();
  let val = value ? Number(value) : null;
  return [val, ts];
}

function tryToNumber(value) {
  if (value && !isNaN(Number(value))) {
    return Number(value);
  } else {
    return value;
  }
}

function filterNonInternalFields(fields, includeTimeStamp=true, internalFieldPattern=INTERNAL_FIELD_PATTERN) {
  return _.filter(fields, field => {
    return !isInternalField(field, internalFieldPattern) ||
      (field === TIME_STAMP_FIELD && includeTimeStamp);
  });
}

function isInternalField(field, internalFieldPattern = INTERNAL_FIELD_PATTERN) {
  return internalFieldPattern.test(field);
}

export default {
  handleRawQueryResponse: handleRawQueryResponse,
  handleTableResponse: handleTableResponse
};
