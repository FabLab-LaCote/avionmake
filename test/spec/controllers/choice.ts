/// <reference path="../../../typings/angularjs/angular-mocks.d.ts" />
/// <reference path="../../../typings/jasmine/jasmine.d.ts" />
/// <reference path="../../../app/scripts/controllers/choice.ts" />

'use strict';

describe('Controller: ChoiceCtrl', () => {

  // load the controller's module
  beforeEach(module('avionmakeApp'));

  var ChoiceCtrl: avionmakeApp.ChoiceCtrl,
    scope: avionmakeApp.IChoiceScope;

  // Initialize the controller and a mock scope
  beforeEach(inject(($controller: ng.IControllerService, $rootScope: ng.IRootScopeService) => {
    scope = <any>$rootScope.$new();
    ChoiceCtrl = $controller('ChoiceCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', () => {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
