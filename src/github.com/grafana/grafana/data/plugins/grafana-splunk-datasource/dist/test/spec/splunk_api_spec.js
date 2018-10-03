"use strict";

var _splunk_api = require("../splunk_api");

var _q = require("q");

var _q2 = _interopRequireDefault(_q);

var _sinon = require("sinon");

var _sinon2 = _interopRequireDefault(_sinon);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('SplunkAPI', function () {
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

    var paramSerializer = function paramSerializer(data) {
      return data;
    };

    var SplunkApi = (0, _splunk_api.splunkAPIFactory)(paramSerializer, ctx.backendSrv);
    ctx.ds = new SplunkApi(instanceSettings);
  });

  describe('When doing Splunk API POST request', function () {
    beforeEach(function () {
      ctx.url = '/services/search/jobs';
      ctx.data = {
        search: 'search *',
        earliest_time: 1470000000,
        latest_time: 1470000001
      };
    });

    it('should serialize params', function (done) {
      var paramSerializer = _sinon2.default.spy(ctx.ds, 'paramSerializer');

      ctx.ds._post(ctx.url, ctx.data);
      expect(paramSerializer).to.have.been.calledWith(ctx.data);
      done();
    });

    it('should send request with proper params and headers', function (done) {
      var expected_params = {
        method: 'POST',
        url: 'https://localhost:8089/services/search/jobs',
        data: ctx.data,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      };
      var datasourceRequest = _sinon2.default.spy(ctx.ds.backendSrv, 'datasourceRequest');

      ctx.ds._post(ctx.url, ctx.data);
      expect(datasourceRequest).to.have.been.calledWith(expected_params);
      done();
    });
  });

  describe('When doing Splunk API GET request', function () {
    beforeEach(function () {
      ctx.ds.backendSrv.datasourceRequest = function () {
        return _q2.default.when({ status: 200 });
      };

      ctx.url = '/services/search/jobs/123';
      ctx.params = {
        count: 0
      };
    });

    it('should send request with proper params', function (done) {
      var expected_params = {
        method: 'GET',
        url: 'https://localhost:8089/services/search/jobs/123',
        params: {
          output_mode: 'json',
          count: 0
        }
      };
      var datasourceRequest = _sinon2.default.spy(ctx.ds.backendSrv, 'datasourceRequest');

      ctx.ds._get(ctx.url, ctx.params);
      expect(datasourceRequest).to.have.been.calledWith(expected_params);
      done();
    });

    it('should send proper request if no params passed', function (done) {
      var expected_params = {
        method: 'GET',
        url: 'https://localhost:8089/services/search/jobs/123',
        params: {
          output_mode: 'json'
        }
      };
      var datasourceRequest = _sinon2.default.spy(ctx.ds.backendSrv, 'datasourceRequest');

      ctx.ds._get(ctx.url);
      expect(datasourceRequest).to.have.been.calledWith(expected_params);
      done();
    });
  });
});
//# sourceMappingURL=splunk_api_spec.js.map
