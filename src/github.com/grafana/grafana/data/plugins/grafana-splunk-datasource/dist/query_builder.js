'use strict';

System.register(['lodash'], function (_export, _context) {
  "use strict";

  var _, _createClass, SplunkQueryBuilder;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function interpolateSource(index, sourcetype) {
    return 'index="' + index + '" sourcetype="' + sourcetype + '"';
  }

  function interpolateTimechartPart(target) {
    var metricAggs = target.metricAggs,
        splitByFields = target.splitByFields,
        whereClause = target.whereClause,
        options = target.options,
        tcOptions = target.tcOptions,
        binOptions = target.binOptions;

    var timechartPart = 'timechart ';

    timechartPart += _renderOptions(tcOptions, binOptions, options);

    var aggs = _.filter(metricAggs, function (agg) {
      return !agg.hide;
    });
    var interpolatedAggs = aggs.map(interpolateMetricAgg).join(', ');
    timechartPart += interpolatedAggs;

    if (splitByFields && splitByFields.length) {
      var interpolatedSplitBy = splitByFields[0];
      timechartPart += ' by ' + interpolatedSplitBy;
      if (whereClause && whereClause.type) {
        var interpolatedWhere = interpolateWhereClause(whereClause);
        timechartPart += ' ' + interpolatedWhere;
      }
    }

    return timechartPart;
  }

  function interpolateStatsPart(target) {
    var metricAggs = target.metricAggs,
        splitByFields = target.splitByFields;

    var timechartPart = 'stats ';

    var aggs = _.filter(metricAggs, function (agg) {
      return !agg.hide;
    });
    var interpolatedAggs = aggs.map(interpolateMetricAgg).join(', ');
    timechartPart += interpolatedAggs;

    if (splitByFields && splitByFields.length) {
      var interpolatedSplitBy = splitByFields.join(', ');
      timechartPart += ' by ' + interpolatedSplitBy;
    }

    return timechartPart;
  }

  function _renderOptions(tcOptions, binOptions, options) {
    var renderedOptions = '';
    if (options) {
      var interpolatedOptions = interpolateOptions(options);
      renderedOptions += interpolatedOptions;
    }

    if (binOptions) {
      var interpolatedBinOptions = interpolateBinOptions(binOptions);
      renderedOptions += interpolatedBinOptions;
    }

    if (tcOptions) {
      var interpolatedTcOptions = interpolateTcOptions(tcOptions);
      renderedOptions += interpolatedTcOptions;
    }

    return renderedOptions;
  }

  function interpolateOptions(options) {
    var limit = options.limit,
        cont = options.cont,
        partial = options.partial;

    var interpolatedOptions = '';

    if (limit) {
      interpolatedOptions += 'limit=' + limit + ' ';
    }

    if (cont === false) {
      interpolatedOptions += 'cont=false ';
    }

    if (partial === false) {
      interpolatedOptions += 'partial=false ';
    }

    return interpolatedOptions;
  }

  function interpolateBinOptions(binOptions) {
    var bins = binOptions.bins;

    var binoptions = '';

    if (bins) {
      binoptions += 'bins=' + bins + ' ';
    }

    return binoptions;
  }

  function interpolateTcOptions(tcOptions) {
    var span = tcOptions.span,
        useother = tcOptions.useother,
        otherstr = tcOptions.otherstr,
        usenull = tcOptions.usenull,
        nullstr = tcOptions.nullstr;

    var tcoptions = '';

    if (span && span !== 'auto') {
      tcoptions += 'span=' + span + ' ';
    }

    if (usenull) {
      tcoptions += 'usenull=' + usenull + ' ';
      if (nullstr && nullstr !== 'NULL') {
        tcoptions += 'nullstr="' + nullstr + '" ';
      }
    }

    if (useother) {
      if (otherstr && otherstr !== 'OTHER') {
        tcoptions += 'useother=true otherstr="' + otherstr + '" ';
      }
    } else {
      tcoptions += 'useother=false ';
    }

    return tcoptions;
  }

  function interpolateMetricAgg(metricAgg) {
    var func = metricAgg.func,
        field = metricAgg.field,
        alias = metricAgg.alias;

    var agg = func + '(' + field + ')';
    if (alias) {
      agg += ' as "' + alias + '"';
    }

    return agg;
  }

  function interpolateWhereClause(whereClause) {
    var type = whereClause.type,
        agg = whereClause.agg,
        operator = whereClause.operator,
        condition = whereClause.condition,
        value = whereClause.value;

    if (type === 'wherein') {
      return 'where ' + agg + ' ' + operator + ' ' + condition + value;
    } else if (type === 'wherethresh') {
      return 'where ' + agg + ' ' + operator + ' ' + value;
    } else {
      return '';
    }
  }
  return {
    setters: [function (_lodash) {
      _ = _lodash.default;
    }],
    execute: function () {
      _createClass = function () {
        function defineProperties(target, props) {
          for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
          }
        }

        return function (Constructor, protoProps, staticProps) {
          if (protoProps) defineProperties(Constructor.prototype, protoProps);
          if (staticProps) defineProperties(Constructor, staticProps);
          return Constructor;
        };
      }();

      _export('SplunkQueryBuilder', SplunkQueryBuilder = function () {
        function SplunkQueryBuilder(target) {
          _classCallCheck(this, SplunkQueryBuilder);

          this.target = target;
        }

        _createClass(SplunkQueryBuilder, null, [{
          key: 'build',
          value: function build(target) {
            var interpolatedSource = interpolateSource(target.index, target.sourcetype);
            var interpolatedQuery = void 0;

            if (target.resultFormat && target.resultFormat === 'table') {
              interpolatedQuery = interpolateStatsPart(target);
            } else {
              interpolatedQuery = interpolateTimechartPart(target);
            }

            return interpolatedSource + ' | ' + interpolatedQuery;
          }
        }, {
          key: 'buildGetFields',
          value: function buildGetFields(index, sourcetype) {
            var interpolatedSource = interpolateSource(index, sourcetype);
            return interpolatedSource + ' | fieldsummary maxvals=1';
          }
        }, {
          key: 'renderOptions',
          value: function renderOptions(tcOptions, binOptions, options) {
            return _renderOptions(tcOptions, binOptions, options);
          }
        }]);

        return SplunkQueryBuilder;
      }());

      _export('SplunkQueryBuilder', SplunkQueryBuilder);
    }
  };
});
//# sourceMappingURL=query_builder.js.map
