import _ from 'lodash';
import angular from 'angular';
import moment from 'moment';

import * as rangeUtil from 'app/core/utils/rangeutil';

export class TimePickerCtrl {
  static tooltipFormat = 'MMM D, YYYY HH:mm:ss';
  static defaults = {
    time_options: ['5m', '15m', '1h', '6h', '12h', '24h', '2d', '7d', '30d'],
    refresh_intervals: ['5s', '10s', '30s', '1m', '5m', '15m', '30m', '1h', '2h', '1d'],
  };

  dashboard: any;
  panel: any;
  absolute: any;
  timeRaw: any;
  editTimeRaw: any;
  tooltip: string;
  rangeString: string;
  timeOptions: any;
  refresh: any;
  isUtc: boolean;
  firstDayOfWeek: number;
  isOpen: boolean;
  isAbsolute: boolean;

  /** @ngInject */
  constructor(private $scope, private $rootScope, private timeSrv) {
    this.$scope.ctrl = this;

    $rootScope.onAppEvent('shift-time-forward', () => this.move(1), $scope);
    $rootScope.onAppEvent('shift-time-backward', () => this.move(-1), $scope);
    $rootScope.onAppEvent('refresh', this.onRefresh.bind(this), $scope);
    $rootScope.onAppEvent('closeTimepicker', this.openDropdown.bind(this), $scope);

    // init options
    this.panel = this.dashboard.timepicker;
    _.defaults(this.panel, TimePickerCtrl.defaults);
    this.firstDayOfWeek = moment.localeData().firstDayOfWeek();

    // init time stuff
    this.onRefresh();
  }

  onRefresh() {
    const time = angular.copy(this.timeSrv.timeRange());
    const timeRaw = angular.copy(time.raw);
    //Added for time range to show for one year data
    this.minDate = new Date(new Date().setFullYear(new Date().getFullYear() - 1));

    if (!this.dashboard.isTimezoneUtc()) {
      time.from.local();
      time.to.local();
      if (moment.isMoment(timeRaw.from)) {
        timeRaw.from.local();
      }
      if (moment.isMoment(timeRaw.to)) {
        timeRaw.to.local();
      }
      this.isUtc = false;
    } else {
      this.isUtc = true;
    }

    this.rangeString = rangeUtil.describeTimeRange(timeRaw);
    this.absolute = { fromJs: time.from.toDate(), toJs: time.to.toDate() };
    this.tooltip = this.dashboard.formatDate(time.from) + ' <br>to<br>';
    this.tooltip += this.dashboard.formatDate(time.to);
    this.timeRaw = timeRaw;
    this.isAbsolute = moment.isMoment(this.timeRaw.to);
  }

  zoom(factor) {
    this.$rootScope.appEvent('zoom-out', 2);
  }

  move(direction) {
    const range = this.timeSrv.timeRange();

    const timespan = (range.to.valueOf() - range.from.valueOf()) / 2;
    let to, from;
    if (direction === -1) {
      to = range.to.valueOf() - timespan;
      from = range.from.valueOf() - timespan;
    } else if (direction === 1) {
      to = range.to.valueOf() + timespan;
      from = range.from.valueOf() + timespan;
      if (to > Date.now() && range.to < Date.now()) {
        to = Date.now();
        from = range.from.valueOf();
      }
    } else {
      to = range.to.valueOf();
      from = range.from.valueOf();
    }

    this.timeSrv.setTime({ from: moment.utc(from), to: moment.utc(to) });
  }

  openDropdown() {
    if (this.isOpen) {
      this.closeDropdown();
      return;
    }

    this.onRefresh();
    this.editTimeRaw = this.timeRaw;
    this.timeOptions = rangeUtil.getRelativeTimesList(this.panel, this.rangeString);
    this.refresh = {
      value: this.dashboard.refresh,
      options: _.map(this.panel.refresh_intervals, (interval: any) => {
        return { text: interval, value: interval };
      }),
    };

    this.refresh.options.unshift({ text: 'off' });
    this.isOpen = true;
    this.$rootScope.appEvent('timepickerOpen');
  }

  closeDropdown() {
    this.isOpen = false;
    this.$rootScope.appEvent('timepickerClosed');
  }

  applyCustom() {

    if(this.editTimeRaw.from._isAMomentObject == true){
      if(this.editTimeRaw.from < this.minDate.setHours(0,0,0,0)){                 
      	this.editTimeRaw.from = this.getAbsoluteMomentForTimezone(this.minDate.setHours(0,0,0,0));      
      }
    }else{
      if(this.editTimeRaw.from.substr(this.editTimeRaw.from.length -1) == "d"){       
        if(this.editTimeRaw.from.slice(3,-1) < -365){     
               this.editTimeRaw.from = "now-365d";         
                }
      }       
      else if(this.editTimeRaw.from.substr(this.editTimeRaw.from.length -1) == "h"){    
            if(this.editTimeRaw.from.slice(3,-1) < -8760){  
                      this.editTimeRaw.from = "now-8760h";      
                          }
      }      
       else if(this.editTimeRaw.from.substr(this.editTimeRaw.from.length -1) == "y"){          
         if(this.editTimeRaw.from.slice(3,-1) < -1){            
         	this.editTimeRaw.from = "now-1y";          
         }
       }       
       else if(this.editTimeRaw.from.substr(this.editTimeRaw.from.length -1) == "w"){         
           if(this.editTimeRaw.from.slice(3,-1) < -52){           
            this.editTimeRaw.from = "now-52w";         
             }            
              }      
               else if(this.editTimeRaw.from.substr(this.editTimeRaw.from.length -1) == "M"){  
                      if(this.editTimeRaw.from.slice(3,-1) < -12){          
                        this.editTimeRaw.from = "now-12M";          
                    }             
                }      
                 else if(this.editTimeRaw.from.substr(this.editTimeRaw.from.length -1) == "m"){   
                       if(this.editTimeRaw.from.slice(3,-1) < -525600){          
                         this.editTimeRaw.from = "now-525600m";         
                          }            
                           }       
                           else if(this.editTimeRaw.from.substr(this.editTimeRaw.from.length -1) == "s"){  
                                          if(this.editTimeRaw.from.slice(3,-1) < -31536000){    
                                                  this.editTimeRaw.from = "now-31536000s";        
                                                    }
      }
    }
    if (this.refresh.value !== this.dashboard.refresh) {
      this.timeSrv.setAutoRefresh(this.refresh.value);
    }

    this.timeSrv.setTime(this.editTimeRaw);
    this.closeDropdown();
  }
  // Added setHours(0,0,0,0) 
  absoluteFromChanged() {
    this.editTimeRaw.from = this.getAbsoluteMomentForTimezone(this.absolute.fromJs);
  }

  absoluteToChanged() {
    this.editTimeRaw.to = this.getAbsoluteMomentForTimezone(this.absolute.toJs);
  }

  getAbsoluteMomentForTimezone(jsDate) {
    return this.dashboard.isTimezoneUtc() ? moment(jsDate).utc() : moment(jsDate);
  }

  setRelativeFilter(timespan) {
    const range = { from: timespan.from, to: timespan.to };

    if (this.panel.nowDelay && range.to === 'now') {
      range.to = 'now-' + this.panel.nowDelay;
    }

    this.timeSrv.setTime(range);
    this.closeDropdown();
  }
}

export function settingsDirective() {
  return {
    restrict: 'E',
    templateUrl: 'public/app/features/dashboard/timepicker/settings.html',
    controller: TimePickerCtrl,
    bindToController: true,
    controllerAs: 'ctrl',
    scope: {
      dashboard: '=',
    },
  };
}

export function timePickerDirective() {
  return {
    restrict: 'E',
    templateUrl: 'public/app/features/dashboard/timepicker/timepicker.html',
    controller: TimePickerCtrl,
    bindToController: true,
    controllerAs: 'ctrl',
    scope: {
      dashboard: '=',
    },
  };
}

angular.module('grafana.directives').directive('gfTimePickerSettings', settingsDirective);
angular.module('grafana.directives').directive('gfTimePicker', timePickerDirective);

import { inputDateDirective } from './input_date';
angular.module('grafana.directives').directive('inputDatetime', inputDateDirective);
