import {Datasource} from "../module";
import Q from "q";
import sinon from 'sinon';

describe('SplunkDatasource', () => {
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
    ctx.ds = new Datasource(instanceSettings, {}, ctx.templateSrv);
  });
});
