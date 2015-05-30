/// <reference path="../app.ts" />

'use strict';

module avionmakeApp {
  export interface IToolbarScope extends ng.IScope {
    
  }

  export class ToolbarCtrl {

    state:string;

    constructor (private $scope: IToolbarScope) {
      this.state = 'draw'; 
    }
  }
}

angular.module('avionmakeApp')
  .controller('ToolbarCtrl', avionmakeApp.ToolbarCtrl);
