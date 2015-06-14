/// <reference path="../app.ts" />
'use strict';

module avionmakeApp {
  export interface IStateScope extends ng.IScope {
    planesService:Planes;
  }

  export class StateCtrl {
  
    state:string;
    brushSize:number;
    isLoading:boolean=false;
    
    /*@ngInject*/
    constructor (private $scope: IStateScope, 
      private $location:ng.ILocationService,
      private planes:Planes,
      private $mdSidenav:angular.material.MDSidenavService,
      private $translate:angular.translate.ITranslateService,
      private $mdDialog: angular.material.MDDialogService,
      private BASE_URL) {
      $scope.planesService = planes;
      $scope.$on('$routeChangeSuccess',()=>{
        this.state = $location.path();
      });
      $scope.$watch('planesService.currentPlane.printState',(newValue, oldValue)=>{
        if(oldValue !== newValue){
          planes.saveLocal();
        }
      });
      var lang = localStorage.getItem('lang');
      if(lang){
        this.changeLanguage(lang);
      }
    }
    
    openMenu(){
      this.$mdSidenav('left').toggle();
    }
    changeLanguage(langKey:string){
      localStorage.setItem('lang', langKey);
      this.$translate.use(langKey);
    }
    isLockedOpen():boolean{
      return this.$mdSidenav('left').isLockedOpen();
    }
    
    confirmPrintPlane(event){
      this.$mdDialog.show({
        templateUrl: 'views/printdialog.html',
        controller: 'PrintDialogCtrl',
        controllerAs: 'ctrl',
        targetEvent: event,
      }).then((info)=>{
        //send print+info to server
        this.isLoading = true;
        info.lang = this.$translate.use();
        this.planes.print(info).then((mode)=>{
          this.isLoading = false;
          if(mode === 'print@home'){
            this.$location.path('cut');  
          }else{
            this.$location.path('v/' + this.planes.currentPlane._id);
            this.$translate(['ALERT_PRINTOK_TITLE','ALERT_PRINTOK_CONTENT','ALERT_PRINTOK_OK'],{
              name: info.name,
              id: this.planes.currentPlane._id
            }).then((translations)=>{
              var alert = this.$mdDialog.alert()
              .title(translations['ALERT_PRINTOK_TITLE'])
              .content(translations['ALERT_PRINTOK_CONTENT'])
              .ok(translations['ALERT_PRINTOK_OK']);
              this.$mdDialog.show(alert)
              .finally(()=>{
                this.planes.currentPlane = null;
                this.planes.deleteLocal();
              });
            });
          }
          
            
        });
      });
    }
    
    getPDF(type){
      return this.BASE_URL + '/api/finalpdf/'+ this.planes.currentPlane._id + '?type=' + type;
    }
  }
}

angular.module('avionmakeApp')
  .controller('StateCtrl', avionmakeApp.StateCtrl);
