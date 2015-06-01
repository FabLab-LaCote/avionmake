/// <reference path="../app.ts" />

'use strict';

module avionmakeApp {
  export interface IChoiceScope extends ng.IScope {
    
  }

  export class ChoiceCtrl {
    
    planesCatalog:Plane[];
    /*@ngInject*/
    constructor (private $scope: IChoiceScope, private planes:Planes, private $location:ng.ILocationService,
                  private $mdDialog: angular.material.MDDialogService, private $translate:angular.translate.ITranslateService) {
      this.planesCatalog =  Object.keys(planes.templates).map((type)=>{
        return planes.createPlane(type);
      });
    }
    selectPlane(evt, plane:Plane){
      if(this.planes.currentPlane){
        this.$translate(['CONFIRM_NEWPLANE_TITLE','CONFIRM_NEWPLANE_CONTENT','CONFIRM_NEWPLANE_OK','CONFIRM_NEWPLANE_CANCEL']).then((translations)=>{
          var confirm = this.$mdDialog.confirm()
          .title(translations['CONFIRM_NEWPLANE_TITLE'])
          .content(translations['CONFIRM_NEWPLANE_CONTENT'])
          .ok(translations['CONFIRM_NEWPLANE_OK'])
          .cancel(translations['CONFIRM_NEWPLANE_CANCEL'])
          .targetEvent(evt);
          this.$mdDialog.show(confirm).then(()=> {
            this.planes.currentPlane = plane;
            this.$location.path('draw');
          });
        })
      }else{
        this.planes.currentPlane = plane;
        this.$location.path('draw');
      }
    }
  }
}

angular.module('avionmakeApp')
  .controller('ChoiceCtrl', avionmakeApp.ChoiceCtrl);
