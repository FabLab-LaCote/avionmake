/// <reference path="../app.ts" />

'use strict';

module avionmakeApp {
  export interface IViewerScope extends ng.IScope {
    awesomeThings: any[];
  }

  export class ViewerCtrl {

    constructor (private $scope: IViewerScope) {
      $scope.awesomeThings = [
        'HTML5 Boilerplate',
        'AngularJS',
        'Karma'
      ];
    }
  }
}

angular.module('avionmakeApp')
  .controller('ViewerCtrl', avionmakeApp.ViewerCtrl);
