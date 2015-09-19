/*

This file is part of avionmake.

Copyright (C) 2015  Boris Fritscher

This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, see http://www.gnu.org/licenses/.

*/

/// <reference path="../app.ts" />

'use strict';

module avionmakeApp {
  export interface IPrintDialogScope extends ng.IScope {

  }

  export class PrintDialogCtrl {

    /*@ngInject*/
    constructor (private $scope: IPrintDialogScope, private $mdDialog:ng.material.MDDialogService) {

    }

    sendEmail:boolean = true;
    info:any= {
      name: '',
      email: undefined,
      newsletter: true,
      pcode: undefined
    }
    cancel = function() {
      this.$mdDialog.cancel();
    };
    print = function() {
      this.$mdDialog.hide(this.info);
    };
  }
}

angular.module('avionmakeApp')
  .controller('PrintDialogCtrl', avionmakeApp.PrintDialogCtrl);
