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

    constructor(private planes: avionmakeApp.Planes,  private $mdDialog: ng.material.MDDialogService){}

    link = (scope: ITextureScope, element: ng.IAugmentedJQuery, attrs: ng.IAttributes): void => {
      var itc = new InteractiveTextureCanvas(scope, this.planes, this.$mdDialog)
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

      itc.paper = Raphael(rotationContainer[0], scope.part.width, scope.part.height);
      itc.paper.canvas.style.position = 'absolute';

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
        var action = self.planes.brushColor.join(',');
        lastPoint = { x: (e.offsetX != null) ? e.offsetX : e.layerX,
                      y: (e.offsetY != null) ? e.offsetY : e.layerY};
        if(action === 'text'){
          itc.createTextDecal(e, lastPoint);
        }else if(action === 'decal'){
          itc.createSymbolDecal(e, lastPoint);
        }else{
          isDrawing = true;
        }
      };

      el.addEventListener( 'touchstart', (e)=>{
        e.preventDefault();
        var action = self.planes.brushColor.join(',');
        lastPoint = getPoint(e);
        if(action === 'text'){
          itc.createTextDecal(e, lastPoint);
        }else if(action === 'decal'){
          itc.createSymbolDecal(e, lastPoint);
        }else{
          isDrawing = true;
        }
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
        this.planes.currentPlane.updateBumpTextures();
      };

      el.onmouseup = function() {
        isDrawing = false;
        scope.part.textureBitmap = canvas.toDataURL();
        self.planes.saveLocal();
        this.planes.currentPlane.updateBumpTextures();
      };

      el.ontouchend = function(){
        isDrawing = false;
        scope.part.textureBitmap = canvas.toDataURL();
        self.planes.saveLocal();
        this.planes.currentPlane.updateBumpTextures();
      };

      //handle decals

      if(scope.part.decals){
        scope.part.decals.forEach(itc.drawDecal.bind(itc));
      }

      scope.$watch('isRotate',(value)=>{
        itc.fts.forEach((ft)=>{
          ft.opts.rotated = value;
        });
      })
    }

  }



  class InteractiveTextureCanvas{


    fts = [];
    paper:RaphaelPaper;
    constructor(private scope:ITextureScope, private planes: avionmakeApp.Planes,  private $mdDialog: ng.material.MDDialogService){

    }

    openDecalDialog(event, decal:Decal):ng.IPromise<any>{
      return this.$mdDialog.show({
        templateUrl: 'views/drawdialog.html',
        controller: 'DrawDialogCtrl',
        targetEvent: event,
        locals:{
          decal:decal
        },
        onComplete: (scope, element)=>{
            var e = element[0].querySelector('[name=text]');
            if(e){
              e.focus();
            }
        }
      })
    }

    createDecalDialog(event, decal:Decal){
      this.openDecalDialog(event, decal)
      .then((decal)=>{
        //add+save
        this.scope.part.decals.push(decal);
        this.drawDecal(decal);
        this.planes.saveLocal();
      })
    }

    createTextDecal(event, point){
      var decal:Decal = {
          x: point.x,
          y: point.y,
          angle: this.scope.isRotate ? -90 : 0,
          size: 30,
          text: ''
        };
      this.createDecalDialog(event, decal);
    }

    createSymbolDecal(event, point){
      var decal:Decal = {
          x: point.x,
          y: point.y,
          angle: this.scope.isRotate ? -90 : 0,
          size: 2,
          path: ''
        };
      this.createDecalDialog(event, decal);
    }

    editDecal(event, decal:Decal, paperElement:RaphaelElement){
      this.openDecalDialog(event, decal)
      .then((d)=>{
        if(d === 'delete'){
          this.scope.part.decals.splice(this.scope.part.decals.indexOf(decal), 1);
          this.fts.forEach((ft)=>{
            if(ft.subject === paperElement){
              ft.unplug();
              paperElement.remove();
            }
          })
        }else{
          if(d.text){
            decal.text = d.text;
            paperElement.attr('text', decal.text);
          }
          if(d.path){
            decal.path = d.path;
            paperElement.attr('path', decal.path);
          }
        }
        this.planes.saveLocal();
      });
    }

    drawDecal(d:Decal){
        var pp:RaphaelElement;
        var decal:Decal = d;
          if(d.text){
            pp = this.paper
            .text(0,0,d.text)
            .attr({ 'fill':'none',
                    'stroke':'black',
                    'text-anchor':'start',
                    'stroke-width':1,
                    'font-size': d.size,
                    'font-family': 'Arial, Helvetica, sans-serif' });
          }
          if(d.path){
            pp = this.paper
            .path(d.path);
          }
          if(!d.path && !d.text){
            //For now only skip, maybe cleanup?
            return;
          }
          if(!d.locked){
            pp.click((e)=>{
                this.editDecal(e, decal, pp);
              })
              .touchstart((e)=>{
                this.editDecal(e, decal, pp);
              });
          }
          var ft = this.paper.freeTransform(pp, { keepRatio: true, distance: 1.6, size: 12},
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
            ft.opts.rotated = this.scope.isRotate;
            ft.offset.translate.x = -ft.attrs.size.x/2;
            ft.offset.translate.y = -ft.attrs.size.y/2;
            ft.attrs.translate.x = d.x + ft.offset.translate.x - ft.attrs.x;
            ft.attrs.translate.y = d.y + ft.offset.translate.y - ft.attrs.y;
            ft.apply();
            this.fts.push(ft);
            if(d.locked){
              ft.hideHandles();
            }
      }
  }

  export function planeTextureFactory() {
    var directive = (planes: avionmakeApp.Planes, $mdDialog: ng.material.MDDialogService) => new avionmakeApp.Planetexture(planes, $mdDialog);
    directive.$inject = ['planes', '$mdDialog'];
    return directive;
  }

}

/*@ngInject*/
function DrawDialogCtrl($scope, $mdDialog, decal) {
  $scope.decal = decal;
  $scope.isNew = decal.text === '' || decal.path === '';
  $scope.decals = [
    'M22.441,28.181c-0.419,0-0.835-0.132-1.189-0.392l-5.751-4.247L9.75,27.789c-0.354,0.26-0.771,0.392-1.189,0.392c-0.412,0-0.824-0.128-1.175-0.384c-0.707-0.511-1-1.422-0.723-2.25l2.26-6.783l-5.815-4.158c-0.71-0.509-1.009-1.416-0.74-2.246c0.268-0.826,1.037-1.382,1.904-1.382c0.004,0,0.01,0,0.014,0l7.15,0.056l2.157-6.816c0.262-0.831,1.035-1.397,1.906-1.397s1.645,0.566,1.906,1.397l2.155,6.816l7.15-0.056c0.004,0,0.01,0,0.015,0c0.867,0,1.636,0.556,1.903,1.382c0.271,0.831-0.028,1.737-0.739,2.246l-5.815,4.158l2.263,6.783c0.276,0.826-0.017,1.737-0.721,2.25C23.268,28.053,22.854,28.181,22.441,28.181L22.441,28.181z',
    'M25.947,11.14c0-5.174-3.979-9.406-10.613-9.406c-6.633,0-10.282,4.232-10.282,9.406c0,5.174,1.459,4.511,1.459,7.43c0,1.095-1.061,0.564-1.061,2.919c0,2.587,3.615,2.223,4.677,3.283c1.061,1.062,0.961,3.019,0.961,3.019s0.199,0.796,0.564,0.563c0,0,0.232,0.564,0.498,0.232c0,0,0.265,0.563,0.531,0.1c0,0,0.265,0.631,0.696,0.166c0,0,0.431,0.63,0.929,0.133c0,0,0.564,0.53,1.194,0.133c0.63,0.397,1.194-0.133,1.194-0.133c0.497,0.497,0.929-0.133,0.929-0.133c0.432,0.465,0.695-0.166,0.695-0.166c0.268,0.464,0.531-0.1,0.531-0.1c0.266,0.332,0.498-0.232,0.498-0.232c0.365,0.232,0.564-0.563, 0.564-0.563s-0.1-1.957,0.961-3.019c1.062-1.061,4.676-0.696,4.676-3.283c0-2.354-1.061-1.824-1.061-2.919C24.488,15.651,25.947,16.314,25.947,11.14zM10.333,20.992c-1.783,0.285-2.59-0.215-2.785-1.492c-0.508-3.328,2.555-3.866,4.079-3.683c0.731,0.088,1.99,0.862,1.99,1.825C13.617,20.229,11.992,20.727,10.333,20.992zM16.461,25.303c-0.331,0-0.862-0.431-0.895-1.227c-0.033,0.796-0.63,1.227-0.961,1.227c-0.332,0-0.83-0.331-0.863-1.127c-0.033-0.796,1.028-4.013,1.792-4.013c0.762,0,1.824,3.217,1.791,4.013S16.794,25.303,16.461,25.303zM23.361,19.5c-0.195,1.277-1.004,1.777-2.787,1.492c-1.658-0.266-3.283-0.763-3.283-3.35c0-0.963,1.258-1.737,1.99-1.825C20.805,15.634,23.869,16.172,23.361,19.5z',
    'M25.979,12.896 19.312,12.896 19.312,6.229 12.647,6.229 12.647,12.896 5.979,12.896 5.979,19.562 12.647,19.562 12.647,26.229 19.312,26.229 19.312,19.562 25.979,19.562z',
    'M16,1.466C7.973,1.466,1.466,7.973,1.466,16c0,8.027,6.507,14.534,14.534,14.534c8.027,0,14.534-6.507,14.534-14.534C30.534,7.973,24.027,1.466,16,1.466zM20.729,7.375c0.934,0,1.688,1.483,1.688,3.312S21.661,14,20.729,14c-0.932,0-1.688-1.483-1.688-3.312S19.798,7.375,20.729,7.375zM11.104,7.375c0.932,0,1.688,1.483,1.688,3.312S12.037,14,11.104,14s-1.688-1.483-1.688-3.312S10.172,7.375,11.104,7.375zM16.021,26c-2.873,0-5.563-1.757-7.879-4.811c2.397,1.564,5.021,2.436,7.774,2.436c2.923,0,5.701-0.98,8.215-2.734C21.766,24.132,18.99,26,16.021,26z',
    'M21.871,9.814 15.684,16.001 21.871,22.188 18.335,25.725 8.612,16.001 18.335,6.276z',
    'M5.5,5.5h20v20h-20z',
    'M 13.386252,0.21358681 2.3862524,8.2135868 0.38625236,22.213587 6.3862524,28.213587 17.386252,29.213587 28.386252,19.213587 27.386252,9.2135868 13.386252,16.213587 Z M 8.0858224,8.3509098 C 8.0858224,8.3509098 3.0858224,28.85091 19.585822,18.60091'

  ];

  if($scope.decal.path === ''){
    //add default
    $scope.decal.path = $scope.decals[0];
  }

  $scope.delete = function() {
    $mdDialog.hide('delete');
  };

  $scope.cancel = function() {
    $mdDialog.cancel();
  };
  $scope.save = function() {
    $mdDialog.hide($scope.decal);
  };
}
angular.module('avionmakeApp')
  .controller('DrawDialogCtrl', DrawDialogCtrl);

angular.module('avionmakeApp')
  .directive('planeTexture', avionmakeApp.planeTextureFactory());
