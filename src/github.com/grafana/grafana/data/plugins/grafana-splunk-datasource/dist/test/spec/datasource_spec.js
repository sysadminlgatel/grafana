"use strict";

var _module = require("../module");

var _q = require("q");

var _q2 = _interopRequireDefault(_q);

var _sinon = require("sinon");

var _sinon2 = _interopRequireDefault(_sinon);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('SplunkDatasource', function () {
  var ctx = {};
  var defined = _sinon2.default.match.defined;

  beforeEach(function () {
    ctx.$q = _q2.default;
    ctx.backendSrv = {
      datasourceRequest: function datasourceRequest() {
        return ctx.$q.when({
          status: 200
        });
      }
    };
    ctx.templateSrv = {};
    var instanceSettings = {
      url: 'https://localhost:8089',
      jsonData: {
        streamMode: true
      }
    };
    ctx.ds = new _module.Datasource(instanceSettings, {}, ctx.templateSrv);
  });
});
//# sourceMappingURL=datasource_spec.js.map
