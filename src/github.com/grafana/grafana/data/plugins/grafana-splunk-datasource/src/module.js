import {SplunkDatasource} from './datasource';
import {SplunkQueryCtrl} from './query_ctrl';

class SplunkConfigCtrl {}
SplunkConfigCtrl.templateUrl = 'partials/config.html';

class SplunkQueryOptionsCtrl {}
SplunkQueryOptionsCtrl.templateUrl = 'partials/query.options.html';

class SplunkAnnotationsQueryCtrl {}
SplunkAnnotationsQueryCtrl.templateUrl = 'partials/annotations.editor.html';

export {
  SplunkDatasource as Datasource,
  SplunkConfigCtrl as ConfigCtrl,
  SplunkQueryCtrl as QueryCtrl,
  SplunkQueryOptionsCtrl as QueryOptionsCtrl,
  SplunkAnnotationsQueryCtrl as AnnotationsQueryCtrl
};
