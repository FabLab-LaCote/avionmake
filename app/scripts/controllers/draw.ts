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
  export interface IMainScope extends ng.IScope {
    plane: Plane;
  }

  export class DrawCtrl {
    /*@ngInject*/
    constructor (private $scope: IMainScope,
      private planes: avionmakeApp.Planes,
      private $routeParams:ng.route.IRouteParamsService,
      private $http:ng.IHttpService, BASE_URL,
      private $location:ng.ILocationService) {
      if($routeParams['id']){
        $http.get(BASE_URL + '/api/plane/' + $routeParams['id'])
        .success((data:any)=>{
          if(data){
            var p = planes.createPlane(data.type);
            p.fromJSON(data);
            if(p.printState >= PrintState.PRINT){
              setTimeout(()=>{
                $location.path('cut');
              },1);
            }else{
              planes.currentPlane = p;
              $scope.plane = planes.currentPlane;
              planes.saveLocal();

            }
          }else{
            $location.path('/');
          }
        });
      }else{
        if(!planes.currentPlane){
          $location.path('/');
        }
        $scope.plane = planes.currentPlane;
        if($scope.plane.printState >= PrintState.PRINT){
          setTimeout(()=>{
            $location.path('cut');
          },1);
        }
      }
    }
  }
}

angular.module('avionmakeApp')
  .controller('DrawCtrl', avionmakeApp.DrawCtrl);
