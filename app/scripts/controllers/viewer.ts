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
  export interface IViewerScope extends ng.IScope {
    plane:Plane;
    tween:boolean;
    getNextPlane(manual:boolean):void;
    mode:string;
    value:number;
  }

  export class ViewerCtrl {
    /*@ngInject*/
    constructor (private $scope: IViewerScope, private $routeParams:ng.route.IRouteParamsService,
      private $http:ng.IHttpService, private planes:Planes, BASE_URL, $timeout:ng.ITimeoutService) {
      if($routeParams['id']){
        $scope.mode = 'indeterminate';
        $http.get(BASE_URL + '/api/plane/' + $routeParams['id'])
        .success((data:any)=>{
          var p = planes.createPlane(data.type);
          p.fromJSON(data);
          $scope.plane = p;
          $scope.mode = 'determinate';
          $scope.value = 0;
        });
      }else{
        $scope.tween = true;
        var timer;
        $scope.getNextPlane = function getNextPlane(manual){
          $scope.tween = !manual;
          var id = planes.currentGalleryId || 'FL-1';
          $scope.mode = 'indeterminate';
          $http.get(BASE_URL + '/api/nextplanes/' + id + '/1')
          .success((data:any)=>{
            var p = planes.createPlane(data[0].type);
            p.fromJSON(data[0]);
            $scope.plane = p;
            planes.currentGalleryId = p._id;
            if (timer) {
                $timeout.cancel(timer);
            }
            $scope.mode = 'determinate';
            $scope.value = 0;
            timer = $timeout($scope.getNextPlane, 20000);
          });
        };
        $scope.getNextPlane(false);


        $scope.$on("$destroy", function() {
            if (timer) {
                $timeout.cancel(timer);
            }
        });
      }
    }
  }
}

angular.module('avionmakeApp')
  .controller('ViewerCtrl', avionmakeApp.ViewerCtrl);
