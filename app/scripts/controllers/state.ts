/// <reference path="../app.ts" />

'use strict';

module avionmakeApp {
  export interface IStateScope extends ng.IScope {
    
  }

  export class StateCtrl {
  
    state:string;
    
    constructor (private $scope: IStateScope, 
      private $location:ng.ILocationService,
      private $mdSidenav:any) {
      $scope.$on('$routeChangeSuccess',()=>{
        this.state = $location.path();
      });
    }
    openMenu(){
      this.$mdSidenav('left').toggle();
    }
  }
}

angular.module('avionmakeApp')
  .controller('StateCtrl', avionmakeApp.StateCtrl);
