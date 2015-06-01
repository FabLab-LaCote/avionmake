/// <reference path="../app.ts" />
'use strict';

module avionmakeApp {
  export interface IStateScope extends ng.IScope {
    planesService:Planes;
  }

  export class StateCtrl {
  
    state:string;
    brushSize:number;
    /*@ngInject*/
    constructor (private $scope: IStateScope, 
      private $location:ng.ILocationService,
      private planes:Planes,
      private $mdSidenav:angular.material.MDSidenavService,
      private $translate:angular.translate.ITranslateService,
      private $mdDialog: angular.material.MDDialogService) {
      $scope.planesService = planes;
      $scope.$on('$routeChangeSuccess',()=>{
        this.state = $location.path();
      });
      $scope.$watch('planesService.currentPlane.printState',(newValue, oldValue)=>{
        if(oldValue !== newValue){
          planes.saveLocal();
        }
      });
    }
    openMenu(){
      this.$mdSidenav('left').toggle();
    }
    changeLanguage(langKey:string){
      this.$translate.use(langKey);
    }
    isLockedOpen():boolean{
      return this.$mdSidenav('left').isLockedOpen();
    }
    
    confirmPrintPlane(evt){
      this.$translate(['CONFIRM_PRINT_TITLE','CONFIRM_PRINT_CONTENT','CONFIRM_PRINT_OK','CONFIRM_PRINT_CANCEL']).then((translations)=>{
          var confirm = this.$mdDialog.confirm()
          .title(translations['CONFIRM_PRINT_TITLE'])
          .content(translations['CONFIRM_PRINT_CONTENT'])
          .ok(translations['CONFIRM_PRINT_OK'])
          .cancel(translations['CONFIRM_PRINT_CANCEL'])
          .targetEvent(evt);
          this.$mdDialog.show(confirm).then(()=> {
            this.planes.currentPlane.printState = PrintState.PRINT;
            this.$location.path('cut');
          });
        })
    }
  }
}

angular.module('avionmakeApp')
  .controller('StateCtrl', avionmakeApp.StateCtrl);
