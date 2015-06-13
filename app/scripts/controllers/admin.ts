/// <reference path="../app.ts" />

'use strict';

module avionmakeApp {
  export interface IAdminScope extends ng.IScope {
    data:any[];
    stats:any;
    filter:number;
    selectedIndex:number
  }

  export class AdminCtrl {
     /*@ngInject*/
    constructor (private $scope: IAdminScope, $http:ng.IHttpService, BASE_URL) {
        $scope.selectedIndex = Number(localStorage.getItem('adminTab')) || 1;
        $scope.filter = Number(localStorage.getItem('adminFilter')) || 2;
        $scope.$watch('selectedIndex', function(current, old){
          localStorage.setItem('adminTab', String($scope.selectedIndex));
          localStorage.setItem('adminFilter', String($scope.filter));
        });
        
        
        
        $http.get(BASE_URL + '/api/stats')
          .success((data:any)=>{
            $scope.data = data;
            $scope.stats = data.reduce((agg, p)=>{
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
            },{types:{}, states:{}, total:0});
            
          });
    }
  }
}

angular.module('avionmakeApp')
  .controller('AdminCtrl', avionmakeApp.AdminCtrl);
