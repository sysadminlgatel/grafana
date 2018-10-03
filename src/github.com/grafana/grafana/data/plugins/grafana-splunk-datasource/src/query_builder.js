import _ from 'lodash';

export class SplunkQueryBuilder {
  constructor(target) {
    this.target = target;
  }

  static build(target) {
    let interpolatedSource = interpolateSource(target.index, target.sourcetype);
    let interpolatedQuery;

    if (target.resultFormat && target.resultFormat === 'table') {
      interpolatedQuery = interpolateStatsPart(target);
    } else {
      interpolatedQuery = interpolateTimechartPart(target);
    }

    return `${interpolatedSource} | ${interpolatedQuery}`;
  }

  static buildGetFields(index, sourcetype) {
    let interpolatedSource = interpolateSource(index, sourcetype);
    return `${interpolatedSource} | fieldsummary maxvals=1`;
  }

  static renderOptions(tcOptions, binOptions, options) {
    return renderOptions(tcOptions, binOptions, options);
  }
}

function interpolateSource(index, sourcetype) {
  return `index="${index}" sourcetype="${sourcetype}"`;
}

function interpolateTimechartPart(target) {
  let {metricAggs, splitByFields, whereClause, options, tcOptions, binOptions} = target;
  let timechartPart = 'timechart ';

  timechartPart += renderOptions(tcOptions, binOptions, options);

  let aggs = _.filter(metricAggs, agg => {
    return !agg.hide;
  });
  let interpolatedAggs = aggs.map(interpolateMetricAgg).join(', ');
  timechartPart += interpolatedAggs;

  if (splitByFields && splitByFields.length) {
    let interpolatedSplitBy = splitByFields[0];
    timechartPart += ` by ${interpolatedSplitBy}`;
    if (whereClause && whereClause.type) {
      let interpolatedWhere = interpolateWhereClause(whereClause);
      timechartPart += ` ${interpolatedWhere}`;
    }
  }

  return timechartPart;
}

function interpolateStatsPart(target) {
  let {metricAggs, splitByFields} = target;
  let timechartPart = 'stats ';

  let aggs = _.filter(metricAggs, agg => {
    return !agg.hide;
  });
  let interpolatedAggs = aggs.map(interpolateMetricAgg).join(', ');
  timechartPart += interpolatedAggs;

  if (splitByFields && splitByFields.length) {
    let interpolatedSplitBy = splitByFields.join(', ');
    timechartPart += ` by ${interpolatedSplitBy}`;
  }

  return timechartPart;
}

function renderOptions(tcOptions, binOptions, options) {
  let renderedOptions = '';
  if (options) {
    let interpolatedOptions = interpolateOptions(options);
    renderedOptions += interpolatedOptions;
  }

  if (binOptions) {
    let interpolatedBinOptions = interpolateBinOptions(binOptions);
    renderedOptions += interpolatedBinOptions;
  }

  if (tcOptions) {
    let interpolatedTcOptions = interpolateTcOptions(tcOptions);
    renderedOptions += interpolatedTcOptions;
  }

  return renderedOptions;
}

function interpolateOptions(options) {
  let {limit, cont, partial} = options;
  let interpolatedOptions = '';

  if (limit) {
    interpolatedOptions += `limit=${limit} `;
  }

  if (cont === false) {
    interpolatedOptions += `cont=false `;
  }

  if (partial === false) {
    interpolatedOptions += `partial=false `;
  }

  return interpolatedOptions;
}

function interpolateBinOptions(binOptions) {
  let {bins} = binOptions;
  let binoptions = '';

  if (bins) {
    binoptions += `bins=${bins} `;
  }

  return binoptions;
}

function interpolateTcOptions(tcOptions) {
  let {span, useother, otherstr, usenull, nullstr} = tcOptions;
  let tcoptions = '';

  if (span && span !== 'auto') {
    tcoptions += `span=${span} `;
  }

  if (usenull) {
    tcoptions += `usenull=${usenull} `;
    if (nullstr && nullstr !== 'NULL') {
      tcoptions += `nullstr="${nullstr}" `;
    }
  }

  if (useother) {
    if (otherstr && otherstr !== 'OTHER') {
      tcoptions += `useother=true otherstr="${otherstr}" `;
    }
  } else {
    tcoptions += `useother=false `;
  }

  return tcoptions;
}

function interpolateMetricAgg(metricAgg) {
  let {func, field, alias} = metricAgg;
  let agg = `${func}(${field})`;
  if (alias) {
    agg += ` as "${alias}"`;
  }

  return agg;
}

function interpolateWhereClause(whereClause) {
  let {type, agg, operator, condition, value} = whereClause;
  if (type === 'wherein') {
    return `where ${agg} ${operator} ${condition}${value}`;
  } else if (type === 'wherethresh') {
    return `where ${agg} ${operator} ${value}`;
  } else {
    return '';
  }
}
