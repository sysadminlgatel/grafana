import {splunkAPIFactory} from "../splunk_api";
import Q from "q";
import sinon from 'sinon';

describe('SplunkAPI', () => {
  let ctx = {};
  let defined = sinon.match.defined;

  beforeEach(function() {
    ctx.$q = Q;
    ctx.backendSrv = {
      datasourceRequest: () => {
        return ctx.$q.when({
          status: 200
        });
      }
    };
    ctx.templateSrv = {};
    let instanceSettings = {
      url: 'https://localhost:8089',
      jsonData: {
        streamMode: true
      }
    };

    let paramSerializer = (data) => data;

    let SplunkApi = splunkAPIFactory(paramSerializer, ctx.backendSrv);
    ctx.ds = new SplunkApi(instanceSettings);
  });

  describe('When doing Splunk API POST request', () => {
    beforeEach(function() {
      ctx.url = '/services/search/jobs';
      ctx.data = {
        search: 'search *',
        earliest_time: 1470000000,
        latest_time: 1470000001
      };
    });

    it('should serialize params', (done) => {
      let paramSerializer = sinon.spy(ctx.ds, 'paramSerializer');

      ctx.ds._post(ctx.url, ctx.data);
      expect(paramSerializer).to.have.been.calledWith(ctx.data);
      done();
    });

    it('should send request with proper params and headers', (done) => {
      let expected_params = {
        method: 'POST',
        url: 'https://localhost:8089/services/search/jobs',
        data: ctx.data,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      };
      let datasourceRequest = sinon.spy(ctx.ds.backendSrv, 'datasourceRequest');

      ctx.ds._post(ctx.url, ctx.data);
      expect(datasourceRequest).to.have.been.calledWith(expected_params);
      done();
    });
  });

  describe('When doing Splunk API GET request', () => {
    beforeEach(function() {
      ctx.ds.backendSrv.datasourceRequest = () => Q.when({status: 200});

      ctx.url = '/services/search/jobs/123';
      ctx.params = {
        count: 0
      };
    });

    it('should send request with proper params', (done) => {
      let expected_params = {
        method: 'GET',
        url: 'https://localhost:8089/services/search/jobs/123',
        params: {
          output_mode: 'json',
          count: 0
        }
      };
      let datasourceRequest = sinon.spy(ctx.ds.backendSrv, 'datasourceRequest');

      ctx.ds._get(ctx.url, ctx.params);
      expect(datasourceRequest).to.have.been.calledWith(expected_params);
      done();
    });

    it('should send proper request if no params passed', (done) => {
      let expected_params = {
        method: 'GET',
        url: 'https://localhost:8089/services/search/jobs/123',
        params: {
          output_mode: 'json'
        }
      };
      let datasourceRequest = sinon.spy(ctx.ds.backendSrv, 'datasourceRequest');

      ctx.ds._get(ctx.url);
      expect(datasourceRequest).to.have.been.calledWith(expected_params);
      done();
    });
  });
});
