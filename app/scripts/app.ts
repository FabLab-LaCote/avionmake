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

declare module angular.material {
  interface MDConfirmDialog{
     targetEvent:Function;
     
  }  
}

angular.module('avionmakeApp', [
    'ngAnimate',
    'ngCookies',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'ngMessages',
    'ngMaterial',
    'pascalprecht.translate'
  ])
  //.constant('BASE_URL','http://j42.org:9001')
  .constant('BASE_URL','http://localhost:8080')
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
      .when('/v/:id?', {
        templateUrl: 'views/viewer.html',
        controller: 'ViewerCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  })
  .config(function($mdThemingProvider:angular.material.MDThemingProvider) {
    $mdThemingProvider.theme('default')
      .primaryPalette('blue')
      .accentPalette('light-green');
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
         'PRINT': 'Print',
         'GENERATING_PDF':'Generating PDF',
         'MERGE_PDF':'Merge PDF to cut out by hand.',
         'CONFIRM_NEWPLANE_TITLE':'New plane?',
         'CONFIRM_NEWPLANE_CONTENT':'Replace the current plane with this new one? (Current plane will be lost)',
         'CONFIRM_NEWPLANE_OK':'Yes, overwrite!',
         'CONFIRM_NEWPLANE_CANCEL':'Cancel',
         'CONFIRM_PRINT_TITLE':'Ready to Print?',
         'CONFIRM_PRINT_CONTENT':'Are you sure you want to print? You cannot change your plane after this step.',
         'CONFIRM_PRINT_OK':'Print!',
         'CONFIRM_PRINT_CANCEL':'Cancel',
         'DELETE':'Delete',
         'CANCEL':'Cancel',
         'SAVE':'Save',
         'DECAL': 'Decal',
         'TEXT':'Text',
         'FIELD_REQUIRED':'This is required',
         'DIFFICULTY':'Difficulty',
         'TIME':'Time',
         'plane1':'Glider',
         'biplane1':'Biplane',
         'fighter1':'Fighter',
         'birdplane1':'Birdplane',
         'seaplane1':'Seaplane'
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
         'PRINT': 'Imprimer',
         'MERGE_PDF':'Merge PDF to cut out by hand.',
         'GENERATING_PDF':'Création du PDF',
         'CONFIRM_NEWPLANE_TITLE':'New plane?',
         'CONFIRM_NEWPLANE_CONTENT':'Replace the current plane with this new one? (Current plane will be lost)',
         'CONFIRM_NEWPLANE_OK':'Yes, continue!',
         'CONFIRM_NEWPLANE_CANCEL':'Cancel',
         'CONFIRM_PRINT_TITLE':'Ready to Print?',
         'CONFIRM_PRINT_CONTENT':'Are you sure you want to print? You cannot change your plane after this step.',
         'CONFIRM_PRINT_OK':'Print!',
         'CONFIRM_PRINT_CANCEL':'Cancel',
         'DELETE':'Supprimer',
         'CANCEL':'Annuler',
         'SAVE':'Enregistrer',
         'DECAL': 'Decal',
         'TEXT':'Texte',
         'FIELD_REQUIRED':'Ce champ est requis',
         'DIFFICULTY':'Difficulté',
         'TIME':'Temps',
         'plane1':'Planeur',
         'biplane1':'Biplan',
         'fighter1':'Chasseur',
         'birdplane1':'Oiseau',
         'seaplane1':'Hydravion'
      })
      .translations('de', {
         'STEP1': '1. Auswählen',
         'STEP1_TEXT': 'Which model do you want?',
         'STEP2': '2. Zeichnen',
         'STEP2_TEXT': 'Customize your plane.',
         'STEP3': '3. Drucken',
         'STEP3_TEXT': 'Confirm preview?',
         'STEP4': '4. Ausschneiden',
         'STEP4_TEXT': 'Observe the laser cutting',
         'STEP5': '5. Zusammenbauen',
         'STEP5_TEXT': 'Glue and fold together your plane.',
         'STEP6': '6. Gliegen',
         'STEP6_TEXT': 'Test the result! How far does it fly?',
         'CHOOSE': 'Auswählen',
         'PREVIEW': 'Vorschau',
         'PRINT': 'Drucken',
         'MERGE_PDF':'Merge PDF to cut out by hand.',
         'GENERATING_PDF':'PDF-Erstellung',
         'CONFIRM_NEWPLANE_TITLE':'New plane?',
         'CONFIRM_NEWPLANE_CONTENT':'Replace the current plane with this new one? (Current plane will be lost)',
         'CONFIRM_NEWPLANE_OK':'Yes, continue!',
         'CONFIRM_NEWPLANE_CANCEL':'Cancel',
         'CONFIRM_PRINT_TITLE':'Ready to Print?',
         'CONFIRM_PRINT_CONTENT':'Are you sure you want to print? You cannot change your plane after this step.',
         'CONFIRM_PRINT_OK':'Print!',
         'CONFIRM_PRINT_CANCEL':'Cancel',
         'DELETE':'Löschen',
         'CANCEL':'Abbrechen',
         'SAVE':'Speichern',
         'DECAL': 'Decal',
         'TEXT':'Text',
         'FIELD_REQUIRED':'Dieses Feld wird benötigt',
         'DIFFICULTY':'Schwierigkeit',
         'TIME':'Zeit',
         'plane1':'Segelflugzeug',
         'biplane1':'Doppeldecker',
         'fighter1':'Jagdflugzeug',
         'birdplane1':'Vogelflugzeug',
         'seaplane1':'Wasserflugzeug'
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
  })
  .config(($sceDelegateProvider, BASE_URL) => {
        $sceDelegateProvider.resourceUrlWhitelist([
        // Allow same origin resource loads.
        'self',
        // Allow loading from our assets domain.  Notice the difference between * and **.
        BASE_URL + '**'
      ]);
  });
