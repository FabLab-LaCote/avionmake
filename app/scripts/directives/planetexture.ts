/// <reference path="../app.ts" />

'use strict';

interface MouseEvent {
  originalEvent:any;
}

interface RaphaelPaper{
  freeTransform:any
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
      
      //DEBUG
      //rotationContainer.append(scope.part.bumpTextureCanvas); 

      
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
            
      el.onmouseout = function() {
        scope.part.textureBitmap = canvas.toDataURL();
        self.planes.saveLocal();
      };
            
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
      
      var paper =  Raphael(rotationContainer[0], scope.part.width, scope.part.height);
      paper.canvas.style.position = 'absolute';
      
      var fts = [];
      
      if(scope.part.decals){
        scope.part.decals.forEach((d:Decal) =>{
            var pp;
            if(d.text){
              pp = paper
              .text(0,0,d.text)
              .attr({ 'fill':'none',
                      'stroke':'black',
                      'text-anchor':'start',
                      'stroke-width':1,
                      'font-size': d.size,
                      'font-family': 'Arial, Helvetica, sans-serif' });
              
            }
            if(d.path){
              pp = paper
              .path(d.path);
            }
            var ft = paper.freeTransform(pp, { keepRatio: true, distance: 1.6, size: 10},
               (ft, events) => {
                  if(events.indexOf('scale end')>-1){
                    d.size = ft.attrs.scale.x * d.size;
                    if(d.text){
                      ft.subject.attr({'font-size': d.size});
                      ft.attrs.scale.x=1;
                      ft.attrs.scale.y=1;
                      ft.apply();
                    }else{
                      d.size = ft.attrs.scale.x;
                    }
                  }
                  if(events.indexOf('drag end')>-1 || events.indexOf('rotate end')>-1){
                    d.x = ft.attrs.translate.x - ft.offset.translate.x + ft.attrs.x;
                    d.y = ft.attrs.translate.y - ft.offset.translate.y + ft.attrs.y;
                    d.angle = ft.attrs.rotate;
                  }
                  if(events.indexOf('scale end')>-1 || events.indexOf('rotate end')>-1 || events.indexOf('drag end')>-1){
                    this.planes.currentPlane.updateBumpTextures();
                    ft.apply();
                    this.planes.saveLocal();
                  }
              });
              if(d.path){
                ft.attrs.scale.x = d.size;
                ft.attrs.scale.y = d.size;
              }
              ft.attrs.rotate = d.angle;
              ft.opts.rotated = false;
              ft.offset.translate.x = -ft.attrs.size.x/2;
              ft.offset.translate.y = -ft.attrs.size.y/2;
              ft.attrs.translate.x = d.x + ft.offset.translate.x - ft.attrs.x;
              ft.attrs.translate.y = d.y + ft.offset.translate.y - ft.attrs.y;             
              ft.apply();
              fts.push(ft);
        });
      }
      
      scope.$watch('isRotate',(value)=>{
        fts.forEach((ft)=>{
          ft.opts.rotated = value;
        });
      })
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
