/// <reference path="../app.ts" />

'use strict';

module avionmakeApp {
  export interface IPrintDialogScope extends ng.IScope {
    
  }

  export class PrintDialogCtrl {

    /*@ngInject*/
    constructor (private $scope: IPrintDialogScope, private $mdDialog:ng.material.MDDialogService) {
      
    }
    
    sendEmail:boolean = true;
    info:any= {
      name: '',
      email: undefined,
      newsletter: true,
      pcode: undefined
    }
    cancel = function() {
      this.$mdDialog.cancel();
    };
    print = function() {
      this.$mdDialog.hide(this.info);
    };
  }
}

angular.module('avionmakeApp')
  .controller('PrintDialogCtrl', avionmakeApp.PrintDialogCtrl);
