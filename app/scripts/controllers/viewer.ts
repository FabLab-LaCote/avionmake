/// <reference path="../app.ts" />

'use strict';

module avionmakeApp {
  export interface IViewerScope extends ng.IScope {
    plane:Plane
  }

  export class ViewerCtrl {
    /*@ngInject*/
    constructor (private $scope: IViewerScope, private $routeParams:ng.route.IRouteParamsService, 
      private $http:ng.IHttpService, private planes:Planes, BASE_URL) {
      if($routeParams['id']){
        $http.get(BASE_URL + '/api/plane/' + $routeParams['id'])
        .success((data:any)=>{
          var p = planes.createPlane(data.type);
          p.fromJSON(data);
          $scope.plane = p;
        });
      }else{
        $scope.plane = planes.currentPlane;
      }
    }
  }
}

angular.module('avionmakeApp')
  .controller('ViewerCtrl', avionmakeApp.ViewerCtrl);
