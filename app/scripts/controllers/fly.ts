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
  export interface IFlyScope extends ng.IScope {
      scores:any[];
      filter:string;
  }

  export class FlyCtrl {
    /*@ngInject*/
    constructor (private $scope: IFlyScope, $http:ng.IHttpService, BASE_URL, $timeout:ng.ITimeoutService) {


      var timer;
      function getScore(){
        $http.get(BASE_URL + '/api/scores')
          .success((data:any)=>{
            $scope.scores = data;
           if (timer) {
                $timeout.cancel(timer);
            }
            timer = $timeout(getScore, 30000);
          });

      }
      getScore();

      $scope.$on("$destroy", function() {
          if (timer) {
              $timeout.cancel(timer);
          }
      });
    }
  }
}

angular.module('avionmakeApp')
  .controller('FlyCtrl', avionmakeApp.FlyCtrl);
