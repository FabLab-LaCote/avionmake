/// <reference path="../app.ts" />
'use strict';

declare module THREE {export var OrbitControls}
declare var $d3g:any;

module avionmakeApp {

  class Plane3dScene{
      scene:THREE.Scene;
      camera:THREE.PerspectiveCamera;
      controls: any;
      renderer: THREE.WebGLRenderer;
      plane:Plane;
      element:HTMLDivElement;
      
      constructor(plane:Plane){
        this.plane = plane;
      }
      
      init(element:HTMLDivElement){
        this.element = element; 
        this.scene = new THREE.Scene();
        
        this.camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 5000 );
        this.camera.position.set(-419,-287,-862);
        this.camera.up = new THREE.Vector3( 0, -1, 0 );
        
        //debug
        /*
        var gui:dat.GUI = new dat.GUI();
        
        var c = gui.addFolder('camera');
        c.add(this.camera.position, 'x').listen();
        c.add(this.camera.position, 'y').listen();
        c.add(this.camera.position, 'z').listen();
        */
        
        this.controls = new THREE.OrbitControls( this.camera, element );
        this.controls.noPan = true;
        this.controls.autoRotate = true;
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
        /*
                
        var light2 = new THREE.AmbientLight(0xFFFFFFF);
        this.scene.add(light2);
      */
        

        
        var scale:number = 0.75;
        //add meshs
        this.plane.createTextures();
        this.plane.parts.filter((part:Part)=>{
          return part.hasOwnProperty('position3D') && part.hasOwnProperty('rotation3D');
        })
        .forEach((part:Part)=>{
          var mesh:THREE.Mesh = this.partToMesh(part);
          mesh.scale.set(scale, scale, scale);
          mesh.position.set(part.position3D.x*scale, part.position3D.y*scale, part.position3D.z*scale);
          mesh.rotation.set(part.rotation3D.x, part.rotation3D.y, part.rotation3D.z);
          /*
          var f = gui.addFolder(part.name + ' position');
          f.add(mesh.position, 'x', -500, 500).onChange(this.render.bind(this));
          f.add(mesh.position, 'y', -500, 500).onChange(this.render.bind(this));
          f.add(mesh.position, 'z', -500, 500).onChange(this.render.bind(this));
          f.open();
          f = gui.addFolder(part.name + ' rotation');
          f.add(mesh.rotation, 'x', -5, 5).onChange(this.render.bind(this));
          f.add(mesh.rotation, 'y', -5, 5).onChange(this.render.bind(this));
          f.add(mesh.rotation, 'z', -5, 5).onChange(this.render.bind(this));
          f.open();
          */
          this.scene.add(mesh);
        });
        
        this.renderer.domElement.setAttribute('flex','');
        element.appendChild(this.renderer.domElement);
        window.addEventListener( 'resize', this.onWindowResize.bind(this), false );
        
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
        requestAnimationFrame(this.animate.bind(this));
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
          //return first...
          
          return new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
      }   
    }
  }

  export interface IPlaneScope extends ng.IScope {
    plane: Plane;
  }

  export class Plane3d implements ng.IDirective {
    template = '<div class="plane3d" layout="column" layout-align="center center"></div>';
    restrict = 'E';
    replace = true;
    scope = {
      'plane': '=',
      'refresh':'='
    }
    constructor( private $window: ng.IWindowService, planes: avionmakeApp.Planes ){}
    
    link = (scope: IPlaneScope, element: ng.IAugmentedJQuery, attrs: ng.IAttributes): void => {
      var plane =  new Plane3dScene(scope.plane);
      plane.init(<HTMLDivElement>element[0]);
      scope.$watch('refresh', ()=>{
        console.log('refresh');
        setTimeout(()=>{
          plane.onWindowResize();
        },501);
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
