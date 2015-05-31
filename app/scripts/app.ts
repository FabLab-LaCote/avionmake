/// <reference path="../../typings/angularjs/angular.d.ts" />
/// <reference path="../../typings/angularjs/angular-route.d.ts" />
/// <reference path="../../typings/angular-material/angular-material.d.ts" />
/// <reference path="../../typings/angular-translate/angular-translate.d.ts" />
/// <reference path="../../typings/raphael/raphael.d.ts" />
/// <reference path="../../typings/dat-gui/dat-gui.d.ts" />
/// <reference path="../../typings/threejs/three.d.ts" />
/// <reference path="services/planes.ts" />
/// <reference path="controllers/state.ts" />

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
      .when('/cut', {
        templateUrl: 'views/cut.html'
      })
      .when('/assemble', {
        templateUrl: 'views/assemble.html'
      })
      .when('/fly', {
        templateUrl: 'views/fly.html'
      })
      .otherwise({
        redirectTo: '/'
      });
  })
  .config(($translateProvider:angular.translate.ITranslateProvider) =>{
    $translateProvider.useSanitizeValueStrategy('escaped');
    $translateProvider.translations('en', {
         'STEP1': '1. Choose',
         'STEP1_TEXT': 'Which model do you want?',
         'STEP2': '2. Draw',
         'STEP2_TEXT': 'Customize your plane.',
         'STEP3': '3. Print',
         'STEP3_TEXT': 'Confirm preview?',
         'STEP4': '4. Cut',
         'STEP4_TEXT': 'Observe the laser cutting',
         'STEP5': '5. Assemble',
         'STEP5_TEXT': 'Glue and fold together your plane.',
         'STEP6': '6. Fly',
         'STEP6_TEXT': 'Test the result! How far does it fly?',
         'CHOOSE': 'Choose',
         'PREVIEW': 'Preview',
         'CONFIRM_NEWPLANE_TITLE':'New plane?',
         'CONFIRM_NEWPLANE_CONTENT':'Replace the current plane with this new one? (Current plane will be lost)',
         'CONFIRM_NEWPLANE_OK':'Yes, continue!',
         'CONFIRM_NEWPLANE_CANCEL':'Cancel',
         'GENERATING_PDF':'Generating PDF'
      })
    .translations('fr', {
         'STEP1': '1. Choisir',
         'STEP1_TEXT': 'Which model do you want?',
         'STEP2': '2. Dessiner',
         'STEP2_TEXT': 'Customize your plane.',
         'STEP3': '3. Imprimer',
         'STEP3_TEXT': 'Confirm preview?',
         'STEP4': '4. Découper',
         'STEP4_TEXT': 'Observe the laser cutting',
         'STEP5': '5. Assembler',
         'STEP5_TEXT': 'Glue and fold together your plane.',
         'STEP6': '6. Voler',
         'STEP6_TEXT': 'Test the result! How far does it fly?',
         'CHOOSE': 'Choisir',
         'PREVIEW': 'Aperçu',
         'CONFIRM_NEWPLANE_TITLE':'New plane?',
         'CONFIRM_NEWPLANE_CONTENT':'Replace the current plane with this new one? (Current plane will be lost)',
         'CONFIRM_NEWPLANE_OK':'Yes, continue!',
         'CONFIRM_NEWPLANE_CANCEL':'Cancel',
         'GENERATING_PDF':'Création du PDF'
      })
      .registerAvailableLanguageKeys(['en', 'de'], {
        'en_US': 'en',
        'en_UK': 'en',
        'de_DE': 'de',
        'de_CH': 'de',
        'fr_FR': 'fr',
        'fr_CH': 'fr',
      })
      .fallbackLanguage('en')
      //BROKEN for now .useCookieStorage()
      .determinePreferredLanguage();           
  });
