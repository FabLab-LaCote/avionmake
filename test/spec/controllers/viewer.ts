/// <reference path="../../../typings/angularjs/angular-mocks.d.ts" />
/// <reference path="../../../typings/jasmine/jasmine.d.ts" />
/// <reference path="../../../app/scripts/controllers/viewer.ts" />

'use strict';

describe('Controller: ViewerCtrl', () => {

  // load the controller's module
  beforeEach(module('avionmakeApp'));

  var ViewerCtrl: avionmakeApp.ViewerCtrl,
    scope: avionmakeApp.IViewerScope;

  // Initialize the controller and a mock scope
  beforeEach(inject(($controller: ng.IControllerService, $rootScope: ng.IRootScopeService) => {
    scope = <any>$rootScope.$new();
    ViewerCtrl = $controller('ViewerCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', () => {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
