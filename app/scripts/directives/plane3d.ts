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

declare module THREE {export var OrbitControls}
declare var $d3g:any;
declare module TWEEN{
  export var Tween;
  export var Easing;
  export var update;
  export function removeAll();
}

module avionmakeApp {

  class Plane3dScene{
      scene:THREE.Scene;
      camera:THREE.PerspectiveCamera;
      controls: any;
      renderer: THREE.WebGLRenderer;
      planeGroup: THREE.Group;
      element:HTMLDivElement;
      gui:dat.GUI;
      debug:boolean;
      resizeListener:EventListener;
      requestAnimation:number;

      constructor(){
      }

      init(element:HTMLDivElement){
        this.element = element;
        this.scene = new THREE.Scene();

        this.camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 5000 );
        this.camera.position.set(-569,-391,-1173);
        this.camera.up = new THREE.Vector3( 0, -1, 0 );

        //debug
        this.debug = false;

        if(this.debug){
          this.gui = new dat.GUI();
          var c = this.gui.addFolder('camera');
          c.add(this.camera.position, 'x').listen();
          c.add(this.camera.position, 'y').listen();
          c.add(this.camera.position, 'z').listen();
        }
        this.controls = new THREE.OrbitControls( this.camera, element );
        this.controls.noPan = true;
        this.controls.autoRotate = !this.debug;
        this.controls.damping = 0.2;
        this.controls.addEventListener( 'change', this.render.bind(this) );

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setClearColor(new THREE.Color(0x000000));
        this.renderer.setPixelRatio( window.devicePixelRatio );


        var light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(-1, 0, -1);
        this.scene.add(light);

        light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(1, 0, 1);
        this.scene.add(light);

        light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(0.5, -1, 0);
        this.scene.add(light);

        light = new THREE.DirectionalLight(0xffffff, 0.8);
        light.position.set(0, 1, 0);
        this.scene.add(light);


        //add meshs

        this.renderer.domElement.setAttribute('flex','');
        element.appendChild(this.renderer.domElement);
        this.resizeListener = this.onWindowResize.bind(this);
        window.addEventListener( 'resize', this.resizeListener, false );

        //HELPERS
        /*
        var axes = new THREE.AxisHelper(50);
        axes.position = mesh.position;
        this.scene.add(axes);


        var gridXZ = new THREE.GridHelper(100, 10);
        gridXZ.setColors(0x006600, 0x006600);
        gridXZ.position.set( 100,0,100 );
        this.scene.add(gridXZ);

        var gridXY = new THREE.GridHelper(100, 10);
        gridXY.position.set( 100,100,0 );
        gridXY.rotation.x = Math.PI/2;
        gridXY.setColors( 0x000066, 0x000066 );
        this.scene.add(gridXY);

        var gridYZ = new THREE.GridHelper(100, 10);
        gridYZ.position.set( 0,100,100 );
        gridYZ.rotation.z = Math.PI/2;
        gridYZ.setColors( 0x660000, 0x660000 );
        this.scene.add(gridYZ);
        */

        this.animate();
        this.onWindowResize();
      }

      addPlaneToGroup(plane:Plane, scale:number, done:()=>void){
           this.planeGroup = new THREE.Group();
           this.planeGroup.scale.set(scale, scale, scale);
           plane.createTextures();
           plane.parts.filter((part:Part)=>{
              return part.hasOwnProperty('position3D') && part.hasOwnProperty('rotation3D');
            }).forEach((part:Part)=>{
              var mesh:THREE.Mesh = this.partToMesh(part);
              mesh.position.set(part.position3D.x, part.position3D.y, part.position3D.z);
              mesh.rotation.set(part.rotation3D.x, part.rotation3D.y, part.rotation3D.z);
            if(this.debug){
              var f = this.gui.addFolder(part.name + ' position');
              f.add(mesh.position, 'x', -500, 500).onChange(this.render.bind(this));
              f.add(mesh.position, 'y', -500, 500).onChange(this.render.bind(this));
              f.add(mesh.position, 'z', -1000, 1000).onChange(this.render.bind(this));
              f.open();
              f = this.gui.addFolder(part.name + ' rotation');
              f.add(mesh.rotation, 'x', -5, 5).onChange(this.render.bind(this));
              f.add(mesh.rotation, 'y', -5, 5).onChange(this.render.bind(this));
              f.add(mesh.rotation, 'z', -5, 5).onChange(this.render.bind(this));
              f.open();
            }
            mesh.matrixAutoUpdate = this.debug;
  					mesh.updateMatrix();
            this.planeGroup.add(mesh);
            done();
          });

      }

      addPlane(plane:Plane, tween:boolean){
         var addAnimatedNewPlane = ()=> {
            this.addPlaneToGroup(plane, 0.01, ()=>{
              this.scene.add(this.planeGroup);
              var s2 = {s:0.01};
              var t2 = new TWEEN.Tween(s2).to( {s:1}, 2000 )
  				    .easing( TWEEN.Easing.Sinusoidal.InOut)
              .onUpdate(()=>{
                  var value = s2.s;
                  this.planeGroup.scale.set(value, value, value)
              })
              .onComplete(()=>{
                this.planeGroup.scale.set(1,1,1);
                this.onWindowResize();
              });
              t2.start();
            });
         }

         if(tween){
              //remove plane
              if(this.planeGroup){
                var s = {s:1};
                var t = new TWEEN.Tween(s).to( {s:0.01}, 2000 )
  					    .easing( TWEEN.Easing.Sinusoidal.InOut)
                .onUpdate(()=>{
                    var value = s.s;
                    this.planeGroup.scale.set(value, value, value)
                })
                .onComplete(()=>{
                    this.scene.remove(this.planeGroup);
                    addAnimatedNewPlane();
                  });
                t.start();
              }else{
                addAnimatedNewPlane();
              }
         }else{
             //no animation
             if(this.planeGroup){
                this.scene.remove(this.planeGroup);
             }
             this.addPlaneToGroup(plane, 1,()=>{
                this.scene.add(this.planeGroup);
                this.onWindowResize();
             });
         }
      }

      destroy(){
        window.removeEventListener('resize', this.resizeListener);
        TWEEN.removeAll();
        cancelAnimationFrame(this.requestAnimation);
        this.scene.children.forEach((o:THREE.Object3D)=>{
          this.scene.remove(o);
        });
        this.controls.destroy();
        delete this.renderer;
        delete this.scene;
        delete this.planeGroup;
        delete this.camera;
        delete this.controls;

      }

      render(){
        this.renderer.render( this.scene, this.camera );
      }

      onWindowResize() {
        if(this.element){
          this.camera.aspect =  this.element.clientWidth / this.element.clientHeight;
          this.camera.updateProjectionMatrix();
          this.renderer.setSize( this.element.clientWidth, this.element.clientHeight );
          this.render();
        }
      }

      animate() {
        this.requestAnimation = requestAnimationFrame(this.animate.bind(this));
        TWEEN.update();
        this.controls.update();
      }

      private colorMaterial = new THREE.MeshLambertMaterial({
          color: 0xFF0000
        });

      partToMesh(part:Part){
        var path = $d3g.transformSVGPath( part.path );
        var simpleShapes = path.toShapes(true);
        var len1 = simpleShapes.length;


        if(part.hasOwnProperty('textureFlipY')){
          part.texture.flipY = part.textureFlipY;
          part.bumpTexture.flipY = part.textureFlipY;
        }
        part.texture.needsUpdate = true;
        part.bumpTexture.needsUpdate = true;

        var materials = [
            new THREE.MeshPhongMaterial({
              map: part.textureBottom ? part.texture : null,
              bumpMap: part.textureBottom ? part.bumpTexture : null,
              color: 0xffffff}),
            this.colorMaterial,
            new THREE.MeshPhongMaterial({
              map: part.textureTop ? part.texture : null,
              bumpMap: part.textureTop ? part.bumpTexture : null,
              color: 0xffffff //0x0051ba
            }),
            this.colorMaterial
        ];

        //fix UV texture alignement
        for (var j = 0; j < len1; ++j) {
          var simpleShape = simpleShapes[j];
          var geometry = simpleShape.extrude({
            amount: 4,
            bevelEnabled: false
          });
          geometry.computeBoundingBox();
          var max     = geometry.boundingBox.max;
          var min     = geometry.boundingBox.min;

          var offset  = new THREE.Vector2(0 - min.x, 0 - min.y);
          var range   = new THREE.Vector2(max.x - min.x, max.y - min.y);

          geometry.faceVertexUvs[0] = [];
          var faces = geometry.faces;

          for (var i = 0; i < geometry.faces.length ; i++) {
            if (faces[ i ].normal.z > 0.9){
              faces[ i ].materialIndex = 2;
            }
            var v1 = geometry.vertices[faces[i].a];
            var v2 = geometry.vertices[faces[i].b];
            var v3 = geometry.vertices[faces[i].c];

            geometry.faceVertexUvs[0].push([
              new THREE.Vector2( ( v1.x + offset.x ) / range.x , ( v1.y + offset.y ) / range.y ),
              new THREE.Vector2( ( v2.x + offset.x ) / range.x , ( v2.y + offset.y ) / range.y ),
              new THREE.Vector2( ( v3.x + offset.x ) / range.x , ( v3.y + offset.y ) / range.y )
            ]);

          }
          geometry.uvsNeedUpdate = true;

          return new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
      }
    }
  }

  export interface IPlaneScope extends ng.IScope {
    plane: Plane;
    refresh:any;
    tween:boolean;
  }

  export class Plane3d implements ng.IDirective {
    template = '<div class="plane3d" layout="column" layout-align="center center"></div>';
    restrict = 'E';
    replace = true;
    scope = {
      'plane': '=',
      'refresh':'=',
      'tween':'='
    }

    constructor( private $window: ng.IWindowService, planes: avionmakeApp.Planes ){}

    link = (scope: IPlaneScope, element: ng.IAugmentedJQuery, attrs: ng.IAttributes): void => {
      var planeScene =  new Plane3dScene();
      planeScene.init(<HTMLDivElement>element[0]);
      scope.$watch('plane', ()=>{
        if(scope.plane){
          planeScene.addPlane(scope.plane, scope.tween);
        }
      });
      scope.$watch('refresh', ()=>{
        setTimeout(()=>{
          if(planeScene.onWindowResize){
            planeScene.onWindowResize();
          }
        },501);
      });
      scope.$on('$destroy',function(){
        planeScene.destroy();
        planeScene = null;
      });
    }

  }

  export function plane3dFactory() {
    var directive = ($window: ng.IWindowService, planes: avionmakeApp.Planes) => new avionmakeApp.Plane3d($window, planes);
    directive.$inject = ['$window', 'planes'];
    return directive;
  }

}

angular.module('avionmakeApp')
  .directive('plane3d', avionmakeApp.plane3dFactory());
