/// <reference path="../app.ts" />

'use strict';

module avionmakeApp {
  export interface IChoiceScope extends ng.IScope {
    
  }

  export class ChoiceCtrl {
    
    planesCatalog:Plane[]; 
    constructor (private $scope: IChoiceScope, private planes:Planes) {
      this.planesCatalog =  Object.keys(planes.templates).map((type)=>{
        return planes.createPlane(type);
      });
    }
    selectPlane(plane:Plane){
      this.planes.currentPlane = plane;
    }
  }
}

angular.module('avionmakeApp')
  .controller('ChoiceCtrl', avionmakeApp.ChoiceCtrl);
