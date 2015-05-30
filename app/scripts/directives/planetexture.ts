/// <reference path="../app.ts" />

'use strict';

interface MouseEvent {
  originalEvent:any;
}

module avionmakeApp {

  export interface ITextureScope extends ng.IScope {
    part: Part;
    getTransform:Function;
    isRotate: boolean;
  }

  export function distanceBetween(point1, point2) {
    return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
  }
  
  export function angleBetween(point1, point2) {
    return Math.atan2( point2.x - point1.x, point2.y - point1.y );
  }
  
  export class Planetexture implements ng.IDirective {
    template = '<div class="texture md-whiteframe-z2" layout-padding ng-style="getTransform()"><md-button class="md-icon-button" aria-label="rotate" ng-click="isRotate = !isRotate"><md-icon md-svg-src="images/icons/ic_rotate_90_degrees_ccw_black_48px.svg"></md-icon></md-button></div>';
    restrict = 'E';
    replace = true;
    scope = {
      'part': '=part'
    };
    constructor(private planes: avionmakeApp.Planes ){}
    
    link = (scope: ITextureScope, element: ng.IAugmentedJQuery, attrs: ng.IAttributes): void => {
      scope.isRotate = false;
      scope.getTransform = () => {
        var styles = {};
        if(scope.isRotate){
          styles['transform'] = 'rotate(90deg) translateY(' + (-element[0].clientHeight/2) +'px) translateX(' + (element[0].clientWidth/2) +'px)';
        }
        return styles;
      };
      
      var canvas = scope.part.textureCanvas;
      var ctx = <CanvasRenderingContext2D>  scope.part.textureCanvas.getContext('2d');
      element.append(canvas); 
      ctx.lineJoin = ctx.lineCap = 'round';
      
      var isDrawing, lastPoint;
      var el = canvas;
      var x,y;
      
      scope.part.textureCanvas = el;
      
      el.onmousedown = function(e) {
        isDrawing = true;
        lastPoint = { x: (e.offsetX != null) ? e.offsetX : e.originalEvent.layerX,
                      y: (e.offsetY != null) ? e.offsetY : e.originalEvent.layerY};
      };

      var self:Planetexture = this;
      el.onmousemove = (e) => {
        if (!isDrawing) return;
        var currentPoint = { x: (e.offsetX != null) ? e.offsetX : e.originalEvent.layerX,
                             y: (e.offsetY != null) ? e.offsetY : e.originalEvent.layerY};
        var dist = distanceBetween(lastPoint, currentPoint);
        var angle = angleBetween(lastPoint, currentPoint);
        for (var i = 0; i < dist; i+=5) {
          
          x = lastPoint.x + (Math.sin(angle) * i);
          y = lastPoint.y + (Math.cos(angle) * i);
          
          var radgrad = ctx.createRadialGradient(x,y,self.planes.brushSize/4,x,y,self.planes.brushSize/2);
          
          var color = 'rgba(' +  self.planes.brushColor.join(',');
          
          radgrad.addColorStop(0, color + ',1)');
          radgrad.addColorStop(0.5, color + ',0.5)');
          radgrad.addColorStop(1, color + ',0)');
          
          ctx.fillStyle = radgrad;
          ctx.fillRect(x-self.planes.brushSize/2, y-self.planes.brushSize/2, self.planes.brushSize, self.planes.brushSize);
        }
        
        lastPoint = currentPoint;
        scope.part.texture.needsUpdate = true;
      };
      
      /*
      el.onmouseout = function(){
        isDrawing = false;
      }
      */
      
      el.onmouseup = function() {
        isDrawing = false;
        scope.part.textureBitmap = canvas.toDataURL();
      };
      
      if(scope.part.decals){
        scope.part.decals.forEach((d:Decal) =>{
          var div = angular.element('<div class="decal"></div>');
          element.append(div);
          div.text(d.text);
          div.css({'transform': 'translate('+ d.x +'px,'+ d.y +'px) rotate('+ d.angle+ 'deg) ',
          'font-size': d.size + 'px'});
        });
      }
    }
  }

  export function planeTextureFactory() {
    var directive = (planes: avionmakeApp.Planes) => new avionmakeApp.Planetexture(planes);
    directive.$inject = ['planes'];
    return directive;
  }

}

angular.module('avionmakeApp')
  .directive('planeTexture', avionmakeApp.planeTextureFactory());
