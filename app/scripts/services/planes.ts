/// <reference path="../app.ts" />

'use strict';

declare function Path2D(path:string):void;
interface CanvasRenderingContext2D{
   clip(path:any, clip:string):void;
   stroke(path:any):void;
}

module avionmakeApp {
  export class Planes {
    constructor(private $http:ng.IHttpBackendService){
      console.log($http);
      this.brushSize = 14
      this.brushColor = [0,0,0];
    }
        
    currentPlane:Plane;
    brushSize:number;
    brushColor:number[];
        
    createPlane(type:string):Plane{
      return new Plane(type, this.templates[type]);
    }
    
    templates:PlaneTemplateMap={
      plane1: Planes.plane1,
      plane2: Planes.plane1,
      plane3: Planes.plane1,
      plane4: Planes.plane1
    }
    
    palettes:any = {
      'basic':[[0,0,0],[255,255,255]],
      'clrs.cc':[[255,255,255],[0, 31, 63],[0, 116, 217],[127, 219, 255],[57, 204, 204],[61, 153, 112],[46, 204, 64],[1, 255, 112],[255, 220, 0],
      [255, 133, 27],[255, 65, 54],[133, 20, 75],[240, 18, 190],[177, 13, 201],[17, 17, 17],[170, 170, 170],[221, 221, 221]],
      'drawingboard.js-pastel':[[255, 255, 255],[255, 127, 254],[255, 127, 191],[255, 127, 127],[255, 191, 127],[254, 255, 127],[191, 255, 127],[127, 255, 127],[127, 255, 191],[127, 254, 255],[127, 191, 255],[127, 127, 255],[191, 127, 255]],
      'ww2-plane':[[255,255,255],[72,83,77],[113,94,61],[78,95,79],[139,121,85],[23,43,76],[133,81,70],[208,175,80],[0,0,0]],
      'eurocopter':[[255,255,255],[101,74,47],[41,43,42],[138,165,122],[163,121,83],[28,28,28],[131,156,117]],
      'sky':[[255,255,255],[133,163,174],[28,41,83],[84,94,119],[90,106,131],[5,27,66],[120,173,239]]
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
    constructor(type:string, parts:Part[]){
      this.parts = angular.copy(parts);
      this.type = type;
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
          part.texture = new THREE.Texture(part.textureCanvas);
          part.texture.minFilter = THREE.NearestFilter;
          
          canvas = document.createElement('canvas');
          ctx = <CanvasRenderingContext2D> canvas.getContext('2d');
          canvas.width = part.width;
          canvas.height = part.height;
          part.bumpTextureCanvas = canvas;
          part.bumpTexture = new THREE.Texture(part.bumpTextureCanvas);
          part.bumpTexture.minFilter = THREE.NearestFilter;
          //part.decals = [];  
        }
      });
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
           part.texture.minFilter = THREE.NearestFilter;
           part.texture.needsUpdate = true;
           part.bumpTexture = new THREE.Texture(part.bumpTextureCanvas);
           part.bumpTexture.minFilter = THREE.NearestFilter;
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
            ctx.rect( 0, 0, part.width, part.height );
            ctx.fill();
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
             ctx.lineWidth = 1;
             ctx.strokeStyle = 'black';        
             if(part.decals){
                part.decals.forEach((d:Decal)=>{
                  ctx.save();
                  ctx.translate(d.x,d.y); 
                  ctx.rotate(d.angle*Math.PI/180);
                  if(d.text){
                    ctx.font = d.size + 'px Arial';
                    ctx.strokeText(d.text, 0, 0);
                  }
                  ctx.restore();
                });
             }
            part.bumpTexture.needsUpdate = true;
        }
      });
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
    size?:number
  }

  export var fablab_logo:string = 'data:image/png;base64,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';
  
}

angular.module('avionmakeApp')
  .service('planes', avionmakeApp.Planes);
