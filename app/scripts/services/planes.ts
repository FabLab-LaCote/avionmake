/// <reference path="../app.ts" />

'use strict';

declare function Path2D(path:string):void;
interface CanvasRenderingContext2D{
   clip(path:any, clip:string):void;
   stroke(path:any):void;
}

module avionmakeApp {
  
  export enum PrintState{NONE,PREVIEW,PRINT,CUT,ASSEMBLE,FLY};
  
  export class Planes {
    /*@ngInject*/
    constructor(private $http:ng.IHttpService, private $q:ng.IQService, private BASE_URL:string){
      this.brushSize = 24
      this.brushColor = [0,0,0];
      this.loadLocal();
      this.selectedPalette = 'clrs.cc';
    }
    
    currentGalleryId:string;
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
    
    deleteLocal():void{
      localStorage.removeItem('currentPlane');
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
        this.$http.post(this.BASE_URL + '/api/plane', this.fixPlane(plane))
        .then((resp)=>{
          plane.printState = PrintState.PREVIEW;
          plane.setId(String(resp.data));
          resolve(plane._id);
        },(resp)=>{
          console.log(resp.data);
          if(resp.status === 0){
            reject('server not found');
          }else{
            reject('error on the server');  
          }
        })
      });
    }
    
    print(info:any):ng.IPromise<any>{
      return new this.$q((resolve, reject)=>{
        this.$http.post(this.BASE_URL + '/api/print/' + this.currentPlane._id, info)
        .then((resp)=>{
          this.currentPlane.printState = PrintState.PRINT;
          resolve(resp.data);
        },(resp)=>{
          console.log(resp.data);
          reject('error');
        })
      });        
    }
    
    templates:PlaneTemplateMap={
      plane1: Planes.plane1,
      fighter1: Planes.fighter1
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
    
    fixPlane(plane:Plane):any{
      if(plane.type === 'plane1'){
          var p = plane.getPart('fuselage');
          var pp = plane.getPart('fuselagePrint');
          var c = plane.getPart('cockpit');
          var l = plane.getPart('left_side');
          var r = plane.getPart('right_side');
          
          //copy decals
          var wy = 172;
          var ww = 370;
          l.decals = [];
          r.decals = [];
          c.decals = [];
          pp.decals = [];
          p.decals.forEach((d:Decal) =>{
            //below tail
            if(d.y > wy){
              //on cockpit
              if(d.x < ww){
                var c1 = angular.copy(d);
                c1.y = c1.y-52;
                c.decals.push(c1);
              }else{
                var dl = angular.copy(d);
                dl.y = dl.y-60;
                l.decals.push(dl);  
              }
            }else{
              pp.decals.push(angular.copy(d));  
            }
          });
           
          //copy textures
          var canvas = document.createElement('canvas');
          canvas.width = c.width;
          canvas.height = c.height;
          var ctx = <CanvasRenderingContext2D> canvas.getContext('2d');
          var img = new Image();
          img.src = p.textureBitmap;
          ctx.drawImage(img, 0, wy, ww, p.height-wy, 0, 120, ww, p.height-wy);
          ctx.scale(1, -1);
          ctx.drawImage(img, 0, wy, ww, p.height-wy, 0, -0, ww, -(p.height-wy));
          c.textureBitmap = canvas.toDataURL();
              
          //copy left
          var wd = 360;
          var hd = 0; 
          canvas = document.createElement('canvas');
          ctx = <CanvasRenderingContext2D> canvas.getContext('2d');
          canvas.width = l.width;
          canvas.height = l.height;
          ctx.drawImage(img, wd, wy, p.width-wd, p.height-wy, wd, 110, p.width-wd, p.height-wy);
          l.textureBitmap = canvas.toDataURL();
          
          //copy right
          canvas = document.createElement('canvas');
          ctx = <CanvasRenderingContext2D> canvas.getContext('2d');
          canvas.width = r.width;
          canvas.height = r.height;
          ctx.scale(-1, 1);
          ctx.drawImage(img, wd, wy, p.width-wd, p.height-wy, 0, 110, -p.width + wd, p.height-wy);
          r.textureBitmap = canvas.toDataURL();
          
          //tuncate fueslage
          wd = 800;
          hd = 190;
          canvas = document.createElement('canvas');
          ctx = <CanvasRenderingContext2D> canvas.getContext('2d');
          canvas.width = pp.width;
          canvas.height = pp.height;
          ctx.drawImage(img, wd, 0, p.width-wd, hd, wd, 0, p.width-wd, hd);
          pp.textureBitmap = canvas.toDataURL();
  	   } //fix plane1
       if(plane.type === 'fighter1'){
          //copy wings
          var wr = plane.getPart('wingright');
          var wrp = plane.getPart('wingrightprint');
          var canvas = document.createElement('canvas');
          var ctx = <CanvasRenderingContext2D> canvas.getContext('2d');
          canvas.width = wrp.width;
          canvas.height = wrp.height;
          wrp.decals = [];
          wr.decals.forEach((d:Decal)=>{
            wrp.decals.push(angular.copy(d));
          });
          ctx.drawImage(wr.textureCanvas, 0, 0);
          wrp.textureBitmap = canvas.toDataURL();
          
          var wl = plane.getPart('wingleft');
          var wlp = plane.getPart('wingleftprint');
          var canvas = document.createElement('canvas');
          var ctx = <CanvasRenderingContext2D> canvas.getContext('2d');
          canvas.width = wlp.width;
          canvas.height = wlp.height;
          wlp.decals = [];
          var dy = 91;
          wl.decals.forEach((d:Decal)=>{
            var copy = angular.copy(d);
            copy.y += dy;
            wlp.decals.push(copy);
          });
          ctx.drawImage(wl.textureCanvas, 0, dy)          
          wlp.textureBitmap = canvas.toDataURL();

          //copy tails onto print
          var tp = plane.getPart('tailprint');
          tp.decals = [];
          var tl = plane.getPart('tailleft');
          var canvas = document.createElement('canvas');
          var ctx = <CanvasRenderingContext2D> canvas.getContext('2d');
          canvas.width = tp.width;
          canvas.height = tp.height;
          ctx.drawImage(tl.textureCanvas, 0, 0);
          
          tl.decals.forEach((d:Decal)=>{
            tp.decals.push(angular.copy(d));
          });
          var tr = plane.getPart('tailright');
          var dy = 303
          ctx.drawImage(tr.textureCanvas, 0, 303);          
          
          tr.decals.forEach((d:Decal)=>{
            var copy = angular.copy(d);
            copy.y += dy;
            tp.decals.push(copy);
          });
          tp.textureBitmap = canvas.toDataURL();
          
          
          var f = plane.getPart('fuselage');
          var f2l = plane.getPart('f2leftprint');
          f2l.decals=[];
          var f3l = plane.getPart('f3leftprint');
          f3l.decals=[];
          
          var f2r = plane.getPart('f2rightprint');
          f2r.decals=[];
          var f3r = plane.getPart('f3rightprint');
          f3r.decals=[];

          var copy;
           f.decals.forEach((d:Decal)=>{
             if(d.x < f2l.width-10 && d.x > 400){
                copy = angular.copy(d);
                copy.y -=6;
                f2l.decals.push(copy);
             }
             if(d.x < f3l.width-10 && d.y > 62){
                  copy = angular.copy(d);
                  copy.y -=62;
                  f3l.decals.push(copy);
              }
           });        
           
          canvas = document.createElement('canvas');
          ctx = <CanvasRenderingContext2D> canvas.getContext('2d');
          canvas.width = f2l.width;
          canvas.height = f2l.height;
          ctx.clip(new Path2D(f2l.path), 'nonzero');
          ctx.drawImage(f.textureCanvas, 0, -6);
          f2l.textureBitmap = canvas.toDataURL();
          
          canvas = document.createElement('canvas');
          ctx = <CanvasRenderingContext2D> canvas.getContext('2d');
          canvas.width = f3l.width;
          canvas.height = f3l.height;
          ctx.clip(new Path2D(f3l.path), 'nonzero');
          ctx.drawImage(f.textureCanvas, 0, -62);
          f3l.textureBitmap = canvas.toDataURL();
          
          canvas = document.createElement('canvas');
          ctx = <CanvasRenderingContext2D> canvas.getContext('2d');
          canvas.width = f2r.width;
          canvas.height = f2r.height;
          ctx.clip(new Path2D(f2r.path), 'nonzero');
          ctx.scale(1, -1);
          ctx.drawImage(f.textureCanvas, 0, 6, f2r.width, f2r.height, 0, 0, f2r.width, -f2r.height);
          f2r.textureBitmap = canvas.toDataURL();
          
          canvas = document.createElement('canvas');
          ctx = <CanvasRenderingContext2D> canvas.getContext('2d');
          canvas.width = f3r.width;
          canvas.height = f3r.height;
          ctx.clip(new Path2D(f3r.path), 'nonzero');
          ctx.scale(1, -1);
          ctx.drawImage(f.textureCanvas, 0, 62, f3r.width, f3r.height, 0, 0, f3r.width, -f3r.height);
          f3r.textureBitmap = canvas.toDataURL();
          
       }//fix fighter1
       
       return plane.toJSON();
    }
    
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
        textureTop: true,
        textureBottom: true,
        textureFlipY: false,
        decals:[
          {x: 1075, y: 197, angle: 0, size: 30, text: "??-???", locked: 'tailnumber'}
        ]
      },
      {
        name: 'fuselagePrint',    
        path: 'M 36.163334,268.05405 C 66.863734,283.12005 96.096533,292.23085 128.32893,296.35125 227.56052,309.03685 308.34332,260.01885 428.73951,239.63145 518.73211,224.39245 569.65791,226.23405 569.65791,226.23405 L 1172.2356,226.23405 1214.0854,181.23895 1075.9722,186.12715 1076.0762,179.07545 1184.8716,174.58095 C 1184.8716,174.58095 1126.2232,0.78671926 1116.8226,0.38891926 1001.6776,-4.4842807 1042.305,86.144523 967.3809,129.11209 892.4567,172.07955 861.5963,176.24275 833.1677,176.18455 735.1503,175.98355 373.30532,174.69855 373.30532,174.69855 L 372.96232,182.51115 289.19532,183.63275 288.89132,174.97655 227.25732,173.41265 C 227.25732,173.41265 71.326934,197.70665 35.985934,205.83645 -5.4182561,215.36105 -17.716476,241.61345 36.163934,268.05425 Z',
        width: 1214,
        height: 298,
        position2D:{
          x: 500,
          y: 100
        }
      },
      {
        name: 'aile',
        path: 'M 0.20000003,567.76384 C 0.20000003,567.76384 0.56160003,1.007067 173.9111,0.20026696 273.04188,-0.26103304 248.8731,568.84092 248.8731,568.84092 248.8731,568.84092 267.69104,1138.2645 173.41382,1136.5499 0.41080003,1133.4036 0.20000003,567.76384 0.20000003,567.76384 Z',
        width: 252,
        height: 1136,
        position2D:{
          x: 200,
          y: 150
        },
        textureTop:true,
      },
      {
        name: 'aile3DRight',
        path: 'M 174.21094 0.5 C 0.86143756 1.3068001 0.5 568.06445 0.5 568.06445 C 0.5 568.06445 0.51750935 569.30415 0.51757812 569.35352 L 249.17969 569.35352 C 249.17964 569.35217 249.17383 569.14062 249.17383 569.14062 C 249.17383 569.14062 273.34172 0.0387 174.21094 0.5 z',
        width: 252,
        height: 567,
        position3D:{
          x:-225,
          y:-191.5,
          z:-563
        },
        rotation3D:{
          x: 83 * Math.PI/180,
          y: 0,
          z: 0
        },
        textureTop:true,
        drawTexture:false
      }, 
      {
        name: 'aile3DLeft',
        path: 'M 249.16281,0.49999217 0.50069699,0.49999217 C 0.51100426,7.8992222 1.8396606,564.8707 173.69601,567.9961 267.87068,569.7088 249.20355,1.7361222 249.16281,0.49999217 Z',
        width: 252,
        height: 567,
        position3D:{
          x:-225,
          y:-122,
          z:2
        },
        rotation3D:{
          x: 97 * Math.PI/180,
          y: 0,
          z: 0
        },
        textureTop:true,
        drawTexture:false
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
   
   static fighter1:Part[] = [{
      name: 'fuselage',
      path: 'M 2.6468171,118.48114 C 12.884717,103.16874 158.97412,68.233736 158.97412,68.233736 258.6931,24.640576 319.66074,-14.222064 446.65206,5.445636 L 782.09137,55.956736 864.49946,101.06474 C 864.49946,101.06474 1219.4809,95.858336 1222.7033,97.329536 1225.9257,98.800736 1225.0669,128.24354 1225.0669,128.24354 L 1168.6035,155.13954 1103.5512,159.61634 925.65362,211.74834 897.01128,189.70214 561.61106,190.11214 504.81738,151.07354 246.72716,160.53094 C 246.72716,160.53094 133.75748,162.97714 79.460557,153.06734 51.339177,147.93454 -13.113783,142.05314 2.6467171,118.48114 Z',
      width: 1225,
      height: 212,
      position3D:{
        x:-1225/2,
        y:-298,
        z:0
      },
      rotation3D:{
        x: 0,
        y: 0,
        z: 0
      },
      position2D:{
          x: 30,
          y: 376
      },
      textureTop: true,
      textureBottom: true,
      textureFlipY: false
    },
    {
        name: 'wingright',
        path: 'M 0.18806195,448.93717 C -1.817538,443.45433 31.598362,389.35773 31.598362,389.35773 L 265.78706,269.26695 C 265.78706,269.26695 448.64064,111.39666 559.6459,16.461897 575.51244,2.8923975 599.31932,1.7116575 620.14628,0.25643747 640.77708,-1.1850825 681.72688,7.8189975 681.72688,7.8189975 L 554.57172,306.71305 582.33354,307.07967 741.14688,182.83787 C 741.14688,182.83787 772.68328,150.06231 807.04936,156.90915 821.11456,159.71143 844.86196,177.43605 844.86196,177.43605 844.86196,177.43605 822.20856,306.36915 819.99416,310.28177 817.70556,314.32563 775.67968,334.80249 775.67968,334.80249 775.67968,334.80249 804.60296,344.69635 806.18016,346.62627 807.75716,348.55619 808.54296,394.36521 806.43016,396.40045 804.31756,398.43569 789.39676,398.09759 789.39676,398.09759 L 807.04936,415.11601 807.04936,449.10982 Z',
        width: 845,
        height: 449,
        position3D:{
          x:-196,
          y:-200,
          z:451
        },
        rotation3D:{
          x: -90 * Math.PI/180,
          y: 0,
          z: 0
        },
        textureBottom: true,
        textureFlipY: false,
      },
      {
        name: 'wingleft',
        path: 'M 0.18806195,0.2726589 C -1.817538,5.7554989 31.598362,59.852099 31.598362,59.852099 L 265.78706,179.94288 C 265.78706,179.94288 448.64064,337.81317 559.6459,432.74793 575.51244,446.31743 599.31932,447.49817 620.14628,448.95339 640.77708,450.39491 681.72688,441.39083 681.72688,441.39083 L 554.57172,142.49678 582.33354,142.13016 741.14688,266.37196 C 741.14688,266.37196 772.68328,299.14752 807.04936,292.30068 821.11456,289.4984 844.86196,271.77378 844.86196,271.77378 844.86196,271.77378 822.20856,142.84068 819.99416,138.92806 817.70556,134.8842 775.67968,114.40734 775.67968,114.40734 775.67968,114.40734 804.60296,104.51348 806.18016,102.58356 807.75716,100.65364 808.54296,54.844619 806.43016,52.809379 804.31756,50.774139 789.39676,51.112239 789.39676,51.112239 L 807.04936,34.093819 807.04936,0.1000089 Z',
        width: 845,
        height: 449,
        position3D:{
          x:-196,
          y:-200,
          z:2
        },
        rotation3D:{
          x: -90 * Math.PI/180,
          y: 0,
          z: 0
        },
        textureBottom: true,
        textureFlipY: false,
      },
      {
        name: 'tailleft',
        path: 'M 293.65805,0.13971626 230.72813,175.88682 212.75777,175.98724 122.09822,176.08708 31.438665,176.18694 C 27.823525,175.84074 0.26934458,175.93034 0.26934458,175.93034 L 203.41035,0.10001626 Z',
        width: 294,
        height: 176,
        position3D:{
          x:360,
          y:-364,
          z:-114
        },
        rotation3D:{
          x: 20 * Math.PI/180,
          y: 0,
          z: 0
        },
        textureBottom: true,
        textureFlipY: false,
        decals:[
            {x: 127, y: 79, angle: 0, size: 30, text: "??-???", locked: 'tailnumber'}
        ]
      },
      {
        name: 'tailright',
        path: 'M 293.65805,176.14723 230.72813,0.40012513 212.75777,0.29970513 122.09822,0.19986513 31.438665,0.10000513 C 27.823525,0.44620513 0.26934458,0.35660513 0.26934458,0.35660513 L 203.41035,176.18693 Z',
        width: 294,
        height: 176,
        position3D:{
          x:360,
          y:-198,
          z:58
        },
        rotation3D:{
          x: -200 * Math.PI/180,
          y: 0,
          z: 0
        },
        textureBottom: true,
        textureFlipY: false,
        decals:[
            {x: 229, y: 102, angle: 180, size: 30, text: "??-???", locked: 'tailnumber'}
        ]
      },
      {
        name: 'wingrightprint',
        path: 'M 0.18806195,448.93721 C -1.817538,443.45437 31.598362,389.35777 31.598362,389.35777 L 265.78706,269.26699 C 265.78706,269.26699 448.64064,111.3967 559.6459,16.461936 575.51244,2.8924363 599.31932,1.7116963 620.14628,0.2564763 640.77708,-1.1850437 681.72688,7.8190363 681.72688,7.8190363 L 554.57172,306.71309 582.33354,307.07971 741.14688,182.83791 C 741.14688,182.83791 772.68328,150.06235 807.04936,156.90919 821.11456,159.71147 844.86196,177.43609 844.86196,177.43609 844.86196,177.43609 822.20856,306.36919 819.99416,310.28181 817.70556,314.32567 775.67968,334.80253 775.67968,334.80253 775.67968,334.80253 804.60296,344.69639 806.18016,346.62631 807.75716,348.55623 808.54296,394.36525 806.43016,396.40049 804.31756,398.43573 789.39676,398.09763 789.39676,398.09763 L 807.04936,415.11605 807.04936,488.00073 437.30366,496.14331 291.71576,539.35785 C 291.71576,539.35785 141.97436,538.32277 139.05466,536.94697 135.85816,535.44069 112.94926,513.62133 112.94926,513.62133 112.94926,513.62133 2.003062,453.89871 0.18806195,448.93721 Z',
        width: 845,
        height: 540,
        position2D:{
          x:590,
          y:300
        }
      },
      {
        name: 'wingleftprint',
        path: 'M 0.18806195,90.520767 C -1.817538,96.003607 31.598362,150.10021 31.598362,150.10021 L 265.78706,270.19099 C 265.78706,270.19099 448.64064,428.06128 559.6459,522.99604 575.51244,536.56554 599.31932,537.74628 620.14628,539.2015 640.77708,540.64302 681.72688,531.63894 681.72688,531.63894 L 554.57172,232.74489 582.33354,232.37827 741.14688,356.62007 C 741.14688,356.62007 772.68328,389.39563 807.04936,382.54879 821.11456,379.74651 844.86196,362.02189 844.86196,362.02189 844.86196,362.02189 822.20856,233.08879 819.99416,229.17617 817.70556,225.13231 775.67968,204.65545 775.67968,204.65545 775.67968,204.65545 804.60296,194.76159 806.18016,192.83167 807.75716,190.90175 808.54296,145.09273 806.43016,143.05749 804.31756,141.02225 789.39676,141.36035 789.39676,141.36035 L 807.04936,124.34193 807.04936,51.457247 437.30366,43.314667 291.71576,0.10012679 C 291.71576,0.10012679 141.97436,1.1352068 139.05466,2.5110068 135.85816,4.0172868 112.94926,25.836647 112.94926,25.836647 112.94926,25.836647 2.003062,85.559267 0.18806195,90.520767 Z',
        width: 845,
        height: 540,
        position2D:{
          x:456,
          y:30
        }
      },
      {
        name: 'f2leftprint',
        path: 'M 2.5462462,113.18015 C 12.782986,97.867313 158.86973,62.920773 158.86973,62.920773 L 320.7112,56.796653 434.7891,27.983253 446.5427,0.11045313 781.986,50.595093 863.7364,95.765913 417.5337,98.488053 504.7194,145.73405 246.63,155.21095 C 246.63,155.21095 133.66049,157.66581 79.362826,147.76043 51.240946,142.63021 -13.212414,136.75305 2.5462462,113.18015 Z',
        width: 864,
        height: 156,
        position2D:{
          x: 30,
          y: 264
        }
      },
      {
        name: 'f2rightprint',
        path: 'M 2.5462462,42.401057 C 12.782986,57.713894 158.86973,92.660434 158.86973,92.660434 L 320.7112,98.784554 434.7891,127.59795 446.5427,155.47075 781.986,104.98611 863.7364,59.815294 417.5337,57.093154 504.7194,9.8471572 246.63,0.37025722 C 246.63,0.37025722 133.66049,-2.0846028 79.362826,7.8207772 51.240946,12.950997 -13.212414,18.828157 2.5462462,42.401057 Z',
        width: 864,
        height: 156,
        position2D:{
          x: 30,
          y: 512
        }
      },
      {
        name: 'f3leftprint',
        path: 'M 2.5462462,56.484146 C 12.782986,41.171306 158.86973,6.2247663 158.86973,6.2247663 L 320.71122,0.10064635 373.90282,18.646226 417.53372,41.792046 504.71942,89.038046 246.63001,98.514946 C 246.63001,98.514946 133.66049,100.96981 79.362826,91.064426 51.240946,85.934206 -13.212414,80.057046 2.5462462,56.484146 Z',
        width: 505,
        height: 99,
        position2D:{
          x: 30,
          y: 174
        }
      },
      {
        name: 'f3rightprint',
        path: 'M 2.5462462,42.401058 C 12.782986,57.713898 158.86973,92.660438 158.86973,92.660438 L 320.71122,98.784558 373.90282,80.238978 417.53372,57.093158 504.71942,9.8471579 246.63001,0.37025792 C 246.63001,0.37025792 133.66049,-2.0846021 79.362826,7.8207779 51.240946,12.950998 -13.212414,18.828158 2.5462462,42.401058 Z',
        width: 505,
        height: 99,
        position2D:{
          x: 30,
          y: 604
        }
      },
      {
        name: 'tailprint',
        path: 'M 203.41007,0.10001784 0.26937296,175.93206 C 0.26937296,175.93206 27.822273,175.83976 31.437373,176.18596 35.052573,176.53236 37.657373,176.21688 37.160073,185.38128 L 37.160073,293.7133 C 37.657373,302.8777 35.052573,302.56222 31.437373,302.90862 27.822273,303.25482 0.26937296,303.16642 0.26937296,303.16642 L 203.41007,478.99456 293.65617,478.9555 230.72647,303.2094 212.75767,303.10784 230.92567,284.143 230.92567,194.9555 212.75767,175.98674 230.72647,175.88908 293.65617,0.13907784 Z',
        width: 294,
        height: 479,
        position2D:{
          x: 530,
          y: 463
        }
      }
  ];
        
  }

  
  export class Plane {
    parts:Part[]=[];
    type:string;
    printState:PrintState;
    _id:string;
    name:string;
    lastModified:Date;
    created:Date;
    disabled:boolean;
    info:{
      email:string,
      pcode:string,
      newsletter:boolean,
      emailSent:Date
    }
    
    constructor(type:string, parts:Part[]){
      this.parts = angular.copy(parts);
      this.type = type;
      this.printState = PrintState.NONE;
      //augment template with missing objects
      this.parts.forEach((part:Part)=>{
        if(part && (part.textureTop || part.textureBottom)){
          if(!part.hasOwnProperty('drawTexture')){
            part.drawTexture = true;  
          }
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
        if(part && (part.textureTop || part.textureBottom)){
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
        if(part && part.drawTexture && (part.textureTop || part.textureBottom)){
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
        if(part && (part.textureTop || part.textureBottom)){
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
      this.fix3D();
    }
    
    setId(id){
      this._id = id;
      this.setTailNumberDecal(id);
    }
    
    setTailNumberDecal(id:string):void{
      var p,d=0;
      var decal:Decal;
      for(p=0; p<this.parts.length;p++){
        var decals = this.parts[p].decals;
        if(decals){
          for(d=0; d<decals.length; d++){
            if(decals[d].locked === 'tailnumber'){
              decals[d].text = id; 
            }
          }
        }
      }
    }
    
    toJSON():string{
      var json = {
        type: this.type,
        printState: this.printState,
        parts:[],
        _id: this._id,
        name: this.name,
        lastModified: this.lastModified,
        created: this.created,
        info: this.info
      };
      //save parts with textures and decals
      this.parts.forEach((part:Part)=>{
        //Send all textures for server canvas bug...
        //if(part.textureTop || part.textureBottom){
        //TODO filter to not send 3donly textures?
        if(part.textureBitmap){
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
      try{
        if(typeof obj === 'string'){
          obj = JSON.parse(obj);
        }
        this.printState = obj.printState;
        this._id = obj._id;
        this.name = obj.name;
        this.lastModified = obj.lastModified;
        this.created = obj.created;
        this.info = obj.info;
        this.disabled = obj.disabled;
        obj.parts.forEach((part:Part)=>{
            var localPart = this.getPart(part.name);
            if(localPart.textureTop || localPart.textureBottom){
              //update decals
              localPart.decals = part.decals;
              //write texture
              var ctx = <CanvasRenderingContext2D>localPart.textureCanvas.getContext('2d');
              var img = new Image();
              img.src = part.textureBitmap; 
              ctx.drawImage(img, 0, 0);
              localPart.textureBitmap = part.textureBitmap;
              localPart.texture.needsUpdate = true;
            }
        });
        this.updateBumpTextures();
      }catch(e){
        
        console.log(e);
      }
    }
    
    fix3D():any{
      if(this.type === 'plane1'){
        var a = this.getPart('aile');
        var al = this.getPart('aile3DLeft');
        var ar = this.getPart('aile3DRight');
        var ctx = <CanvasRenderingContext2D> al.textureCanvas.getContext('2d');
        ctx.drawImage(a.textureCanvas,0,0, a.width, a.height/2, 0,0,a.width,a.height/2);
        al.texture.needsUpdate = true;
        
        ctx = <CanvasRenderingContext2D> ar.textureCanvas.getContext('2d');
        ctx.drawImage(a.textureCanvas,0, a.height/2, a.width, a.height/2, 0,0,a.width,a.height/2);
        ar.texture.needsUpdate = true;
        
        ctx = <CanvasRenderingContext2D> al.bumpTextureCanvas.getContext('2d');
        ctx.drawImage(a.bumpTextureCanvas,0,0, a.width, a.height/2, 0,0,a.width,a.height/2);
        al.texture.needsUpdate = true;
        
        ctx = <CanvasRenderingContext2D> ar.bumpTextureCanvas.getContext('2d');
        ctx.drawImage(a.bumpTextureCanvas,0, a.height/2, a.width, a.height/2, 0,0,a.width,a.height/2);
        ar.bumpTexture.needsUpdate = true;
      }
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
    locked?:string;
  }
}

angular.module('avionmakeApp')
  .service('planes', avionmakeApp.Planes);
