/// <reference path="../app.ts" />

'use strict';

module avionmakeApp {
  export interface IToolbarScope extends ng.IScope {
    
  }

  export class ToolbarCtrl {
    /*@ngInject*/
    constructor (private $scope: IToolbarScope) {
       
    }
  }
}

angular.module('avionmakeApp')
  .controller('ToolbarCtrl', avionmakeApp.ToolbarCtrl);
