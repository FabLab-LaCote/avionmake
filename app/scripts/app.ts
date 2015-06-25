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
    'pascalprecht.translate',
    'angulartics',
    'angulartics.google.analytics'
  ])
  .constant('BASE_URL','https://j42.org/avionmake')
  //.constant('BASE_URL','http://localhost:9001')
  .config(($httpProvider:ng.IHttpProvider)=>{
     $httpProvider.defaults.withCredentials = true;
  })
  .config(($routeProvider:ng.route.IRouteProvider) => {
    $routeProvider
      .when('/', {
        templateUrl: 'views/choice.html',
        controller: 'ChoiceCtrl',
        controllerAs: 'ctrl'
      })
      .when('/draw/:id?', {
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
        templateUrl: 'views/fly.html',
        controller: 'FlyCtrl'
      })
      .when('/v/:id?', {
        templateUrl: 'views/viewer.html',
        controller: 'ViewerCtrl'
      })
      .when('/admin',{
        templateUrl: 'views/admin.html',
        controller: 'AdminCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  })
  .config(function($mdThemingProvider:angular.material.MDThemingProvider) {
    $mdThemingProvider.theme('default')
      .primaryPalette('blue')
      .accentPalette('light-green', {
        'default': '500'
      });
  })
  .config(($translateProvider:angular.translate.ITranslateProvider) =>{
    $translateProvider.useSanitizeValueStrategy('escaped');
    $translateProvider.translations('en', {
         'STEP1': '1. Choose',
         'STEP1_TEXT': 'Select a plane',
         'STEP2': '2. Draw',
         'STEP2_TEXT': 'Customize your plane. Add some text and symbols, enjoy with the color panel!',
         'STEP3': '3. Print',
         'STEP3_TEXT': 'Confirm preview?',
         'STEP4': '4. Cut',
         'STEP4_TEXT': 'Observe the laser cutting',
         'STEP5': '5. Assemble',
         'STEP5_TEXT': 'Glue and fold together your plane.',
         'STEP6': '6. Fly',
         'STEP6_TEXT': 'Test the result! How far does it fly?',
         'GALLERY': 'Gallery',
         'CHOOSE': 'Choose',
         'PREVIEW': 'Preview',
         'PRINT': 'Print',
         'CREATE': 'Create',
         'NEXT':'Next',
         'CONTINUE':'Continue',
         'LOADING':'Loading',
         'GENERATING_PDF':'Generating PDF',
         'MERGE_PDF':'Merge PDF to cut out by hand.',
         'CONFIRM_NEWPLANE_TITLE':'New plane?',
         'CONFIRM_NEWPLANE_CONTENT':'Replace the current plane with this new one? (Current plane will be lost)',
         'CONFIRM_NEWPLANE_OK':'Yes, overwrite!',
         'CONFIRM_NEWPLANE_CANCEL':'Cancel',
         'CONFIRM_PRINT_TITLE':'Ready to Print?',
         'CONFIRM_PRINT_NAME':'Give a name to your plane',
         'CONFIRM_PRINT_PCODE':'Where are you from? (PostalCode)',
         'CONFIRM_PRINT_SEND_EMAIL':'Receive plans by e-mail',
         'CONFIRM_PRINT_NEWSLETTER':'I want to be informed of other FabLab la Côte activities.',
         'CONFIRM_PRINT_CONTENT':'Are you sure you want to print? You cannot change your plane after this step.',
         'CONFIRM_PRINT_OK':'Print!',
         'CONFIRM_PRINT_CANCEL':'Cancel',
         'ALERT_PRINTOK_TITLE': 'Well done!',
         'ALERT_PRINTOK_CONTENT':'Your plane "{{name}}" with tail number <<{{id}}>> has been sent to the printer. Fetch it and bring it to the laser cutting poste.',
         'ALERT_PRINTOK_OK':'Roger!',
         'DELETE':'Delete',
         'CANCEL':'Cancel',
         'SAVE':'Save',
         'DECAL': 'Decal',
         'TEXT':'Text',
         'FIELD_REQUIRED':'This is required',
         'DIFFICULTY':'Difficulty',
         'TIME':'Time',
         'RANK':'Rank',
         'DISTANCE':'Distance',
         'PLANE':'Flight',
         'TYPE':'Type',
         'NAME':'Name',
         'ALL':'All',
         'ENABLE': 'Enable',
         'DISABLED': 'Disabled',
         'DISABLE': 'Disable',
         'ACTION': 'Action',
         'CUT': 'Cut',
         'FLY':'Fly',
         'NONE': 'None',
         'FILEINFO_CUT':'File for the laser cutter.',
         'FILEINFO_PRINT':'Print texture file before cutting laser.',
         'FILEINFO_MERGED':'All in one file for manually cutting with scissors.',
         'plane1':'Glider',
         'biplane1':'Biplane',
         'fighter1':'Fighter',
         'birdplane1':'Birdplane',
         'seaplane1':'Seaplane'
      })
    .translations('fr', {
         'STEP1': '1. Choisir',
         'STEP1_TEXT': 'Sélectionnez un avion',
         'STEP2': '2. Décorer',
         'STEP2_TEXT': 'Personnalisez votre avion. Ajoutez du textes et des symboles et éclatez-vous avec la palette des couleurs.',
         'STEP3': '3. Imprimer',
         'STEP3_TEXT': 'Confirmez aperçu?',
         'STEP4': '4. Découper',
         'STEP4_TEXT': 'Observez la découpe laser.',
         'STEP5': '5. Assembler',
         'STEP5_TEXT': 'Collez et pliez selon le plan d\'assemblage.',
         'STEP6': '6. Test de vol',
         'STEP6_TEXT': 'Testez votre avion! Jusqu\'où vole-t-il?',
         'GALLERY': 'Galerie',
         'CHOOSE': 'Choisir',
         'PREVIEW': 'Aperçu',
         'PRINT': 'Imprimer',
         'CREATE': 'Créer',
         'CONTINUE':'Continuer',
         'LOADING':'Chargement',
         'MERGE_PDF':'Découper à la main.',
         'NEXT':'Suivant',
         'GENERATING_PDF':'Création du PDF',
         'CONFIRM_NEWPLANE_TITLE':'Nouvel avion?',
         'CONFIRM_NEWPLANE_CONTENT':'Remplacez l\'avion actuel avec le nouveau? (\'avion actuel sera perdu)',
         'CONFIRM_NEWPLANE_OK':'Oui, écraser!',
         'CONFIRM_NEWPLANE_CANCEL':'Annuler',
         'CONFIRM_PRINT_TITLE':'Prêt à imprimer?',
         'CONFIRM_PRINT_NAME':'Donnez un nom à votre avion',
         'CONFIRM_PRINT_PCODE':"D'où venez-vous? (Code postal)",
         'CONFIRM_PRINT_SEND_EMAIL':'Recevoir les plans par e-mail',
         'CONFIRM_PRINT_NEWSLETTER':'Je veux être informé des autres activités du FabLab La Côte.',
         'CONFIRM_PRINT_CONTENT':'Etes-vous sûr de vouloir imprimer? Vous ne pouvez plus changer votre avion après cette étape.',
         'CONFIRM_PRINT_OK':'Imprimer!',
         'CONFIRM_PRINT_CANCEL':'Annuler',
         'ALERT_PRINTOK_TITLE': 'Bien joué!',
         'ALERT_PRINTOK_CONTENT':'Votre avion "{{name}}" avec l\'immatriculation <<{{id}}>> a été envoyé à l\'imprimante. Allez le chercher et amenez le au poste de découpage laser.',
         'ALERT_PRINTOK_OK':'Reçu!',         
         'DELETE':'Supprimer',
         'CANCEL':'Annuler',
         'SAVE':'Enregistrer',
         'DECAL': 'Decal',
         'TEXT':'Texte',
         'FIELD_REQUIRED':'Ce champ est requis',
         'DIFFICULTY':'Difficulté',
         'TIME':'Temps',
         'RANK':'Rang',
         'DISTANCE':'Distance',
         'PLANE':'Vol',
         'TYPE':'Type',
         'NAME':'Nom', 
         'ALL':'Tous',
         'ENABLE': 'Activer',
         'DISABLED': 'Desactivé',
         'DISABLE': 'Desactiver',
         'ACTION': 'Action',
         'CUT': 'Couper',
         'FLY':'Voler',
         'NONE': 'Aucun',
         'FILEINFO_CUT':'Fichier pour la découpeuse laser.',
         'FILEINFO_PRINT':'Fichier textures à imprimer avant de couper au laser.',
         'FILEINFO_MERGED':'Fichier tout en un pour découper manuellement aux ciseaux.',     
         'plane1':'Planeur',
         'biplane1':'Biplan',
         'fighter1':'Chasseur',
         'birdplane1':'Oiseau',
         'seaplane1':'Hydravion'
      })
      .translations('de', {
         'STEP1': '1. Auswählen',
         'STEP1_TEXT': 'Wählen Sie ein Modell aus.',
         'STEP2': '2. Zeichnen',
         'STEP2_TEXT': 'Passen Sie Ihr Flugzeug an.',
         'STEP3': '3. Drucken',
         'STEP3_TEXT': 'Vorschau bestätigen?',
         'STEP4': '4. Ausschneiden',
         'STEP4_TEXT': 'Beobachten Sie das Laserschneiden',
         'STEP5': '5. Zusammenbauen',
         'STEP5_TEXT': 'Kleben und Falten Sie Ihr Flugzeug zusammen.',
         'STEP6': '6. Fliegen',
         'STEP6_TEXT': 'Testen Sie das Ergebnis! Wie weit fliegt es?',
         'GALLERY': 'Galerie',
         'CHOOSE': 'Auswählen',
         'PREVIEW': 'Vorschau',
         'PRINT': 'Drucken',
         'CREATE': 'Neu',
         'NEXT':'Nächstes',
         'CONTINUE':'Fortsetzen',
         'LOADING':'Laden',
         'MERGE_PDF':'Zusammenführen von PDF um per Hand auszuschneiden',
         'GENERATING_PDF':'PDF-Erstellung',
         'CONFIRM_NEWPLANE_TITLE':'New plane?',
         'CONFIRM_NEWPLANE_CONTENT':'Ersetzen von dem aktuellem Flugzeug mit dem neu neuem? (Aktuelles Flugzeug geht verloren)',
         'CONFIRM_NEWPLANE_OK':'Ja, ersetzen',
         'CONFIRM_NEWPLANE_CANCEL':'Abbrechen',
         'CONFIRM_PRINT_TITLE':'Druckbereit?',
         'CONFIRM_PRINT_NAME':'Geben Sie IhremFlugzeug einen Namen',
         'CONFIRM_PRINT_PCODE':'Woher kommen Sie? (Postleitzahl)',
         'CONFIRM_PRINT_SEND_EMAIL':'Pläne per E-Mail erhalten',
         'CONFIRM_PRINT_NEWSLETTER':'Ich möchte über andere FabLab la Côte Aktivitäten informiert werden.',
         'CONFIRM_PRINT_CONTENT':'Sind Sie sicher, dass Sie drucken wollen? Ihr Flugzeug kann nach diesem Schritt nicht mehr geändert werden.',
         'CONFIRM_PRINT_OK':'Drucken!',
         'CONFIRM_PRINT_CANCEL':'Abbrechen',
         'ALERT_PRINTOK_TITLE': 'Gut gemacht!',
         'ALERT_PRINTOK_CONTENT':'Ihr Flugzeug "{{name}}" mit dem Kennzeichen <<{{id}}>> wurde an den Drucker übergeben. Holen sie es ab und bringen sie es zum Laserschneideposten.',
         'ALERT_PRINTOK_OK':'Roger!',
         'DELETE':'Löschen',
         'CANCEL':'Abbrechen',
         'SAVE':'Speichern',
         'DECAL': 'Decal',
         'TEXT':'Text',
         'FIELD_REQUIRED':'Dieses Feld wird benötigt',
         'DIFFICULTY':'Schwierigkeit',
         'TIME':'Zeit',
         'RANK':'Rang',
         'DISTANCE':'Distanz',
         'PLANE':'Flug',
         'TYPE':'Typ',
         'NAME':'Name',
         'ALL':'Alle',
         'ENABLE': 'Aktivieren',
         'DISABLED': 'Deaktiviert',
         'DISABLE': 'Deaktivieren',
         'ACTION': 'Aktion',
         'CUT': 'Schneiden',
         'FLY':'Fliegen',
         'NONE': 'Kein',
         'FILEINFO_CUT':'Datei für den Laser-Cutter.',
         'FILEINFO_PRINT':'Druck datei vor dem Laser-Cutter.',
         'FILEINFO_MERGED':'Alles in einer Datei um von Hand auszuschneiden.',          
         'plane1':'Segelflugzeug',
         'biplane1':'Doppeldecker',
         'fighter1':'Jagdflugzeug',
         'birdplane1':'Vogelflugzeug',
         'seaplane1':'Wasserflugzeug'
      }) 
      .registerAvailableLanguageKeys(['en', 'de', 'fr'], {
        'en_US': 'en',
        'en_UK': 'en',
        'de_DE': 'de',
        'de_CH': 'de',
        'fr_FR': 'fr',
        'fr_CH': 'fr',
      })
      .fallbackLanguage('fr')
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
