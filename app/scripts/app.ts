/// <reference path="../../typings/angularjs/angular.d.ts" />
/// <reference path="../../typings/angularjs/angular-route.d.ts" />
/// <reference path="../../typings/angular-translate/angular-translate.d.ts" />
/// <reference path="../../typings/dat-gui/dat-gui.d.ts" />
/// <reference path="../../typings/threejs/three.d.ts" />
/// <reference path="services/planes.ts" />

'use strict';

angular.module('avionmakeApp', [
    'ngAnimate',
    'ngCookies',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'ngMaterial',
    'pascalprecht.translate'
  ])
  .config(($routeProvider:ng.route.IRouteProvider) => {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl',
        controllerAs: 'about'
      })
      .otherwise({
        redirectTo: '/'
      });
  })
  .config(($translateProvider:angular.translate.ITranslateProvider) =>{
    $translateProvider
      .translations('en', {
         
      });
      $translateProvider.preferredLanguage('en');
  });
