'use strict';

System.register(['./datasource', './query_ctrl'], function (_export, _context) {
  "use strict";

  var SplunkDatasource, SplunkQueryCtrl, SplunkConfigCtrl, SplunkQueryOptionsCtrl, SplunkAnnotationsQueryCtrl;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  return {
    setters: [function (_datasource) {
      SplunkDatasource = _datasource.SplunkDatasource;
    }, function (_query_ctrl) {
      SplunkQueryCtrl = _query_ctrl.SplunkQueryCtrl;
    }],
    execute: function () {
      _export('ConfigCtrl', SplunkConfigCtrl = function SplunkConfigCtrl() {
        _classCallCheck(this, SplunkConfigCtrl);
      });

      SplunkConfigCtrl.templateUrl = 'partials/config.html';

      _export('QueryOptionsCtrl', SplunkQueryOptionsCtrl = function SplunkQueryOptionsCtrl() {
        _classCallCheck(this, SplunkQueryOptionsCtrl);
      });

      SplunkQueryOptionsCtrl.templateUrl = 'partials/query.options.html';

      _export('AnnotationsQueryCtrl', SplunkAnnotationsQueryCtrl = function SplunkAnnotationsQueryCtrl() {
        _classCallCheck(this, SplunkAnnotationsQueryCtrl);
      });

      SplunkAnnotationsQueryCtrl.templateUrl = 'partials/annotations.editor.html';

      _export('Datasource', SplunkDatasource);

      _export('ConfigCtrl', SplunkConfigCtrl);

      _export('QueryCtrl', SplunkQueryCtrl);

      _export('QueryOptionsCtrl', SplunkQueryOptionsCtrl);

      _export('AnnotationsQueryCtrl', SplunkAnnotationsQueryCtrl);
    }
  };
});
//# sourceMappingURL=module.js.map
