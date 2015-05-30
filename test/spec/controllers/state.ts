/// <reference path="../../../typings/angularjs/angular-mocks.d.ts" />
/// <reference path="../../../typings/jasmine/jasmine.d.ts" />
/// <reference path="../../../app/scripts/controllers/state.ts" />

'use strict';

describe('Controller: StateCtrl', () => {

  // load the controller's module
  beforeEach(module('avionmakeApp'));

  var StateCtrl: avionmakeApp.StateCtrl,
    scope: avionmakeApp.IStateScope;

  // Initialize the controller and a mock scope
  beforeEach(inject(($controller: ng.IControllerService, $rootScope: ng.IRootScopeService) => {
    scope = <any>$rootScope.$new();
    StateCtrl = $controller('StateCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', () => {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
