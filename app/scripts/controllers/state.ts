/// <reference path="../app.ts" />

'use strict';

module avionmakeApp {
  export interface IStateScope extends ng.IScope {
    
  }

  export class StateCtrl {
  
    state:string;
    
    constructor (private $scope: IStateScope, 
      private $location:ng.ILocationService,
      private planes:Planes,
      private $mdSidenav:angular.material.MDSidenavService) {
      $scope.$on('$routeChangeSuccess',()=>{
        this.state = $location.path();
        console.log(this.state);
      });
    }
    openMenu(){
      this.$mdSidenav('left').toggle();
    }
  }
}

angular.module('avionmakeApp')
  .controller('StateCtrl', avionmakeApp.StateCtrl);
