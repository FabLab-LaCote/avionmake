/// <reference path="../../../typings/angularjs/angular-mocks.d.ts" />
/// <reference path="../../../typings/jasmine/jasmine.d.ts" />
/// <reference path="../../../app/scripts/controllers/printdialog.ts" />

'use strict';

describe('Controller: PrintdialogCtrl', () => {

  // load the controller's module
  beforeEach(module('avionmakeApp'));

  var PrintdialogCtrl: avionmakeApp.PrintdialogCtrl,
    scope: avionmakeApp.IPrintdialogScope;

  // Initialize the controller and a mock scope
  beforeEach(inject(($controller: ng.IControllerService, $rootScope: ng.IRootScopeService) => {
    scope = <any>$rootScope.$new();
    PrintdialogCtrl = $controller('PrintdialogCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', () => {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
