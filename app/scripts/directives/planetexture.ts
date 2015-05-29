/// <reference path="../app.ts" />

'use strict';

declare function Path2D(path:string):void;
interface CanvasRenderingContext2D{
   clip(path:any, clip:string):void;
}

module avionmakeApp {

  export interface ITextureScope extends ng.IScope {
    part: Part;
  }
  
  export class Planetexture implements ng.IDirective {
    template = '<div></div>';
    restrict = 'E';
    replace = true;
    scope = {
      'part': '=part'
    };
    link = (scope: ITextureScope, element: ng.IAugmentedJQuery, attrs: ng.IAttributes): void => {
      var canvas:HTMLCanvasElement = document.createElement('canvas');
      var ctx = <CanvasRenderingContext2D> canvas.getContext('2d');
      element.text('this is the planeTexture directive ' + scope.part.name);
      canvas.width = scope.part.width;
      canvas.height = scope.part.height;
      ctx.clip(new Path2D(scope.part.path), 'nonzero');
      ctx.fillStyle = "#00ff00";
      ctx.rect( 0, 0, scope.part.width, scope.part.height );
      ctx.fill();
      element.append(canvas);
      scope.part.textureBitmap = canvas.toDataURL();
    }
  }

  export function planeTextureFactory() {
    return new avionmakeApp.Planetexture();
  }

}

angular.module('avionmakeApp')
  .directive('planeTexture', avionmakeApp.planeTextureFactory);
