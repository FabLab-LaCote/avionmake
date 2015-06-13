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
