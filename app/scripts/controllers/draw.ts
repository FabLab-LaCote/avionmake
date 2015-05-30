/// <reference path="../app.ts" />
'use strict';

module avionmakeApp {
  export interface IMainScope extends ng.IScope {
    plane: any;
  }

  export class DrawCtrl {

    constructor (private $scope: IMainScope, planes: avionmakeApp.Planes) {
      if(!planes.currentPlane){
        planes.currentPlane = planes.createPlane('plane1');  
      }
      $scope.plane = planes.currentPlane;
    }
  }
}

angular.module('avionmakeApp')
  .controller('DrawCtrl', avionmakeApp.DrawCtrl);
