/// <reference path="../../../typings/angularjs/angular-mocks.d.ts" />
/// <reference path="../../../typings/jasmine/jasmine.d.ts" />
/// <reference path="../../../app/scripts/directives/plane3d.ts" />

'use strict';

describe('Directive: plane3d', () => {

  // load the directive's module
  beforeEach(module('avionmakeApp'));

  var element: JQuery,
    scope: ng.IScope;

  beforeEach(inject(($rootScope: ng.IRootScopeService) => {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(($compile: ng.ICompileService) => {
    element = angular.element('<plane3d></plane3d>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the plane3d directive');
  }));
});
