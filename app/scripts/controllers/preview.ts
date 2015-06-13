/// <reference path="../app.ts" />

'use strict';

module avionmakeApp {
  export interface IAboutScope extends ng.IScope {
    showPDF: boolean;
    pdfSrc: string;
    planesService:Planes;
    error: string;
  }

  declare function PDFDocument(args:any):void;
  declare function blobStream():void;

  export class PreviewCtrl {
    /*@ngInject*/
    constructor (private $scope: IAboutScope, planes:Planes, BASE_URL) {
      $scope.planesService = planes;
      var createPDF = ()=>{
          $scope.showPDF = false;
          $scope.error = '';
          var plane:Plane = planes.currentPlane;
          if(plane.printState >= PrintState.PRINT){
              $scope.pdfSrc = BASE_URL + '/api/pdf/'+ plane._id + (planes.mergePDF ? '?merge' : '');
              $scope.showPDF = true;
              return;
          }
          $scope.planesService.preview()
          .then((id)=>{
              $scope.pdfSrc = BASE_URL + '/api/pdf/'+ id + (planes.mergePDF ? '?merge' : ''); 
              $scope.showPDF = true;
          },(error)=>{
              $scope.error = error;
          }); 

      }; //createPDF
            
      $scope.$watch('planesService.mergePDF',()=>{
        createPDF();
      });
    }
  }
}

angular.module('avionmakeApp')
  .controller('PreviewCtrl', avionmakeApp.PreviewCtrl);
