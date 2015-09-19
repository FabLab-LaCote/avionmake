/*

This file is part of avionmake.

Copyright (C) 2015  Boris Fritscher

This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, see http://www.gnu.org/licenses/.

*/

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
