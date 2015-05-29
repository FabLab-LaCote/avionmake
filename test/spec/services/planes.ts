/// <reference path="../../../typings/angularjs/angular-mocks.d.ts" />
/// <reference path="../../../typings/jasmine/jasmine.d.ts" />
/// <reference path="../../../app/scripts/services/planes.ts" />

'use strict';

describe('Service: planes', () => {

  // load the service's module
  beforeEach(module('avionmakeApp'));

  // instantiate service
  var planes;
  beforeEach(inject(_planes_ => {
    planes = _planes_;
  }));

  it('should do something', () => {
    expect(!!planes).toBe(true);
  });

});
