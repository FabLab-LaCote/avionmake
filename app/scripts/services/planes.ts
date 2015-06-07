/// <reference path="../app.ts" />

'use strict';

declare function Path2D(path:string):void;
interface CanvasRenderingContext2D{
   clip(path:any, clip:string):void;
   stroke(path:any):void;
}

module avionmakeApp {
  
  export enum PrintState{NONE,PREVIEW,PRINT,CUT};
  
  export class Planes {
    /*@ngInject*/
    constructor(private $http:ng.IHttpService, private $q:ng.IQService){
      console.log($http);
      this.brushSize = 24
      this.brushColor = [0,0,0];
      this.loadLocal();
      this.selectedPalette = 'clrs.cc';
    }
        
    currentPlane:Plane;
    brushSize:number;
    brushColor:number[];
    selectedPalette:string;
    mergePDF:boolean;
        
    createPlane(type:string):Plane{
      return new Plane(type, this.templates[type]);
    }
    
    saveLocal():void{
      if(this.currentPlane){
        localStorage.setItem('currentPlane', this.currentPlane.toJSON());
      }
    }
    
    loadLocal():void{
      var planeJSON = localStorage.getItem('currentPlane')
      if(planeJSON){
        var planeData = JSON.parse(planeJSON);
        this.currentPlane = this.createPlane(planeData.type)
        this.currentPlane.fromJSON(planeData);
      }
    }
    
    preview():ng.IPromise<string>{
      var plane:Plane = this.currentPlane;
      plane.printState = PrintState.NONE;
      return new this.$q((resolve, reject)=>{
        this.$http.post('/api/plane', plane.toJSON())
        .then((resp)=>{
          plane.printState = PrintState.PREVIEW;
          resolve(resp.data);
        },(resp)=>{
          console.log(resp.data);
          reject('error');
        })
      });
    }
    
    templates:PlaneTemplateMap={
      plane1: Planes.plane1,
      plane2: Planes.plane1,
      plane3: Planes.plane1,
      plane4: Planes.plane1
    }
    
    palettes:any = {
      'basic':[[0,0,0]],
      'clrs.cc':[[0, 31, 63],[0, 116, 217],[127, 219, 255],[57, 204, 204],[61, 153, 112],[46, 204, 64],[1, 255, 112],[255, 220, 0],
      [255, 133, 27],[255, 65, 54],[133, 20, 75],[240, 18, 190],[177, 13, 201],[17, 17, 17],[170, 170, 170],[221, 221, 221]],
      'drawingboard.js-pastel':[[255, 255, 255],[255, 127, 254],[255, 127, 191],[255, 127, 127],[255, 191, 127],[254, 255, 127],[191, 255, 127],[127, 255, 127],[127, 255, 191],[127, 254, 255],[127, 191, 255],[127, 127, 255],[191, 127, 255]],
      'ww2-plane':[[72,83,77],[113,94,61],[78,95,79],[139,121,85],[23,43,76],[133,81,70],[208,175,80],[0,0,0]],
      'eurocopter':[[101,74,47],[41,43,42],[138,165,122],[163,121,83],[28,28,28],[131,156,117]],
      'sky':[[133,163,174],[28,41,83],[84,94,119],[90,106,131],[5,27,66],[120,173,239]]
    };
    
    static plane1:Part[]= [
      {
        name: 'fuselage',    
        path: 'M 36.163334,268.05405 C 66.863734,283.12005 96.096533,292.23085 128.32893,296.35125 227.56052,309.03685 308.34332,260.01885 428.73951,239.63145 518.73211,224.39245 569.65791,226.23405 569.65791,226.23405 L 1172.2356,226.23405 1214.0854,181.23895 1075.9722,186.12715 1076.0762,179.07545 1184.8716,174.58095 C 1184.8716,174.58095 1126.2232,0.78671926 1116.8226,0.38891926 1001.6776,-4.4842807 1042.305,86.144523 967.3809,129.11209 892.4567,172.07955 861.5963,176.24275 833.1677,176.18455 735.1503,175.98355 373.30532,174.69855 373.30532,174.69855 L 372.96232,182.51115 289.19532,183.63275 288.89132,174.97655 227.25732,173.41265 C 227.25732,173.41265 71.326934,197.70665 35.985934,205.83645 -5.4182561,215.36105 -17.716476,241.61345 36.163934,268.05425 Z',
        width: 1214,
        height: 298,
        position3D:{
          x:-1214/2,
          y:-298,
          z:0
        },
        rotation3D:{
          x: 0,
          y: 0,
          z: 0
        },
        position2D:{
          x: 500,
          y: 100
        },
        textureTop: true,
        textureBottom: true,
        textureFlipY: false,
        decals:[
          {
            x:1050,
            y:40,
            angle: 0,
            text: 'hello',
            size: 30
          },
          {
            x:80,
            y:200,
            angle: 180,
            text: 'pilot',
            size: 30
          },
          {
            x:800,
            y:200,
            angle: 0,
            text: 'test',
            size: 30
          },
           {
            x: 500,
            y: 200,
            angle:0,
            size: 0.5,
            path: 'M 26.53033,0.98188407 4.5303301,16.981884 0.53033009,44.981884 12.53033,56.981884 34.53033,58.981884 56.53033,38.981884 54.53033,18.981884 26.53033,32.981884 Z M 15.92947,17.256529 C 15.92947,17.256529 5.9294701,58.256529 38.92947,37.756529'
          }
        ]
      },
      {
        name: 'aile',
        path: 'M 0.20000003,567.76384 C 0.20000003,567.76384 0.56160003,1.007067 173.9111,0.20026696 273.04188,-0.26103304 248.8731,568.84092 248.8731,568.84092 248.8731,568.84092 267.69104,1138.2645 173.41382,1136.5499 0.41080003,1133.4036 0.20000003,567.76384 0.20000003,567.76384 Z',
        width: 252,
        height: 1136,
        position3D:{
          x:-225,
          y:-122,
          z:-1136/2
        },
        rotation3D:{
          x: 90 * Math.PI/180,
          y: 0,
          z: 0
        },
        position2D:{
          x: 200,
          y: 150
        },
        textureTop:true,
        decals:[
          {
            x: 50,
            y: 800,
            angle:-90,
            text: 'HELLO WORLD!',
            size: 40
          }
        ]
      }, 
      {
        name: 'aileron',
        path: 'M 15.688063,308.20569 C 15.688063,308.20569 0.23314336,313.38783 0.20104336,332.89695 -0.29499664,634.44763 176.2061,618.73523 176.2061,618.73523 L 178.71636,368.54755 151.10366,320.01617 151.07246,297.54839 178.71626,252.23957 182.9,0.37841151 C 182.9,0.37841151 -1.6456166,-16.488968 0.62650336,277.24601 0.83192336,303.80249 15.687963,308.20569 15.687963,308.20569 Z',
        width: 182,
        height: 618,
        position3D:{
          x:1214/2 - 182,
          y:-110,
          z:-618/2
        },
        rotation3D:{
          x: 90 * Math.PI/180,
          y: -0.05,
          z: 0
        },
        position2D:{
          x: 1750,
          y: 400
        },
        textureTop: true
      },
      {
        name:'cockpit',
        path:'M 318.02299,182.3926 C 315.29723,199.83608 330.43571,212.17846 330.43571,212.17846 209.97435,232.48974 227.55673,255.92014 128.325,243.23454 96.092684,239.11414 66.837985,229.98804 36.137504,214.92204 10.881524,202.52792 0.19200449,190.21736 0.20000449,179.60954 0.20800449,167.58734 13.954064,157.79448 35.950004,152.73454 71.291145,144.60474 227.64763,128.29514 227.30121,125.21434 226.95479,122.13354 71.916244,98.489337 36.575104,90.359537 14.579164,85.299537 0.62370449,76.580337 0.45010449,65.547137 0.29690449,55.811737 10.881624,44.253737 36.137604,31.859537 66.838085,16.793537 96.092784,7.6673366 128.3251,3.5471366 227.55683,-9.1384634 209.99435,16.840937 330.16379,37.566137 330.16379,37.566137 313.66727,57.728337 320.96871,75.855737 328.99531,95.783537 369.67215,115.99294 369.46101,125.07934 369.24985,134.1656 322.30179,155.01038 318.02299,182.3926 Z',
        width: 370,
        height: 248,
        position2D:{
          x: 500,
          y: 1100
        }
      },
      {
        name:'left_side',
        path:'M 36.06329,205.43541 C 66.76376,220.50143 95.99654,229.61211 128.22889,233.73259 227.46061,246.41807 308.24337,197.40007 428.63953,177.01273 518.63217,161.77377 569.55793,163.61541 569.55793,163.61541 L 1172.1355,163.61541 1213.9855,118.62035 C 1213.9855,118.62035 1202.9146,105.97537 1195.4399,102.77529 1166.2495,93.725848 1128.9703,107.58873 1105.6178,90.269608 1068.0392,55.068668 1090.8072,32.201728 1070.271,32.174968 1057.9983,32.158968 1065.8615,38.652468 1062.6997,106.30895 1067.8521,116.37715 1098.7337,124.35397 1098.7337,124.35397 L 683.35295,112.62707 C 683.35295,112.62707 685.66647,88.112328 677.61107,88.070488 647.35383,87.913288 522.91441,85.837488 506.91735,81.530048 496.17719,78.638088 482.11977,73.687388 475.40297,64.070428 463.40119,47.016668 464.66043,10.371528 447.22781,1.4672883 441.42307,-1.3206917 427.91429,1.0214483 427.91429,1.0214483 L 429.32359,111.95003 373.20555,112.07983 372.86255,119.89229 289.09555,121.01397 288.79149,112.35771 228.29889,111.13205 C 228.29889,111.13205 71.22715,135.08773 35.88603,143.21759 -5.5180901,152.74219 -17.81621,178.99447 36.06329,205.43541 Z',
        width: 1214,
        height: 236,
        position2D:{
          x: 500,
          y: 450
        }
      },
      {
        name:'right_side',
        path:'M 1178.0567,205.42251 C 1147.3562,220.49492 1118.1235,229.60946 1085.8911,233.73169 986.6594,246.42255 905.87665,197.38376 785.48051,176.98778 695.48788,161.74236 644.56213,163.58478 644.56213,163.58478 L 41.984621,163.58478 0.13468714,118.57063 C 0.13468714,118.57063 11.205565,105.92029 18.680264,102.71885 47.87064,93.665577 85.149814,107.53434 108.50233,90.207867 146.0809,54.991997 123.31297,32.115357 143.84917,32.088587 156.12182,32.072587 148.25862,38.568837 151.42046,106.25401 146.268,116.32648 115.38641,124.30669 115.38641,124.30669 L 530.76713,112.57481 C 530.76713,112.57481 528.45361,88.049677 536.50901,88.007817 566.76624,87.850547 691.20564,85.773867 707.2027,81.464597 717.94286,78.571417 732.00028,73.618617 738.71708,63.997577 750.71885,46.936587 749.45961,10.275907 766.89223,1.367887 772.69697,-1.421273 786.20575,0.92185702 786.20575,0.92185702 L 784.79645,111.89749 840.91448,112.02734 841.25748,119.84311 925.02447,120.96527 925.32853,112.30534 985.82112,111.07916 C 985.82112,111.07916 1142.8929,135.045 1178.234,143.17831 1219.6381,152.70694 1231.9362,178.97036 1178.0567,205.42251 Z',
        width: 1214,
        height: 236,
        position2D:{
          x: 500,
          y: 750
        }
      },
      {
        name:'angle',
        path:'M 0.77424055,0.09999482 33.804941,0.09999482 89.080741,205.69909 C 89.080741,205.69909 69.660341,210.93399 70.880141,240.07797 72.163641,270.74327 87.732541,275.80503 87.732541,275.80503 L 34.479041,480.05594 0.10014055,480.05594 Z',
        width: 89,
        height: 480,
        position2D:{
          x: 50,
          y: 500
        }
      }  
    ];
        
  }
  
  
  export class Plane {
    parts:Part[]=[];
    type:string;
    printState:PrintState;
    
    constructor(type:string, parts:Part[]){
      this.parts = angular.copy(parts);
      this.type = type;
      this.printState = PrintState.NONE;
      //augment template with missing objects
      this.parts.forEach((part:Part)=>{
        if(part.textureTop || part.textureBottom){
          part.drawTexture = true;
          var canvas:HTMLCanvasElement = document.createElement('canvas');
          var ctx = <CanvasRenderingContext2D> canvas.getContext('2d');
          ctx.globalCompositeOperation = 'source-atop';
          canvas.width = part.width;
          canvas.height = part.height;          
          part.textureCanvas = canvas;
          
          canvas = document.createElement('canvas');
          ctx = <CanvasRenderingContext2D> canvas.getContext('2d');
          canvas.width = part.width;
          canvas.height = part.height;
          part.bumpTextureCanvas = canvas;
          if(!part.decals){
            part.decals = [];
          }  
        }
      });
      this.createTextures();
      this.clearTextures();
      this.updateBumpTextures();
    }
        
    getPart(name:string):Part{
      for(var p=0; p< this.parts.length; p++){
        if(this.parts[p].name === name){
          return this.parts[p];
        }
      }
      return null;
    }
    
    //TODO create part class?
    createTextures():void{
      this.parts.forEach((part:Part)=>{
        if(part.textureTop || part.textureBottom){
           part.texture = new THREE.Texture(part.textureCanvas);
           part.texture.minFilter = THREE.LinearFilter;
           part.texture.needsUpdate = true;
           part.bumpTexture = new THREE.Texture(part.bumpTextureCanvas);
           part.bumpTexture.minFilter = THREE.LinearFilter;
           part.bumpTexture.needsUpdate = true;
        }
      });
    }
    
        
    clearTextures():void{
      this.parts.forEach((part:Part)=>{
        if(part.textureTop || part.textureBottom){
            var ctx = <CanvasRenderingContext2D>  part.textureCanvas.getContext('2d');
            ctx.lineWidth = 4;
            
            ctx.stroke(new Path2D(part.path));
            ctx.clip(new Path2D(part.path), 'nonzero');
            ctx.fillStyle = "#ffffff";            
            ctx.fillRect(0,0,part.width,part.height);
            
            part.textureBitmap = part.textureCanvas.toDataURL();
            part.texture.needsUpdate = true;
        }
      });
    }
    
    updateBumpTextures():void{
      this.parts.forEach((part:Part)=>{
        if(part.textureTop || part.textureBottom){
             var ctx = <CanvasRenderingContext2D>  part.bumpTextureCanvas.getContext('2d');
             ctx.fillStyle = "#ffffff";
             ctx.rect( 0, 0, part.width, part.height );
             ctx.fill(); 
             
             
             //DEBUG
             /*
             ctx.strokeStyle = 'black';
             ctx.lineWidth = 4;
             ctx.stroke(new Path2D(part.path));
            */
            
             ctx.lineWidth = 1;
            
            
             if(part.decals){
                part.decals.forEach((d:Decal)=>{
                  ctx.save();
                  ctx.translate(d.x,d.y); 
                  ctx.rotate(d.angle*Math.PI/180);
                  if(d.text){
                    ctx.font = d.size + 'px Arial';
                    ctx.strokeText(d.text, 0, d.size-8); //TODO check alignment
                  }
                  if(d.path){                     
                    ctx.scale(d.size,d.size); 
                    ctx.stroke(new Path2D(d.path)); 
                  }
                  ctx.restore();
                });
             }
            part.bumpTexture.needsUpdate = true;
        }
      });
    }
    
    
    toJSON():string{
      var json = {
        type: this.type,
        printState: this.printState,
        parts:[]
      };
      //save parts with textures and decals
      this.parts.forEach((part:Part)=>{
        if(part.textureTop || part.textureBottom){
          json.parts.push({
            name: part.name,
            textureBitmap: part.textureBitmap,
            decals: angular.copy(part.decals)
          });
        }
      });
      return JSON.stringify(json); 
    }
    
    fromJSON(obj):void{
      this.printState = obj.printState;
      obj.parts.forEach((part:Part)=>{
          var localPart = this.getPart(part.name);
          //update decals
          localPart.decals = part.decals;
          //write texture
          var ctx = <CanvasRenderingContext2D>localPart.textureCanvas.getContext('2d');
          var img = new Image();
          img.src = part.textureBitmap; 
          ctx.drawImage(img, 0, 0);
          localPart.textureBitmap = part.textureBitmap;
          localPart.texture.needsUpdate = true;
      });
      this.updateBumpTextures();
    }
    
  };
  
  export interface PlaneTemplateMap{
    [index: string]: Part[];
  }
  
  export interface Part{
    name: string;
    path: string;
    width: number;
    height: number;
    position2D?: {
        x: number,
        y: number
    };
    position3D?: {
        x: number,
        y: number,
        z: number
    };
    rotation3D?: {
        x: number,
        y: number,
        z: number
    };
    textureBitmap?:string
    textureCanvas?:HTMLCanvasElement;
    texture?:THREE.Texture;
    bumpTextureCanvas?:HTMLCanvasElement;
    bumpTexture?:THREE.Texture;
    textureTop?:boolean;
    textureBottom?:boolean;
    textureFlipY?:boolean;
    decals?:Decal[];
    drawTexture?:boolean;
  }
  
  
  export interface Decal{
    x:number;
    y:number;
    angle:number;
    text?:string;
    size?:number;
    path?:string;
  }
}

angular.module('avionmakeApp')
  .service('planes', avionmakeApp.Planes);
