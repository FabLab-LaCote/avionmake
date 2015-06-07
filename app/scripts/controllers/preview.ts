/// <reference path="../app.ts" />

'use strict';

module avionmakeApp {
  export interface IAboutScope extends ng.IScope {
    showPDF: boolean;
    planesService:Planes;
  }

  declare function PDFDocument(args:any):void;
  declare function blobStream():void;

  export class PreviewCtrl {
    /*@ngInject*/
    constructor (private $scope: IAboutScope, planes:Planes) {
      $scope.planesService = planes;
      var createPDF = ()=>{
        $scope.showPDF = false;
        var plane:Plane = planes.currentPlane;
        if(plane.printState >= PrintState.PRINT){
          $scope.showPDF = true;
          //TODO: what if pdf missing?
          return;
        }
        plane.printState = PrintState.NONE; 

        /*
        stream.on('finish', function() {
          if(window.navigator.msSaveOrOpenBlob){
            window.navigator.msSaveOrOpenBlob(stream.toBlob(),'avion.pdf');
          }else{
            (<HTMLIFrameElement>document.getElementById('pdf')).src = stream.toBlobURL('application/pdf');
            $scope.$apply(()=>{
              $scope.showPDF = true;
            });
          }
          $scope.$apply(()=>{
            plane.printState = 1;
          });
        });
        */
      }; //createPDF
      $scope.$watch('planesService.mergePDF',()=>{
        createPDF();
      });
    }
  }
}

angular.module('avionmakeApp')
  .controller('PreviewCtrl', avionmakeApp.PreviewCtrl);
