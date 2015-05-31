/// <reference path="../app.ts" />
'use strict';

module avionmakeApp {
  export interface IStateScope extends ng.IScope {
    
  }

  export class StateCtrl {
  
    state:string;
    brushSize:number;
    constructor (private $scope: IStateScope, 
      private $location:ng.ILocationService,
      private planes:Planes,
      private $mdSidenav:angular.material.MDSidenavService,
      private $translate:angular.translate.ITranslateService) {
      $scope.$on('$routeChangeSuccess',()=>{
        this.state = $location.path();
      });
    }
    openMenu(){
      this.$mdSidenav('left').toggle();
    }
    changeLanguage(langKey:string){
      this.$translate.use(langKey);
    }
  }
}

angular.module('avionmakeApp')
  .controller('StateCtrl', avionmakeApp.StateCtrl);
