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
  export interface IAdminScope extends ng.IScope {
    data:any[];
    stats:any;
    filter:number;
    selectedIndex:number
    getData():void;
    setData(id:string, data:any):void;
    fly(p:any, event):void;
    cut(id:string);
  }

  export class AdminCtrl {
     /*@ngInject*/
    constructor (private $scope: IAdminScope,
        private $mdDialog:ng.material.MDDialogService,
        private $http:ng.IHttpService, BASE_URL) {

        $scope.selectedIndex = Number(localStorage.getItem('adminTab') || 1);
        $scope.filter = Number(localStorage.getItem('adminFilter')) || 2;
        $scope.$watch('selectedIndex', function(current, old){
          localStorage.setItem('adminTab', String($scope.selectedIndex));
          localStorage.setItem('adminFilter', String($scope.filter));
        });

        function updateStats(data){
          $scope.data = data;
          $scope.stats = data.reduce((agg, p)=>{
            if(p.hasOwnProperty('disabled') && p.disabled === true){
              agg.disabled++;
              return agg;
            }

            if(!agg.states.hasOwnProperty(p.printState)){
              agg.states[p.printState] = 0;
            }
            agg.states[p.printState]++;

            if(!agg.types.hasOwnProperty(p.type)){
              agg.types[p.type] = 0;
            }
            agg.types[p.type]++;
            agg.total++;

            return agg;
          },{types:{}, states:{}, total:0, disabled:0});
        }

        $scope.setData = function(id, data){
          $http.post(BASE_URL + '/api/set/' + id, data)
          .success(updateStats);
        };

        $scope.getData = function(){
          $http.get(BASE_URL + '/api/stats')
          .success(updateStats)
          .error(()=>{
            $http.post(BASE_URL + '/api/login', {username:'admin', password:prompt('password')})
            .success(()=>{
              $scope.getData();
            })
            .error((e)=>{
              alert('wrong');
              console.log(e);
            });
          });
        };

        $scope.cut = function(id) {
          $scope.setData(id, {
            printState: PrintState.CUT,
            cutDate: new Date()
          });
        }

        $scope.fly = function(planeInfo, event){
          $mdDialog.show({
            templateUrl: 'views/flydialog.html',
            controller: 'FlyDialogCtrl',
            targetEvent: event,
            locals:{
              planeInfo:planeInfo
            },
            onComplete: (scope, element)=>{
+              element[0].querySelector('[name=distance]').focus();
            }
          })
          .then((distance)=>{
            $scope.setData(planeInfo._id, {
              score: distance,
              printState: PrintState.FLY,
              flyDate: new Date()
            });
          });
        }

        $scope.getData();
      }
  }
}

/*@ngInject*/
function FlyDialogCtrl($scope, $mdDialog, planeInfo) {
  $scope.planeInfo = planeInfo;
  $scope.cancel = function() {
    $mdDialog.cancel();
  };
  $scope.save = function() {
    $mdDialog.hide($scope.distance);
  };
}
angular.module('avionmakeApp')
  .controller('FlyDialogCtrl', FlyDialogCtrl);

angular.module('avionmakeApp')
  .controller('AdminCtrl', avionmakeApp.AdminCtrl);
