/// <reference path="../app.ts" />
'use strict';

module avionmakeApp {
  export interface IMainScope extends ng.IScope {
    awesomeThings: any[];
    plane: any;
  }

  export class MainCtrl {

    constructor (private $scope: IMainScope, planes: avionmakeApp.Planes) {
      planes.createPlane('plane1');
      $scope.plane = planes.currentPlane;
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
