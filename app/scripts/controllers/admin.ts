/// <reference path="../app.ts" />

'use strict';

module avionmakeApp {
  export interface IAdminScope extends ng.IScope {
    awesomeThings: any[];
  }

  export class AdminCtrl {

    constructor (private $scope: IAdminScope) {
      $scope.awesomeThings = [
        'HTML5 Boilerplate',
        'AngularJS',
        'Karma'
      ];
    }
  }
}

angular.module('avionmakeApp')
  .controller('AdminCtrl', avionmakeApp.AdminCtrl);
