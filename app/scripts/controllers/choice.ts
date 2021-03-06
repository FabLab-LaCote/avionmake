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
  export interface IChoiceScope extends ng.IScope {

  }

  export class ChoiceCtrl {

    planesCatalog:any[];
    /*@ngInject*/
    constructor (private $scope: IChoiceScope, private planes:Planes, private $location:ng.ILocationService,
                  private $mdDialog: angular.material.MDDialogService, private $translate:angular.translate.ITranslateService) {

      this.planesCatalog =  [
        {
          plane: planes.createPlane('plane1'),
          type: 'plane1',
          difficulty: 1,
          time: 1
        },
        {
          plane: planes.createPlane('biplane1'),
          type: 'biplane1',
          difficulty: 4,
          time: 4
        },
        {
          plane: planes.createPlane('fighter1'),
          type: 'fighter1',
          difficulty: 4,
          time: 3
        }
        /*
        ,
        {
          plane: planes.createPlane('plane1'),
          type: 'birdplane1',
          difficulty: 1,
          time: 1
        },
        {
          plane: planes.createPlane('plane1'),
          type: 'seaplane1',
          difficulty: 1,
          time: 2
        }
        */
      ]
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
            plane.created = new Date();
            this.planes.currentPlane = plane;
            this.$location.path('draw');
          });
        })
      }else{
        plane.created = new Date();
        this.planes.currentPlane = plane;
        this.$location.path('draw');
      }
    }
    showCurrentPlane(){
      this.$location.path('draw');
    }
  }
}

angular.module('avionmakeApp')
  .controller('ChoiceCtrl', avionmakeApp.ChoiceCtrl);
