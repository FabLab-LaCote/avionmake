/// <reference path="../../../typings/angularjs/angular-mocks.d.ts" />
/// <reference path="../../../typings/jasmine/jasmine.d.ts" />
/// <reference path="../../../app/scripts/controllers/toolbar.ts" />

'use strict';

describe('Controller: ToolbarCtrl', () => {

  // load the controller's module
  beforeEach(module('avionmakeApp'));

  var ToolbarCtrl: avionmakeApp.ToolbarCtrl,
    scope: avionmakeApp.IToolbarScope;

  // Initialize the controller and a mock scope
  beforeEach(inject(($controller: ng.IControllerService, $rootScope: ng.IRootScopeService) => {
    scope = <any>$rootScope.$new();
    ToolbarCtrl = $controller('ToolbarCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', () => {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
