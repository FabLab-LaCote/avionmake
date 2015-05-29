/// <reference path="../app.ts" />

'use strict';

declare function Path2D(path:string):void;
interface CanvasRenderingContext2D{
   clip(path:any, clip:string):void;
   stroke(path:any):void;
   webkitImageSmoothingEnabled:any;
}

module avionmakeApp {

  export interface ITextureScope extends ng.IScope {
    part: Part;
  }

  export function distanceBetween(point1, point2) {
    return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
  }
  
  export function angleBetween(point1, point2) {
    return Math.atan2( point2.x - point1.x, point2.y - point1.y );
  }
  
  export class Planetexture implements ng.IDirective {
    template = '<div class="texture md-whiteframe-z2" layout-padding></div>';
    restrict = 'E';
    replace = true;
    scope = {
      'part': '=part'
    };
    link = (scope: ITextureScope, element: ng.IAugmentedJQuery, attrs: ng.IAttributes): void => {
      var canvas:HTMLCanvasElement = document.createElement('canvas');
      var ctx = <CanvasRenderingContext2D> canvas.getContext('2d');
      ctx.globalCompositeOperation = 'source-atop';
      canvas.width = scope.part.width;
      canvas.height = scope.part.height;
      ctx.lineWidth = 4;
      ctx.stroke(new Path2D(scope.part.path));
      ctx.clip(new Path2D(scope.part.path), 'nonzero');
      ctx.fillStyle = "#ffffff";
      ctx.rect( 0, 0, scope.part.width, scope.part.height );
      ctx.fill();
      element.append(canvas); 
      ctx.lineJoin = ctx.lineCap = 'round';
      
      var isDrawing, lastPoint;
      var el = canvas;
      var x,y;
      var $canvas = $(canvas);
      
      scope.part.textureCanvas = el;
      
      el.onmousedown = function(e) {
        isDrawing = true;
        lastPoint = { x: e.pageX - $canvas.offset().left, y: e.pageY - $canvas.offset().top};
      };

      el.onmousemove = function(e) {
        if (!isDrawing) return;
        
        var currentPoint = { x: e.pageX - $canvas.offset().left, y: e.pageY - $canvas.offset().top};
        var dist = distanceBetween(lastPoint, currentPoint);
        var angle = angleBetween(lastPoint, currentPoint);
        
        for (var i = 0; i < dist; i+=5) {
          
          x = lastPoint.x + (Math.sin(angle) * i);
          y = lastPoint.y + (Math.cos(angle) * i);
          
          var radgrad = ctx.createRadialGradient(x,y,10,x,y,20);
          
          radgrad.addColorStop(0, 'rgba(255,0,0,1)');
          radgrad.addColorStop(0.5, 'rgba(255,0,0,0.5)');
          radgrad.addColorStop(1, 'rgba(255,0,0,0)');
          
          ctx.fillStyle = radgrad;
           ctx.fillRect(x-20, y-20, 40, 40);
        }
        
        lastPoint = currentPoint;
        if(scope.part.texture){
          scope.part.texture.needsUpdate = true;
        }
      };
      
      el.onmouseout = function(){
        isDrawing = false;
      }
      
      el.onmouseup = function() {
        isDrawing = false;
        scope.part.textureBitmap = canvas.toDataURL();
      };
    }
  }

  export function planeTextureFactory() {
    return new avionmakeApp.Planetexture();
  }

}

angular.module('avionmakeApp')
  .directive('planeTexture', avionmakeApp.planeTextureFactory);
