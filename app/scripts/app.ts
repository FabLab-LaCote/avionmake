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
        templateUrl: 'views/choice.html',
        controller: 'ChoiceCtrl',
        controllerAs: 'ctrl'
      })
      .when('/draw', {
        templateUrl: 'views/draw.html',
        controller: 'DrawCtrl'
      })
      .when('/preview', {
        templateUrl: 'views/preview.html',
        controller: 'PreviewCtrl'
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
