/// <reference path="../app.ts" />
'use strict';

module avionmakeApp {
  export interface IMainScope extends ng.IScope {
    plane: Plane;
  }

  export class DrawCtrl {
    /*@ngInject*/
    constructor (private $scope: IMainScope,
      private planes: avionmakeApp.Planes,
      private $location:ng.ILocationService) {
      if(!planes.currentPlane){
        planes.currentPlane = planes.createPlane('plane1');  
      }
      $scope.plane = planes.currentPlane;
      if($scope.plane.printState >= PrintState.PRINT){
        setTimeout(()=>{
          $location.path('cut');
        },1);
      }
    }
  }
}

angular.module('avionmakeApp')
  .controller('DrawCtrl', avionmakeApp.DrawCtrl);
