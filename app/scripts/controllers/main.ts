/// <reference path="../app.ts" />
'use strict';

module avionmakeApp {
  export interface IMainScope extends ng.IScope {
    awesomeThings: any[];
    plane: any;
  }

  export class MainCtrl {

    constructor (private $scope: IMainScope, planes: avionmakeApp.Planes) {
      $scope.plane = planes.plane1;
      $scope.awesomeThings = [
        'HTML5 Boilerplate',
        'AngularJS',
        'Karma'
      ];
    }
  }
}

angular.module('avionmakeApp')
  .controller('MainCtrl', avionmakeApp.MainCtrl);
