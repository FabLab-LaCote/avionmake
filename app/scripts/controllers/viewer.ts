/// <reference path="../app.ts" />

'use strict';

module avionmakeApp {
  export interface IViewerScope extends ng.IScope {
    plane:Plane;
    tween:boolean;
    getNextPlane(manual:boolean):void;
  }

  export class ViewerCtrl {
    /*@ngInject*/
    constructor (private $scope: IViewerScope, private $routeParams:ng.route.IRouteParamsService, 
      private $http:ng.IHttpService, private planes:Planes, BASE_URL, $timeout:ng.ITimeoutService) {
      if($routeParams['id']){
        $http.get(BASE_URL + '/api/plane/' + $routeParams['id'])
        .success((data:any)=>{
          var p = planes.createPlane(data.type);
          p.fromJSON(data);
          $scope.plane = p;
        });
      }else{
        $scope.tween = true;
        var timer;
        $scope.getNextPlane = function getNextPlane(manual){
          $scope.tween = !manual;
          var id = planes.currentGalleryId || 'FL-1';
          $http.get(BASE_URL + '/api/nextplanes/' + id + '/1')
          .success((data:any)=>{
            var p = planes.createPlane(data[0].type);
            p.fromJSON(data[0]);
            $scope.plane = p;
            planes.currentGalleryId = p._id;
            if (timer) {
                $timeout.cancel(timer);
            }
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
