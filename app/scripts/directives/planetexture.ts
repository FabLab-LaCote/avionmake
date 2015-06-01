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
    template = '<div class="texture md-whiteframe-z2" layout-padding ng-style="{width:isRotate? part.height : part.width, height: isRotate? part.width : part.height}"><md-button class="md-icon-button" aria-label="rotate" ng-click="isRotate = !isRotate"><md-icon md-svg-src="images/icons/ic_rotate_90_degrees_ccw_black_48px.svg"></md-icon></md-button><div class="rotationContainer" ng-style="getTransform()"></div></div>';
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
          styles['transform'] = 'rotate(90deg)';
        }
        return styles;
      };
      
      var canvas = scope.part.textureCanvas;
      var ctx = <CanvasRenderingContext2D>  scope.part.textureCanvas.getContext('2d');      
      var rotationContainer =  element.find('.rotationContainer');
      rotationContainer.append(canvas); 
      
      ctx.lineJoin = ctx.lineCap = 'round';
      
      var isDrawing, lastPoint;
      var el = canvas;
      var x,y;
      
      scope.part.textureCanvas = el;
      
      var self:Planetexture = this;
      
      var getPoint = (e) => {
        var touch = e.changedTouches[0];
        var totalOffsetX = 0;
  			var totalOffsetY = 0;
  			var currentElement = (<HTMLElement>touch.target);
  			
  			do{
  				totalOffsetX += currentElement.offsetLeft;
  				totalOffsetY += currentElement.offsetTop;
  			} while(currentElement = <HTMLElement>currentElement.offsetParent)
        var $canvas = $(touch.target);
        var points = {x: touch.clientX - $canvas.offset().left, y:touch.clientY - $canvas.offset().top}; 
        if(scope.isRotate){
          return {x: points.y, y: scope.part.height - points.x};
          
        }
        return points;
      };
      
      el.onmousedown = function(e) {
        isDrawing = true;
        lastPoint = { x: (e.offsetX != null) ? e.offsetX : e.layerX,
                      y: (e.offsetY != null) ? e.offsetY : e.layerY};
      };
      
      el.addEventListener( 'touchstart', (e)=>{
        e.preventDefault();
        isDrawing = true;
        lastPoint = getPoint(e);
      }, false );
      

      var draw = (currentPoint:any) =>{
        if (!isDrawing) return;
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
      
      el.onmousemove = (e) => {
        var currentPoint = { x: (e.offsetX != null) ? e.offsetX : e.layerX,
                             y: (e.offsetY != null) ? e.offsetY : e.layerY};
        draw(currentPoint);
      };
      
      el.addEventListener('touchmove', (e)=>{
        e.preventDefault();
        draw(getPoint(e));
      }, false);
            
      el.onmouseup = function() {
        isDrawing = false;
        scope.part.textureBitmap = canvas.toDataURL();
        self.planes.saveLocal();
      };
      
      el.ontouchend = function(){
        isDrawing = false;
        scope.part.textureBitmap = canvas.toDataURL();
        self.planes.saveLocal();
      };
      
      //handle decals
      
      if(scope.part.decals){
        scope.part.decals.forEach((d:Decal) =>{
          var div = angular.element('<div class="decal"></div>');
          rotationContainer.append(div);
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
