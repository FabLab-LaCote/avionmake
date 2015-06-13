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
