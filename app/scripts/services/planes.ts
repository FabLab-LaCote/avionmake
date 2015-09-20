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
          this.currentPlane.name = info.name;
          this.saveLocal();
          resolve(resp.data);
        },(resp)=>{
          console.log(resp.data);
          reject('error');
        })
      });
    }

    templates:PlaneTemplateMap={
      plane1: Planes.plane1,
      fighter1: Planes.fighter1,
      biplane1: Planes.biplane1
    }

    palettes:any = {
      'clrs.cc':[[0, 31, 63],[0, 116, 217],[127, 219, 255],[57, 204, 204],[61, 153, 112],[46, 204, 64],[1, 255, 112],[255, 220, 0],
      [255, 133, 27],[255, 65, 54],[174,105,0],[133, 20, 75],[240, 18, 190],[177, 13, 201],[17, 17, 17],[170, 170, 170],[221, 221, 221]],
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
          var aile = plane.getPart('aile');
          var aile3DRight = plane.getPart('aile3DRight');
          var aile3DLeft = plane.getPart('aile3DLeft');

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

          //copy wings


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
       if(plane.type === 'biplane1'){
         //srcs
         var f = plane.getPart('fuselage');
         var wtr = plane.getPart('wingtopright');
         var wbr = plane.getPart('wingbottomright');
         var wtl = plane.getPart('wingtopleft');
         var wbl = plane.getPart('wingbottomleft');

         //targets
         var f2l = plane.getPart('f2l');
         f2l.decals = [];
         var f2r = plane.getPart('f2r');
         f2r.decals = [];
         var cl = plane.getPart('cockpitleft');
         cl.decals = [];
         var cr = plane.getPart('cockpitright');
         cr.decals = [];
         var wt = plane.getPart('wingtop');
         wt.decals = [];
         var wb = plane.getPart('wingbottom');
         wb.decals = [];


         var dx = 220; //split cockpit/f2
         //declas copy
          var copy;
           f.decals.forEach((d:Decal)=>{
            if(d.y > 200){
              if(d.x < dx){
                  copy = angular.copy(d);
                  copy.y -=200;
                  cl.decals.push(copy);
               }
               if(d.x >=dx){
                    copy = angular.copy(d);
                    copy.y -=110;
                    f2l.decals.push(copy);
                }
            }
           });

          //texture to f2
          var canvas = document.createElement('canvas');
          var ctx = <CanvasRenderingContext2D> canvas.getContext('2d');
          canvas.width = f2l.width;
          canvas.height = f2l.height;
          ctx.clip(new Path2D(f2l.path), 'nonzero');
          ctx.drawImage(f.textureCanvas, dx, 200, f2l.width-dx, f2l.height, dx, 93, f2l.width-dx, f2l.height);
          f2l.textureBitmap = canvas.toDataURL();

          var canvas = document.createElement('canvas');
          var ctx = <CanvasRenderingContext2D> canvas.getContext('2d');
          canvas.width = f2r.width;
          canvas.height = f2r.height;
          ctx.clip(new Path2D(f2r.path), 'nonzero');
          ctx.scale(1, -1);
          ctx.drawImage(f.textureCanvas, dx, 200, f2l.width-dx, f2l.height, dx, 93, f2l.width-dx, -f2l.height);
          f2r.textureBitmap = canvas.toDataURL();

          //textures to cockpit
          var canvas = document.createElement('canvas');
          var ctx = <CanvasRenderingContext2D> canvas.getContext('2d');
          canvas.width = cl.width;
          canvas.height = cl.height;
          ctx.clip(new Path2D(cl.path), 'nonzero');
          ctx.drawImage(f.textureCanvas, 0, 200, cl.width, cl.height, 0, 0, cl.width, cl.height);
          cl.textureBitmap = canvas.toDataURL();

          var canvas = document.createElement('canvas');
          var ctx = <CanvasRenderingContext2D> canvas.getContext('2d');
          canvas.width = cr.width;
          canvas.height = cr.height;
          ctx.clip(new Path2D(cr.path), 'nonzero');
          ctx.scale(1, -1);
          ctx.drawImage(f.textureCanvas, 0, 200, cr.width, cr.height, 0, 0, cr.width, -cr.height);
          cr.textureBitmap = canvas.toDataURL();

          //copy wings onto wing
          //declas
          var copyWingsToWing = function(l, r, p){
            var canvas = document.createElement('canvas');
            var ctx = <CanvasRenderingContext2D> canvas.getContext('2d');
            canvas.width = p.width;
            canvas.height = p.height;
            r.decals.forEach((d:Decal)=>{
              p.decals.push(angular.copy(d));
            });
            l.decals.forEach((d:Decal)=>{
              var c = angular.copy(d);
              c.y += wtr.height;
              p.decals.push(c);
            });
            ctx.drawImage(r.textureCanvas, 0, 0);
            ctx.drawImage(l.textureCanvas, 0, r.height);
            p.textureBitmap = canvas.toDataURL();
          }
          copyWingsToWing(wtl, wtr, wt);
          copyWingsToWing(wbl, wbr, wb);

       }//fix biplane1

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
        y:-198,
        z:0
      },
      rotation3D:{
        x: 0,
        y: 0,
        z: 0
      },
      position2D:{
          x: 50,
          y: 600
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
          y:-100,
          z:451
        },
        rotation3D:{
          x: -90 * Math.PI/180,
          y: 0,
          z: 0
        },
        textureBottom: true,
        textureFlipY: false
      },
      {
        name: 'wingleft',
        path: 'M 0.18806195,0.2726589 C -1.817538,5.7554989 31.598362,59.852099 31.598362,59.852099 L 265.78706,179.94288 C 265.78706,179.94288 448.64064,337.81317 559.6459,432.74793 575.51244,446.31743 599.31932,447.49817 620.14628,448.95339 640.77708,450.39491 681.72688,441.39083 681.72688,441.39083 L 554.57172,142.49678 582.33354,142.13016 741.14688,266.37196 C 741.14688,266.37196 772.68328,299.14752 807.04936,292.30068 821.11456,289.4984 844.86196,271.77378 844.86196,271.77378 844.86196,271.77378 822.20856,142.84068 819.99416,138.92806 817.70556,134.8842 775.67968,114.40734 775.67968,114.40734 775.67968,114.40734 804.60296,104.51348 806.18016,102.58356 807.75716,100.65364 808.54296,54.844619 806.43016,52.809379 804.31756,50.774139 789.39676,51.112239 789.39676,51.112239 L 807.04936,34.093819 807.04936,0.1000089 Z',
        width: 845,
        height: 449,
        position3D:{
          x:-196,
          y:-100,
          z:2
        },
        rotation3D:{
          x: -90 * Math.PI/180,
          y: 0,
          z: 0
        },
        textureBottom: true,
        textureFlipY: false
      },
      {
        name: 'tailleft',
        path: 'M 293.65805,0.13971626 230.72813,175.88682 212.75777,175.98724 122.09822,176.08708 31.438665,176.18694 C 27.823525,175.84074 0.26934458,175.93034 0.26934458,175.93034 L 203.41035,0.10001626 Z',
        width: 294,
        height: 176,
        position3D:{
          x:360,
          y:-264,
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
            {x: 127, y: 79, angle: 0, size: 30, text: '??-???', locked: 'tailnumber'}
        ]
      },
      {
        name: 'tailright',
        path: 'M 293.65805,176.14723 230.72813,0.40012513 212.75777,0.29970513 122.09822,0.19986513 31.438665,0.10000513 C 27.823525,0.44620513 0.26934458,0.35660513 0.26934458,0.35660513 L 203.41035,176.18693 Z',
        width: 294,
        height: 176,
        position3D:{
          x:360,
          y:-98,
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
            {x: 229, y: 102, angle: 180, size: 30, text: '??-???', locked: 'tailnumber'}
        ]
      },
      {
        name: 'wingrightprint',
        path: 'M 0.18806195,448.93721 C -1.817538,443.45437 31.598362,389.35777 31.598362,389.35777 L 265.78706,269.26699 C 265.78706,269.26699 448.64064,111.3967 559.6459,16.461936 575.51244,2.8924363 599.31932,1.7116963 620.14628,0.2564763 640.77708,-1.1850437 681.72688,7.8190363 681.72688,7.8190363 L 554.57172,306.71309 582.33354,307.07971 741.14688,182.83791 C 741.14688,182.83791 772.68328,150.06235 807.04936,156.90919 821.11456,159.71147 844.86196,177.43609 844.86196,177.43609 844.86196,177.43609 822.20856,306.36919 819.99416,310.28181 817.70556,314.32567 775.67968,334.80253 775.67968,334.80253 775.67968,334.80253 804.60296,344.69639 806.18016,346.62631 807.75716,348.55623 808.54296,394.36525 806.43016,396.40049 804.31756,398.43573 789.39676,398.09763 789.39676,398.09763 L 807.04936,415.11605 807.04936,488.00073 437.30366,496.14331 291.71576,539.35785 C 291.71576,539.35785 141.97436,538.32277 139.05466,536.94697 135.85816,535.44069 112.94926,513.62133 112.94926,513.62133 112.94926,513.62133 2.003062,453.89871 0.18806195,448.93721 Z',
        width: 845,
        height: 540,
        position2D:{
          x: 900,
          y: 80
        }
      },
      {
        name: 'wingleftprint',
        path: 'M 0.18806195,90.520767 C -1.817538,96.003607 31.598362,150.10021 31.598362,150.10021 L 265.78706,270.19099 C 265.78706,270.19099 448.64064,428.06128 559.6459,522.99604 575.51244,536.56554 599.31932,537.74628 620.14628,539.2015 640.77708,540.64302 681.72688,531.63894 681.72688,531.63894 L 554.57172,232.74489 582.33354,232.37827 741.14688,356.62007 C 741.14688,356.62007 772.68328,389.39563 807.04936,382.54879 821.11456,379.74651 844.86196,362.02189 844.86196,362.02189 844.86196,362.02189 822.20856,233.08879 819.99416,229.17617 817.70556,225.13231 775.67968,204.65545 775.67968,204.65545 775.67968,204.65545 804.60296,194.76159 806.18016,192.83167 807.75716,190.90175 808.54296,145.09273 806.43016,143.05749 804.31756,141.02225 789.39676,141.36035 789.39676,141.36035 L 807.04936,124.34193 807.04936,51.457247 437.30366,43.314667 291.71576,0.10012679 C 291.71576,0.10012679 141.97436,1.1352068 139.05466,2.5110068 135.85816,4.0172868 112.94926,25.836647 112.94926,25.836647 112.94926,25.836647 2.003062,85.559267 0.18806195,90.520767 Z',
        width: 845,
        height: 540,
        position2D:{
          x: 960,
          y: 840
        }
      },
      {
        name: 'f2leftprint',
        path: 'M 2.5462462,113.18015 C 12.782986,97.867313 158.86973,62.920773 158.86973,62.920773 L 320.7112,56.796653 434.7891,27.983253 446.5427,0.11045313 781.986,50.595093 863.7364,95.765913 417.5337,98.488053 504.7194,145.73405 246.63,155.21095 C 246.63,155.21095 133.66049,157.66581 79.362826,147.76043 51.240946,142.63021 -13.212414,136.75305 2.5462462,113.18015 Z',
        width: 864,
        height: 156,
        position2D:{
          x: 50,
          y: 900
        }
      },
      {
        name: 'f2rightprint',
        path: 'M 2.5462462,42.401057 C 12.782986,57.713894 158.86973,92.660434 158.86973,92.660434 L 320.7112,98.784554 434.7891,127.59795 446.5427,155.47075 781.986,104.98611 863.7364,59.815294 417.5337,57.093154 504.7194,9.8471572 246.63,0.37025722 C 246.63,0.37025722 133.66049,-2.0846028 79.362826,7.8207772 51.240946,12.950997 -13.212414,18.828157 2.5462462,42.401057 Z',
        width: 864,
        height: 156,
        position2D:{
          x: 50,
          y: 360
        }
      },
      {
        name: 'f3leftprint',
        path: 'M 2.5462462,56.484146 C 12.782986,41.171306 158.86973,6.2247663 158.86973,6.2247663 L 320.71122,0.10064635 373.90282,18.646226 417.53372,41.792046 504.71942,89.038046 246.63001,98.514946 C 246.63001,98.514946 133.66049,100.96981 79.362826,91.064426 51.240946,85.934206 -13.212414,80.057046 2.5462462,56.484146 Z',
        width: 505,
        height: 99,
        position2D:{
          x: 50,
          y: 1200
        }
      },
      {
        name: 'f3rightprint',
        path: 'M 2.5462462,42.401058 C 12.782986,57.713898 158.86973,92.660438 158.86973,92.660438 L 320.71122,98.784558 373.90282,80.238978 417.53372,57.093158 504.71942,9.8471579 246.63001,0.37025792 C 246.63001,0.37025792 133.66049,-2.0846021 79.362826,7.8207779 51.240946,12.950998 -13.212414,18.828158 2.5462462,42.401058 Z',
        width: 505,
        height: 99,
        position2D:{
          x: 50,
          y: 200
        }
      },
      {
        name: 'tailprint',
        path: 'M 203.41007,0.10001784 0.26937296,175.93206 C 0.26937296,175.93206 27.822273,175.83976 31.437373,176.18596 35.052573,176.53236 37.657373,176.21688 37.160073,185.38128 L 37.160073,293.7133 C 37.657373,302.8777 35.052573,302.56222 31.437373,302.90862 27.822273,303.25482 0.26937296,303.16642 0.26937296,303.16642 L 203.41007,478.99456 293.65617,478.9555 230.72647,303.2094 212.75767,303.10784 230.92567,284.143 230.92567,194.9555 212.75767,175.98674 230.72647,175.88908 293.65617,0.13907784 Z',
        width: 294,
        height: 479,
        position2D:{
          x: 1680,
          y: 460
        }
      }
  ];

  static biplane1:Part[] = [{
      name: 'fuselage',
      path: 'M 1211.0516,207.58236 C 1208.7815,210.51692 1205.6665,215.94834 1204.1295,217.5999 1202.5925,219.25148 1198.7375,225.27974 1196.4268,228.18748 1192.9779,231.14724 1190.3993,232.37392 1186.5003,234.69194 1124.0376,246.41718 1077.8796,250.65978 1022.7736,258.45812 965.5768,266.55804 965.19028,266.62508 944.28042,272.0825 871.97446,293.06726 813.58104,306.85408 747.79998,323.92324 731.18224,328.23294 696.12958,337.36088 669.90518,344.20774 L 622.22446,356.65644 C 547.28386,351.40144 478.80766,345.35672 416.95056,350.35676 414.66576,350.68492 400.61306,354.11046 385.71736,357.93644 L 358.63426,364.8928 346.25226,364.8084 C 331.62996,364.7088 316.49746,364.6332 300.16326,364.5783 214.24336,360.83896 114.26916,365.35656 28.202565,328.93058 25.924965,327.93534 22.526665,326.45854 20.650665,325.64848 18.774565,324.83844 15.214365,323.29994 12.739165,322.22964 10.263865,321.15936 7.0710647,319.0279 5.6440647,317.49308 3.3568647,315.03294 2.9142647,313.74776 1.9093647,306.64794 1.2823647,302.21782 0.81306473,295.93942 0.86666473,292.69566 0.92026473,289.45192 0.58746473,283.05 0.43286473,278.31682 -0.37193527,253.68892 0.62766473,249.08056 8.0657647,242.81452 43.960265,230.665 72.974965,222.11316 120.82036,209.39306 121.80886,209.08492 125.69936,207.71208 129.56396,206.78674 133.42866,205.86158 136.95296,204.75728 137.77616,204.51666 139.49616,204.42486 140.13186,205.1273 141.92906,216.77962 143.14686,224.67546 143.78636,230.25164 145.80466,232.32826 147.02746,233.52102 151.04326,232.69474 158.12956,232.16086 164.03066,231.7164 180.76786,230.30004 195.59336,228.57134 210.41876,227.28476 229.72726,225.8314 238.37996,225.11022 256.60136,223.59146 254.22416,223.31366 269.73376,209.8579 274.63946,205.60194 279.51186,201.98876 280.56136,201.82872 299.96616,200.5555 318.38146,200.85602 335.96646,200.60104 353.55146,200.34608 370.30626,199.53558 386.74366,199.92942 419.61856,200.71708 450.87036,202.43292 483.18786,203.59914 514.16362,204.71726 530.1648,205.25064 571.94814,206.55774 579.99808,206.80952 594.35258,206.39234 603.83732,206.72214 613.5764,207.06074 633.9231,206.87694 649.91334,206.66154 665.90354,206.44582 691.4934,206.04964 706.47404,205.7807 761.18996,204.98754 805.39224,204.99986 855.24352,203.6317 865.54798,203.42418 874.63588,201.36818 875.74434,200.89588 879.58676,199.25936 915.62014,159.7492 929.91112,141.50298 930.80186,140.36572 934.08448,136.31984 937.20596,132.51218 944.61262,123.47722 946.99662,120.47978 959.27878,104.76068 968.3975,93.090097 974.67244,85.152477 981.42362,76.747717 984.8634,72.465457 988.45084,68.212257 993.75538,62.127297 996.52112,58.954717 998.95074,56.109137 999.15446,55.803957 1000.3792,53.970157 1018.8393,33.573717 1022.1389,30.408737 1028.5106,24.296997 1039.4621,16.370537 1046.5722,12.724037 1082.7168,-1.7991227 1121.6936,-0.17304272 1158.8659,0.80771728 1159.0371,0.93531728 1159.0465,2.4690973 1158.8839,4.2181373 1158.7217,5.9671773 1158.5748,10.472997 1158.5575,14.231137 1158.5105,24.360177 1158.4203,31.452217 1158.2732,36.579397 1158.2008,39.094057 1158.1676,44.424977 1158.199,48.425937 1158.9906,80.982317 1157.4802,109.60078 1156.7221,139.46392 1156.6549,142.10298 1156.4826,149.5432 1156.3393,155.99776 1156.1031,166.6335 1155.8905,167.83972 1154.0703,168.86908 1152.9656,169.49374 1143.7107,172.09824 1133.5035,174.65676 1123.2964,177.21548 1108.6315,180.89136 1100.9149,182.8255 1066.2822,191.5056 1060.6117,193.47538 1059.012,194.85368 1057.0894,196.51024 1054.6961,201.11962 1056.2655,202.52004 1057.7054,203.80486 1059.8506,203.83018 1079.8347,202.79786 1115.8246,200.93892 1187.1665,197.40548 1195.0413,197.0922 1199.5206,196.914 1206.3281,196.55504 1210.169,196.29486 1214.0098,196.0345 1216.9506,197.26266 1217.0095,197.64902 1217.0685,198.03534 1217.0155,198.96372 1215.8308,200.22274 1214.4421,203.0028 1212.6944,205.43742 1211.0516,207.58236 Z',
      width: 1217,
      height: 365,
      position3D:{
        x:-1217/2,
        y:-198,
        z:0
      },
      rotation3D:{
        x: 0,
        y: 0,
        z: 0
      },
      position2D:{
          x: 300,
          y: 300
      },
      textureTop: true,
      textureBottom: true,
      textureFlipY: false,
      decals:[
          {x: 1000, y: 120, angle: 0, size: 30, text: '??-???', locked: 'tailnumber'}
        ]
    },
    {
      name: 'aileron',
      path: 'M 1.9755419,293.8959 C 3.5050619,297.62126 3.5075819,298.04742 2.0133419,300.63324 0.2151619,303.74504 -0.2616781,308.07176 0.6562419,312.94526 0.9978819,314.75956 1.5539219,318.2896 1.8919619,320.78998 3.2983419,331.19472 3.9265819,335.6912 4.8777819,342.16272 15.936542,410.36286 14.912302,491.51585 35.154302,549.26025 39.540982,559.82325 51.189362,575.24529 58.565402,580.25589 74.070402,590.78789 83.146362,594.18149 98.840442,595.31449 115.63336,596.52629 151.55168,597.39569 158.26384,596.75209 165.95336,596.01449 169.14764,593.39489 172.50646,585.07109 181.44882,527.86065 175.96428,453.54005 179.77392,379.04168 180.30604,369.9041 180.74806,354.7151 180.75528,345.28848 L 180.76928,328.14896 176.659,321.13432 C 174.39824,317.27616 170.74662,311.47064 168.5442,308.233 166.342,304.9952 164.24624,301.40342 163.88728,300.2511 163.19224,298.021 163.53238,297.29364 170.53246,286.0437 172.61318,282.69974 175.88422,277.4224 177.80166,274.3165 L 181.28794,268.66924 181.35714,258.30406 C 181.42374,248.311 181.33434,239.2203 180.91382,213.1924 180.80522,206.4906 180.65054,195.52557 180.56934,188.82565 180.09628,151.34821 179.2082,112.25335 179.38142,76.041633 179.43522,66.374213 179.40962,53.185533 179.32442,46.733233 179.23902,40.280913 179.35702,31.964353 179.58596,28.251813 180.29928,16.616053 176.37422,7.524453 168.5327,2.677757 164.9443,0.459637 163.91984,0.259377 156.05854,0.239117 108.2299,0.115117 102.88616,0.225117 96.342482,1.467677 73.485882,5.807633 52.609082,20.716953 41.484282,40.644993 34.721322,52.759673 33.311862,58.823393 28.388362,96.991853 21.814702,142.18665 16.393802,181.86383 9.6596019,226.13786 8.8752619,231.29694 7.4486419,241.35348 6.4894219,248.48576 4.5102619,263.20162 1.6502019,282.91616 1.1086419,285.576 0.3288619,289.40548 0.3955419,290.04676 1.9761819,293.89588 Z',
      width: 182,
      height: 598,
      position3D:{
        x:448,
        y:4,
        z:-297
      },
      rotation3D:{
        x: 90 * Math.PI/180,
        y: -2 * Math.PI/180,
        z: 0
      },
      position2D:{
          x: 1300,
          y: 780
      },
      textureTop: true,
      textureBottom: false
    },
    {
      name: 'wingtopleft',
      path: 'M 203.30662,0.20002587 0.33403042,0.20002587 C 0.33203042,0.68032587 0.31403042,1.2196259 0.31403042,1.6961259 0.18203042,23.913126 0.13603042,43.091626 0.33403042,49.864126 1.3872304,86.851626 1.5340304,93.071526 3.1464304,167.78993 5.1218304,297.26143 9.8184304,462.16713 11.80263,553.07883 12.23063,572.69753 12.53923,576.48953 13.92383,579.16893 16.09883,583.37773 20.83823,587.93833 24.79883,589.63373 42.97443,593.03333 63.76383,588.40193 79.44723,585.24693 83.07943,584.49173 87.60263,583.77093 101.25203,581.76653 129.69323,577.58973 134.97543,575.99933 140.34183,569.99313 144.28343,565.58133 145.64583,559.99133 147.46683,540.75463 154.50783,488.05093 157.25483,443.99093 160.77543,411.19223 162.93203,391.12413 164.71343,372.86223 164.73243,370.61023 164.75243,368.35393 164.55043,366.95113 163.81443,365.99303 163.07823,365.03493 161.80603,364.52303 159.68943,364.05163 158.52523,363.79233 157.86203,363.29893 157.14263,363.08683 156.82363,362.99283 133.81343,363.41373 133.70903,363.16103 133.60503,362.90823 156.73983,362.72083 156.79883,362.40313 157.03523,361.13263 158.30843,358.45313 161.25203,355.66883 L 166.64643,350.56333 167.68563,341.57113 C 171.44623,309.01603 172.59783,298.13103 178.91203,235.46563 180.25743,222.11183 181.59143,209.56833 181.87303,207.59063 182.15443,205.61303 184.36223,184.36723 186.77922,160.37973 192.11782,107.39653 196.24122,68.865026 199.96682,37.188326 202.50582,15.601126 203.41862,7.5510259 203.30662,0.20002587 Z',
      width: 204,
      height: 591,
      position3D:{
        x:-235,
        y:2,
        z:2
      },
      rotation3D:{
        x: -100 * Math.PI/180,
        y: 0,
        z: 0
      },
      textureTop: false,
      textureBottom: true,
      textureFlipY: false
    },
    {
      name: 'wingtopright',
      path: 'M 30.630826,0.10850938 C 28.296026,0.14950938 26.017426,0.49080938 24.146426,1.1242094 18.742426,2.9539094 13.838426,7.0831094 11.814426,11.507009 9.4380258,16.700809 9.0382258,28.374909 7.4356258,138.82341 4.1822258,172.17151 6.4432258,221.38001 5.5800258,246.58511 5.3328258,253.63701 4.5864258,297.06981 3.9238258,343.10071 3.2614258,389.13171 2.3598258,441.57151 1.9198258,459.63591 1.1248258,492.27931 0.45862578,548.70111 0.20122578,590.82731 L 203.16982,590.82731 C 203.08582,585.44431 202.51622,580.42661 201.31842,570.71791 198.32262,546.43451 192.64742,497.56181 190.80662,480.17101 188.46542,458.05701 187.13742,445.77561 184.17762,418.91321 182.56742,404.29631 179.37022,374.29731 177.07222,352.24921 172.71882,310.48041 172.56382,309.02911 169.17382,277.47571 165.36062,241.98581 165.41482,242.29601 162.83002,239.95231 161.55482,238.79601 159.03623,236.51201 157.23623,234.87421 155.43603,233.23611 153.71603,231.00401 153.41203,229.91711 153.16243,229.02531 154.09443,228.23491 153.55603,228.22181 141.84463,227.93681 126.36823,227.83451 129.85283,227.78821 133.33723,227.74201 155.78503,227.75001 156.63803,227.69441 158.97303,227.54261 160.78402,226.87031 161.38022,225.93661 162.63562,223.97111 161.65382,212.08321 155.80223,158.55771 154.58443,126.81781 148.92843,94.645509 146.66143,72.073309 142.43783,29.824609 141.87403,27.060509 136.44283,21.784309 130.67343,16.179309 128.32583,15.405409 107.56003,12.249109 104.09943,11.723209 99.315826,10.889409 96.931026,10.397609 80.107826,6.8522094 61.970826,4.7950094 47.790426,2.7452094 43.588226,2.1238094 38.936026,1.2886094 37.454426,0.88980938 35.359026,0.32590938 32.969226,0.06760938 30.634226,0.10850938 L 30.634226,0.10850938 Z',
      width: 204,
      height: 591,
      position3D:{
        x:-235,
        y:-100,
        z:590
      },
      rotation3D:{
        x: -80 * Math.PI/180,
        y: 0,
        z: 0
      },
      textureTop: false,
      textureBottom: true,
      textureFlipY: false
    },
    {
      name: 'wingbottomleft',
      path: 'M 203.30662,0.20002587 0.33403042,0.20002587 C 0.33203042,0.68032587 0.31403042,1.2196259 0.31403042,1.6961259 0.18203042,23.913126 0.13603042,43.091626 0.33403042,49.864126 1.3872304,86.851626 1.5340304,93.071526 3.1464304,167.78993 5.1218304,297.26143 9.8184304,462.16713 11.80263,553.07883 12.23063,572.69753 12.53923,576.48953 13.92383,579.16893 16.09883,583.37773 20.83823,587.93833 24.79883,589.63373 42.97443,593.03333 63.76383,588.40193 79.44723,585.24693 83.07943,584.49173 87.60263,583.77093 101.25203,581.76653 129.69323,577.58973 134.97543,575.99933 140.34183,569.99313 144.28343,565.58133 145.64583,559.99133 147.46683,540.75463 154.50783,488.05093 157.25483,443.99093 160.77543,411.19223 162.93203,391.12413 164.71343,372.86223 164.73243,370.61023 164.75243,368.35393 164.55043,366.95113 163.81443,365.99303 163.07823,365.03493 161.80603,364.52303 159.68943,364.05163 158.52523,363.79233 157.86203,363.29893 157.14263,363.08683 156.82363,362.99283 133.81343,363.41373 133.70903,363.16103 133.60503,362.90823 156.73983,362.72083 156.79883,362.40313 157.03523,361.13263 158.30843,358.45313 161.25203,355.66883 L 166.64643,350.56333 167.68563,341.57113 C 171.44623,309.01603 172.59783,298.13103 178.91203,235.46563 180.25743,222.11183 181.59143,209.56833 181.87303,207.59063 182.15443,205.61303 184.36223,184.36723 186.77922,160.37973 192.11782,107.39653 196.24122,68.865026 199.96682,37.188326 202.50582,15.601126 203.41862,7.5510259 203.30662,0.20002587 Z',
      width: 204,
      height: 591,
      position3D:{
        x:-190,
        y:150,
        z:2
      },
      rotation3D:{
        x: -100 * Math.PI/180,
        y: 0,
        z: 0
      },
      textureTop: false,
      textureBottom: true,
      textureFlipY: false
    },
    {
      name: 'wingbottomright',
      path: 'M 30.630826,0.10850938 C 28.296026,0.14950938 26.017426,0.49080938 24.146426,1.1242094 18.742426,2.9539094 13.838426,7.0831094 11.814426,11.507009 9.4380258,16.700809 9.0382258,28.374909 7.4356258,138.82341 4.1822258,172.17151 6.4432258,221.38001 5.5800258,246.58511 5.3328258,253.63701 4.5864258,297.06981 3.9238258,343.10071 3.2614258,389.13171 2.3598258,441.57151 1.9198258,459.63591 1.1248258,492.27931 0.45862578,548.70111 0.20122578,590.82731 L 203.16982,590.82731 C 203.08582,585.44431 202.51622,580.42661 201.31842,570.71791 198.32262,546.43451 192.64742,497.56181 190.80662,480.17101 188.46542,458.05701 187.13742,445.77561 184.17762,418.91321 182.56742,404.29631 179.37022,374.29731 177.07222,352.24921 172.71882,310.48041 172.56382,309.02911 169.17382,277.47571 165.36062,241.98581 165.41482,242.29601 162.83002,239.95231 161.55482,238.79601 159.03623,236.51201 157.23623,234.87421 155.43603,233.23611 153.71603,231.00401 153.41203,229.91711 153.16243,229.02531 154.09443,228.23491 153.55603,228.22181 141.84463,227.93681 126.36823,227.83451 129.85283,227.78821 133.33723,227.74201 155.78503,227.75001 156.63803,227.69441 158.97303,227.54261 160.78402,226.87031 161.38022,225.93661 162.63562,223.97111 161.65382,212.08321 155.80223,158.55771 154.58443,126.81781 148.92843,94.645509 146.66143,72.073309 142.43783,29.824609 141.87403,27.060509 136.44283,21.784309 130.67343,16.179309 128.32583,15.405409 107.56003,12.249109 104.09943,11.723209 99.315826,10.889409 96.931026,10.397609 80.107826,6.8522094 61.970826,4.7950094 47.790426,2.7452094 43.588226,2.1238094 38.936026,1.2886094 37.454426,0.88980938 35.359026,0.32590938 32.969226,0.06760938 30.634226,0.10850938 L 30.634226,0.10850938 Z',
      width: 204,
      height: 591,
      position3D:{
        x:-190,
        y:48,
        z:584
      },
      rotation3D:{
        x: -80 * Math.PI/180,
        y: 0,
        z: 0
      },
      textureTop: false,
      textureBottom: true,
      textureFlipY: false
    },
    {
      name: 'gearleft',
      path: 'M 0.68381786,308.40607 C 3.7983779,295.15184 11.799098,283.56064 22.781478,276.39152 27.368658,273.39708 28.981938,271.82468 28.980238,270.34984 24.693858,255.21328 21.726238,240.14518 18.527618,224.20498 18.868578,223.31646 20.426258,222.9061 23.457998,222.9061 25.081778,222.9061 26.298038,222.8053 27.106018,222.55446 27.509998,222.42906 45.820978,222.92902 46.020778,222.72246 46.220578,222.5159 28.267038,222.28328 28.105398,221.47956 27.987198,220.89126 27.876478,219.90358 27.048218,218.85602 26.219958,217.80846 24.981878,216.51252 23.333198,214.91904 L 17.773538,209.5455 17.160578,197.55078 C 15.123738,173.49608 16.442918,148.6075 17.675618,126.60606 18.635638,104.95816 25.010518,50.660975 27.301738,44.616715 27.946418,42.916055 29.910378,41.503215 34.495318,39.441715 37.964058,37.882095 41.213978,36.606055 41.717338,36.606055 41.843138,36.606055 41.952918,36.574455 42.043558,36.517255 42.134158,36.460055 42.205758,36.377455 42.255218,36.275555 42.304618,36.173555 61.130098,35.789055 61.132418,35.654575 61.134418,35.520175 42.314018,35.636575 42.263238,35.480975 42.154638,35.150315 41.599778,34.757695 40.765658,34.354155 39.931538,33.950615 38.818218,33.536175 37.592878,33.161895 36.367538,32.787615 35.030178,32.453475 33.747958,32.210575 32.465758,31.967675 31.238718,31.816015 30.233998,31.806615 L 27.435438,31.780415 32.664518,24.028535 C 39.287378,14.210375 47.734698,6.0495952 54.457998,2.9742952 69.624978,-5.0010248 89.962018,5.6617552 100.329,16.699975 106.92832,24.004655 115.03708,44.604875 118.52732,62.932655 121.53876,78.746055 122.58256,92.712535 122.57944,117.15126 121.17342,155.99988 121.42768,188.36156 109.96386,224.84916 108.5623,229.13496 104.92746,237.63996 101.88648,243.74916 96.500938,254.56846 96.372258,254.99448 96.929418,260.1621 97.938538,269.52186 101.81752,276.98448 109.52326,284.39102 113.76878,288.47162 121.92466,293.10682 124.85922,293.10682 125.58704,293.10682 126.18254,293.63502 126.18254,294.28062 126.18254,296.43562 121.14592,303.42417 117.62336,306.15677 109.09204,312.77497 109.0351,312.87197 108.13944,322.33897 106.38436,340.88977 98.273138,354.80557 83.405518,364.77277 44.917218,392.56877 -5.2631221,346.38697 0.68381786,308.40587 Z',
      width: 126,
      height: 373,
      position3D:{
        x:-200,
        y:-90,
        z:-355
      },
      rotation3D:{
        x: 0,
        y: 0,
        z: -20 * Math.PI/180
      },
      position2D:{
          x: 940,
          y: 900
      },
      textureTop: false,
      textureBottom: true,
      textureFlipY:false
    },
    {
      name: 'gearright',
      path: 'M 125.69872,308.40607 C 122.58416,295.15184 114.58344,283.56064 103.60106,276.39152 99.013882,273.39708 97.400602,271.82468 97.402302,270.34984 101.68868,255.21328 104.6563,240.14518 107.85492,224.20498 107.51396,223.31646 105.95628,222.9061 102.92454,222.9061 101.30076,222.9061 100.0845,222.8053 99.276522,222.55446 98.872542,222.42906 80.561562,222.92902 80.361762,222.72246 80.161962,222.5159 98.115502,222.28328 98.277142,221.47956 98.395342,220.89126 98.506062,219.90358 99.334322,218.85602 100.16258,217.80846 101.40066,216.51252 103.04934,214.91904 L 108.609,209.5455 109.22196,197.55078 C 111.2588,173.49608 109.93962,148.6075 108.70692,126.60606 107.7469,104.95816 101.37202,50.660975 99.080802,44.616715 98.436122,42.916055 96.472162,41.503215 91.887222,39.441715 88.418482,37.882095 85.168562,36.606055 84.665202,36.606055 84.539402,36.606055 84.429622,36.574455 84.338982,36.517255 84.248382,36.460055 84.176782,36.377455 84.127322,36.275555 84.077922,36.173555 65.252442,35.789055 65.250122,35.654575 65.248122,35.520175 84.068522,35.636575 84.119302,35.480975 84.227902,35.150315 84.782762,34.757695 85.616882,34.354155 86.451002,33.950615 87.564322,33.536175 88.789662,33.161895 90.015002,32.787615 91.352362,32.453475 92.634582,32.210575 93.916782,31.967675 95.143822,31.816015 96.148542,31.806615 L 98.947102,31.780415 93.718022,24.028535 C 87.095162,14.210375 78.647842,6.0495952 71.924542,2.9742952 56.757562,-5.0010248 36.420522,5.6617552 26.05354,16.699975 19.45422,24.004655 11.34546,44.604875 7.85522,62.932655 4.84378,78.746055 3.79998,92.712535 3.8031,117.15126 5.20912,155.99988 4.95486,188.36156 16.41868,224.84916 17.82024,229.13496 21.45508,237.63996 24.49606,243.74916 29.881602,254.56846 30.010282,254.99448 29.453122,260.1621 28.444002,269.52186 24.56502,276.98448 16.85928,284.39102 12.61376,288.47162 4.45788,293.10682 1.52332,293.10682 0.79550001,293.10682 0.20000001,293.63502 0.20000001,294.28062 0.20000001,296.43562 5.23662,303.42417 8.75918,306.15677 17.2905,312.77497 17.34744,312.87197 18.2431,322.33897 19.99818,340.88977 28.109402,354.80557 42.977022,364.77277 81.465322,392.56877 131.64566,346.38697 125.69872,308.40587 Z',
      width: 126,
      height: 373,
      position3D:{
        x:-85,
        y:-135,
        z:362
      },
      rotation3D:{
        x: 0,
        y: -180 * Math.PI/180,
        z: 20 * Math.PI/180
      },
      position2D:{
          x: 1100,
          y: 900
      },
      textureTop: false,
      textureBottom: true,
      textureFlipY:false
    },
    {
      name: 'cockpit',
      path: 'M 217.42182,0.23199251 C 215.68382,0.33199251 209.58842,0.66559251 203.87882,0.97419251 198.16912,1.2826925 191.05532,1.7933925 188.07022,2.1069925 185.08512,2.4203925 179.38562,3.0028925 175.40612,3.4038925 171.42672,3.8050925 164.50442,4.5871925 160.02332,5.1421925 143.61242,7.1655925 117.71152,9.0513925 95.199119,15.544493 58.729019,22.574993 14.392119,38.142993 7.1131187,46.474193 2.8769187,51.322893 1.7381187,54.737993 1.3749187,63.712493 0.44831871,78.900893 -1.1738813,95.308593 2.4530187,112.38049 3.2066187,113.99469 5.1159187,116.71489 6.6952187,118.42729 10.150219,122.17369 13.397519,123.35269 44.988119,132.31409 58.029919,136.01789 79.327519,143.51189 102.40612,149.06409 104.12062,149.54319 110.32712,151.40699 116.19912,153.20859 133.18652,158.42039 134.99482,157.91949 139.74992,159.15389 141.49972,155.10709 140.58212,156.93929 143.60532,141.28669 144.64752,135.89099 145.80492,131.23119 146.17562,130.92729 146.82852,130.39249 160.88222,131.52729 194.41002,134.82189 203.29202,135.69459 215.60692,136.77829 221.78112,137.23199 239.07512,138.50259 250.68632,139.64519 253.70302,140.37659 257.47112,141.29009 277.77142,160.59329 278.75772,164.20079 280.36252,169.22279 280.21062,176.92909 278.84372,180.30229 277.85742,183.90979 257.55712,203.21299 253.78902,204.12659 250.77232,204.85789 239.16112,206.00439 221.86712,207.27499 215.69292,207.72869 203.37412,208.81239 194.49212,209.68509 160.96432,212.97979 146.91452,214.11449 146.26162,213.57969 145.89092,213.27579 144.73352,208.61209 143.69132,203.21639 140.66812,187.56389 141.58572,189.39999 139.83592,185.35309 135.08082,186.58749 133.27252,186.08269 116.28512,191.29449 110.41312,193.09609 104.20662,194.96379 102.49212,195.44299 79.413519,200.99509 58.116019,208.48909 45.074119,212.19299 13.483519,221.15429 10.232319,222.32939 6.7773187,226.07579 5.1980187,227.78819 3.2926187,230.51239 2.5390187,232.12659 -1.0878813,249.19839 0.53431871,265.60609 1.4609187,280.79449 1.8241187,289.76889 2.9590187,293.18019 7.1952187,298.02889 14.474219,306.36009 58.815019,321.93189 95.285119,328.96249 117.79752,335.45549 143.69842,337.33749 160.10932,339.36089 164.59042,339.91589 171.51272,340.69789 175.49212,341.09909 179.47162,341.50009 185.17112,342.08669 188.15622,342.39989 191.14132,342.71349 198.25512,343.22029 203.96482,343.52889 209.67442,343.83729 215.76592,344.17109 217.50382,344.27109 219.24182,344.37109 221.99472,344.23109 223.62102,343.95469 225.24732,343.67849 239.98952,336.00929 256.37882,326.91549 284.71662,311.19229 286.23952,310.21979 287.44922,307.02099 288.14872,305.17099 290.93062,296.87889 293.63282,288.59529 296.33502,280.31179 299.05462,272.21449 299.67572,270.60309 316.62732,253.44119 331.08872,234.44659 345.10932,218.82969 369.69622,191.51619 375.60492,184.75929 376.96482,182.41559 377.66122,181.21549 378.35212,177.53249 378.49992,174.23199 378.62792,171.37619 378.61892,169.78559 378.26562,168.46639 377.99822,165.72409 377.44982,163.07139 376.87882,162.08749 375.51892,159.74379 369.61032,152.99079 345.02342,125.67729 331.00282,110.06039 316.54132,91.061793 299.58982,73.899993 298.96872,72.288593 296.24902,64.195193 293.54682,55.911693 290.84462,47.628093 288.06282,39.335893 287.36322,37.485893 286.15362,34.287193 284.63062,33.310793 256.29292,17.587493 239.90352,8.4937925 225.16142,0.82849251 223.53512,0.55229251 221.90882,0.27629251 219.15982,0.13229251 217.42182,0.23199251 Z',
      width: 378,
      height: 344,
      position2D:{
        x: 50,
        y: 1000
      }
    },
    {
      name: 'cockpitleft',
      path: 'M 0.38220557,63.764878 C 0.99730557,42.308178 9.6175056,43.493078 25.062106,38.024678 40.506806,32.556178 57.275806,27.809378 73.688806,23.239178 79.668106,21.460578 97.361306,16.862278 105.75371,14.502278 124.18301,9.3197775 134.08461,6.5187775 137.24921,5.3317775 137.24921,5.3317775 139.06631,4.7135775 139.46911,5.5001775 140.95151,8.3953775 141.80531,17.505678 141.80531,17.505678 L 144.74951,30.787078 145.93501,33.488378 C 149.64021,33.841278 176.00911,31.418878 202.20315,29.020278 215.30015,27.820978 235.15935,26.539178 245.31419,25.303878 255.46901,24.068578 255.91945,22.879778 257.42249,21.512778 266.05861,13.602278 276.21603,5.2410775 277.95035,3.9332775 279.39049,2.8471775 283.06129,2.4979775 295.90929,2.2248775 309.92245,1.9270775 351.87837,1.1973775 368.14575,0.42857754 377.66523,-0.02132246 379.03109,-0.52412246 373.19175,6.5203775 370.33673,9.9648775 365.57405,15.117578 363.68839,17.430778 350.61831,31.487278 338.22625,46.588978 326.92337,59.246178 324.36479,62.186778 321.07169,66.386478 319.14713,68.425978 316.88727,72.264478 313.03639,75.733278 310.61413,78.441478 301.57115,88.671278 299.26959,90.546078 299.26959,90.546078 299.26959,90.546078 295.39791,101.00638 293.40943,107.09018 291.42093,113.17398 289.13487,119.90028 288.32935,122.03758 287.52385,124.17488 286.39643,127.23088 285.82363,128.82868 285.25103,130.42648 286.05923,129.19978 284.41119,130.38038 281.03417,132.79978 246.02315,153.48018 232.50465,160.02378 223.88995,164.19378 223.44605,164.31408 216.80575,164.28078 159.35941,161.89108 115.56701,156.09078 63.153206,142.05208 41.383506,136.14838 11.513906,124.40248 6.9304056,119.94308 4.0012056,117.09308 1.1819056,111.71428 1.3218056,109.24268 -0.31049443,95.194778 0.29450557,73.214378 0.38220557,63.764778 Z',
      width: 377,
      height: 164,
      position2D:{
        x: 480,
        y: 1200
      }
    },{
      name: 'cockpitright',
      path: 'M 0.38220557,100.71919 C 0.99730557,122.17589 9.6175056,120.99099 25.062106,126.45939 40.506806,131.92789 57.275806,136.67469 73.688806,141.24489 79.668106,143.02349 97.361306,147.62179 105.75371,149.98179 124.18301,155.16429 134.08461,157.96529 137.24921,159.15229 137.24921,159.15229 139.06631,159.77049 139.46911,158.98389 140.95151,156.08869 141.80531,146.97839 141.80531,146.97839 L 144.74951,133.69699 145.93501,130.99569 C 149.64021,130.64279 176.00911,133.06519 202.20315,135.46379 215.30015,136.66309 235.15935,137.94489 245.31419,139.18019 255.46901,140.41549 255.91945,141.60429 257.42249,142.97129 266.05861,150.88179 276.21603,159.24299 277.95035,160.55079 279.39049,161.63689 283.06129,161.98609 295.90929,162.25919 309.92245,162.55699 351.87837,163.28669 368.14575,164.05549 377.66523,164.50539 379.03109,165.00819 373.19175,157.96369 370.33673,154.51919 365.57405,149.36649 363.68839,147.05329 350.61831,132.99679 338.22625,117.89509 326.92337,105.23789 324.36479,102.29729 321.07169,98.097593 319.14713,96.058093 316.88727,92.219593 313.03639,88.750793 310.61413,86.042593 301.57115,75.812793 299.26959,73.937993 299.26959,73.937993 299.26959,73.937993 295.39791,63.477691 293.40943,57.393891 291.42093,51.310091 289.13487,44.583791 288.32935,42.446491 287.52385,40.309191 286.39643,37.253191 285.82363,35.655391 285.25103,34.057591 286.05923,35.284291 284.41119,34.103691 281.03417,31.684291 246.02315,11.003891 232.50465,4.4602913 223.88995,0.29029128 223.44605,0.16999128 216.80575,0.20329128 159.35941,2.5929913 115.56701,8.3932913 63.153206,22.431991 41.383506,28.335691 11.513906,40.081591 6.9304056,44.540991 4.0012056,47.390991 1.1819056,52.769791 1.3218056,55.241391 -0.31049443,69.289293 0.29450557,91.269693 0.38220557,100.71929 Z',
      width: 377,
      height: 164,
      position2D:{
        x: 480,
        y: 1000
      }
    },{
      name: 'f2l',
      path: 'M 1.0407049,173.9573 C 0.77610489,214.57244 -0.77149511,210.21708 18.141005,219.0765 54.790405,235.78038 82.467205,241.3132 123.2442,248.29708 140.0983,251.12516 152.9728,252.74888 175.852,254.93242 210.7261,258.26052 222.2755,257.79052 257.2058,258.03252 283.8062,258.7916 309.1151,259.99312 329.2718,260.07796 L 360.3214,260.22836 374.749,256.04168 C 382.6842,253.73914 391.2055,251.2656 393.6852,250.54534 396.165,249.8249 399.613,248.98294 401.3476,248.67404 403.082,248.36534 404.9082,247.82042 405.4056,247.46326 406.8867,246.39888 415.8235,244.58888 416.4522,245.22578 416.7717,245.54946 416.8534,255.84722 416.6338,268.11006 416.3171,285.79516 416.4872,290.61098 417.4239,291.3977 419.1535,292.8402 436.4612,293.96298 476.1958,295.21052 520.09292,296.65686 559.57312,298.49922 588.89201,300.01832 602.20443,300.71188 609.47431,300.76424 610.59297,300.17972 612.58825,299.1285 613.99463,295.7974 614.78899,290.24086 615.35199,286.30264 616.24655,280.62374 618.18813,268.66254 618.70987,265.44848 619.38421,260.99778 619.68671,258.7721 620.21081,254.91604 622.85187,250.69194 629.27947,243.42928 630.41923,242.14148 632.37293,239.76136 633.62101,238.14006 634.86911,236.51876 636.29997,234.75264 636.80071,234.21568 637.30145,233.67854 639.54071,231.02348 641.77689,228.31538 644.01303,225.6075 646.05431,223.19074 646.31303,222.94482 646.57177,222.6991 647.89843,221.02152 649.26115,219.21696 650.62389,217.4124 652.25473,215.39798 652.88527,214.74048 653.51581,214.08298 655.18503,212.0218 656.59467,210.16034 658.00431,208.2987 659.86717,206.08338 660.73435,205.23722 661.60151,204.39106 664.92409,200.47562 668.11787,196.53634 671.31161,192.59706 674.15771,189.17314 674.44255,188.9274 674.72737,188.68184 677.58431,185.25778 680.79135,181.3186 688.11809,172.31914 689.42803,171.16526 692.90275,170.65048 694.44937,170.42136 708.48029,169.04716 724.08259,167.59678 739.68487,166.14642 771.48659,163.15116 794.75307,160.94072 815.96877,158.63306 843.36999,156.19298 856.46699,155.0739 862.65805,154.54604 871.16839,153.75666 875.37881,153.3197 879.58925,152.88252 891.74685,151.7577 902.39567,150.82008 913.04451,149.88244 927.83603,148.54718 935.26571,147.85278 1012.1661,140.88268 1096.3359,134.89288 1169.8514,127.78686 1192.5529,125.69894 1193.6264,125.55192 1195.7514,124.24414 1197.806,122.9795 1217.7707,94.288381 1217.7818,92.584421 1215.6968,90.875741 1212.8357,89.429361 1210.9356,87.732501 1208.5448,85.578881 1204.7038,82.517601 1202.3999,80.929941 1200.0961,79.342301 1197.6779,77.526901 1197.0261,76.895641 1193.0246,73.020501 1190.8449,72.382881 1183.82,73.032321 1168.151,74.480661 1149.2298,72.766941 1135.1362,68.620221 1119.4016,63.295421 1103.2973,53.056261 1094.7804,38.507021 1088.6327,27.508941 1085.0821,15.373341 1085.1459,5.5771414 1085.1619,3.0074014 1084.8325,0.68940141 1084.4121,0.42566141 1083.024,-0.44459859 1069.6858,1.3985214 1068.4785,2.6274814 1067.3521,3.7741814 1066.6494,9.3077014 1064.2706,35.763381 1062.6995,53.236101 1061.2408,69.293941 1060.8388,73.541821 1060.6281,75.767881 1060.1406,82.563261 1059.7556,88.642281 1057.7798,97.386161 1045.742,97.426421 1024.1834,96.432261 986.33569,96.426261 960.48751,97.292061 936.49387,97.493921 918.17751,97.641321 898.73531,97.916901 893.28895,98.106221 884.36109,98.416661 866.27783,98.699641 811.37887,99.387941 801.47785,99.511341 770.30803,99.943541 742.11263,100.34704 696.10747,100.86574 658.53931,101.68808 632.18271,101.87318 600.50541,102.0882 586.56469,101.88718 585.29097,101.19384 583.43457,100.18472 582.92003,97.643921 581.88445,84.372281 581.65259,81.400721 581.09672,76.256781 580.64922,72.941601 580.20172,69.626201 579.84482,65.491601 579.85612,63.753441 579.88052,59.994921 578.37902,56.296641 576.53572,55.575421 575.80612,55.290061 563.81652,54.591121 549.89212,54.022381 535.96782,53.453641 518.50172,52.719621 511.0787,52.391461 503.6557,52.063281 489.2811,51.564201 479.1353,51.282301 468.9894,51.000381 450.7685,50.305041 438.6445,49.736841 388.5394,47.389101 384.1009,47.319381 382.5453,48.854881 380.832,50.545961 380.3635,53.167961 379.6515,65.054181 378.5965,82.665881 378.4627,90.613321 377.5375,93.008561 376.3718,96.026221 374.8421,94.924661 350.2384,95.413361 329.626,95.630861 316.3021,95.745461 302.9364,96.033381 L 279.5791,96.525001 271.385,103.81036 C 266.8782,107.81748 262.9868,111.3334 262.7375,111.62378 262.488,111.91416 260.4938,113.42 258.3056,114.96996 255.4992,116.95812 253.688,118.3442 251.1347,118.76586 249.2666,119.07438 225.2202,121.13332 197.952,123.4399 162.5783,126.43208 147.9729,128.16344 146.7564,127.5021 144.9284,126.50858 144.5694,123.74968 143.004,116.16292 142.4418,113.4366 142.09,109.64562 141.6497,107.85272 141.3443,105.77288 141.1392,104.33944 140.572,102.30294 140.2301,101.07506 139.7236,99.882621 139.2792,99.604121 138.5792,99.165141 105.2344,108.45206 94.613405,111.62152 70.563205,118.58296 41.480905,127.14588 16.352605,134.78414 -4.2439951,141.0449 0.52140489,153.21444 1.0406049,173.95738 Z',
      width: 1218,
      height: 300,
      position2D:{
        x: 220,
        y: 640
      }
    },
    {
      name: 'f2r',
      path: 'M 1.0407049,126.82434 C 0.77610489,86.209195 -0.77149511,90.564555 18.141005,81.705135 54.790405,65.001255 82.467205,59.468435 123.2442,52.484555 140.0983,49.656475 152.9728,48.032755 175.852,45.849215 210.7261,42.521115 222.2755,42.991115 257.2058,42.749115 283.8062,41.990035 309.1151,40.788515 329.2718,40.703675 L 360.3214,40.553275 374.749,44.739955 C 382.6842,47.042495 391.2055,49.516035 393.6852,50.236295 396.165,50.956735 399.613,51.798695 401.3476,52.107595 403.082,52.416295 404.9082,52.961215 405.4056,53.318375 406.8867,54.382755 415.8235,56.192755 416.4522,55.555855 416.7717,55.232175 416.8534,44.934415 416.6338,32.671575 416.3171,14.986475 416.4872,10.170655 417.4239,9.383935 419.1535,7.941435 436.4612,6.818655 476.1958,5.571115 520.09292,4.124775 559.57312,2.282415 588.89201,0.76331502 602.20443,0.06975502 609.47431,0.01739502 610.59297,0.60191502 612.58825,1.653135 613.99463,4.984235 614.78899,10.540775 615.35199,14.478995 616.24655,20.157895 618.18813,32.119095 618.70987,35.333155 619.38421,39.783855 619.68671,42.009535 620.21081,45.865595 622.85187,50.089695 629.27947,57.352355 630.41923,58.640155 632.37293,61.020275 633.62101,62.641575 634.86911,64.262875 636.29997,66.028995 636.80071,66.565955 637.30145,67.103095 639.54071,69.758155 641.77689,72.466255 644.01303,75.174135 646.05431,77.590895 646.31303,77.836815 646.57177,78.082535 647.89843,79.760115 649.26115,81.564675 650.62389,83.369235 652.25473,85.383655 652.88527,86.041155 653.51581,86.698655 655.18503,88.759835 656.59467,90.621295 658.00431,92.482935 659.86717,94.698255 660.73435,95.544415 661.60151,96.390575 664.92409,100.30602 668.11787,104.2453 671.31161,108.18458 674.15771,111.6085 674.44255,111.85424 674.72737,112.0998 677.58431,115.52386 680.79135,119.46304 688.11809,128.4625 689.42803,129.61638 692.90275,130.13116 694.44937,130.36028 708.48029,131.73448 724.08259,133.18486 739.68487,134.63522 771.48659,137.63048 794.75307,139.84092 815.96877,142.14858 843.36999,144.58866 856.46699,145.70774 862.65805,146.2356 871.16839,147.02498 875.37881,147.46194 879.58925,147.89912 891.74685,149.02394 902.39567,149.96156 913.04451,150.8992 927.83603,152.23446 935.26571,152.92886 1012.1661,159.89896 1096.3359,165.88876 1169.8514,172.99478 1192.5529,175.0827 1193.6264,175.22972 1195.7514,176.5375 1197.806,177.80214 1217.7707,206.49325 1217.7818,208.19721 1215.6968,209.90589 1212.8357,211.35227 1210.9356,213.04913 1208.5448,215.20275 1204.7038,218.26403 1202.3999,219.85169 1200.0961,221.43933 1197.6779,223.25473 1197.0261,223.88599 1193.0246,227.76113 1190.8449,228.39875 1183.82,227.74931 1168.151,226.30097 1149.2298,228.01469 1135.1362,232.16141 1119.4016,237.48621 1103.2973,247.72537 1094.7804,262.27461 1088.6327,273.27269 1085.0821,285.40829 1085.1459,295.20449 1085.1619,297.77423 1084.8325,300.09223 1084.4121,300.35597 1083.024,301.22623 1069.6858,299.38311 1068.4785,298.15415 1067.3521,297.00745 1066.6494,291.47393 1064.2706,265.01825 1062.6995,247.54553 1061.2408,231.48769 1060.8388,227.23981 1060.6281,225.01375 1060.1406,218.21837 1059.7556,212.13935 1057.7798,203.39547 1045.742,203.35521 1024.1834,204.34937 986.33569,204.35537 960.48751,203.48957 936.49387,203.28771 918.17751,203.14031 898.73531,202.86473 893.28895,202.67541 884.36109,202.36497 866.27783,202.08199 811.37887,201.39369 801.47785,201.27029 770.30803,200.83809 742.11263,200.4346 696.10747,199.9159 658.53931,199.09356 632.18271,198.90846 600.50541,198.69344 586.56469,198.89446 585.29097,199.5878 583.43457,200.59692 582.92003,203.13771 581.88445,216.40935 581.65259,219.38091 581.09672,224.52485 580.64922,227.84003 580.20172,231.15543 579.84482,235.29003 579.85612,237.02819 579.88052,240.78671 578.37902,244.48499 576.53572,245.20621 575.80612,245.49157 563.81652,246.19051 549.89212,246.75925 535.96782,247.32799 518.50172,248.06201 511.0787,248.39017 503.6557,248.71835 489.2811,249.21743 479.1353,249.49933 468.9894,249.78125 450.7685,250.47659 438.6445,251.04479 388.5394,253.39253 384.1009,253.46225 382.5453,251.92675 380.832,250.23567 380.3635,247.61367 379.6515,235.72745 378.5965,218.11575 378.4627,210.16831 377.5375,207.77307 376.3718,204.75541 374.8421,205.85697 350.2384,205.36827 329.626,205.15077 316.3021,205.03617 302.9364,204.74825 L 279.5791,204.25663 271.385,196.97128 C 266.8782,192.96416 262.9868,189.44824 262.7375,189.15786 262.488,188.86748 260.4938,187.36164 258.3056,185.81168 255.4992,183.82352 253.688,182.43744 251.1347,182.01578 249.2666,181.70726 225.2202,179.64832 197.952,177.34174 162.5783,174.34956 147.9729,172.6182 146.7564,173.27954 144.9284,174.27306 144.5694,177.03196 143.004,184.61872 142.4418,187.34504 142.09,191.13602 141.6497,192.92892 141.3443,195.00876 141.1392,196.4422 140.572,198.4787 140.2301,199.70658 139.7236,200.89901 139.2792,201.17751 138.5792,201.61649 105.2344,192.32958 94.613405,189.16012 70.563205,182.19868 41.480905,173.63576 16.352605,165.9975 -4.2439951,159.73674 0.52140489,147.5672 1.0406049,126.82426 Z',
      width: 1218,
      height: 300,
      position2D:{
        x: 50,
        y: 150
      }
    },
    {
      name: 'wingtop',
      path: 'M 30.763329,0.20444274 C 28.428529,0.24544274 26.149929,0.58672274 24.278929,1.2200627 18.874929,3.0497627 13.970929,7.1790227 11.946929,11.602883 9.5705292,16.796703 9.1707292,28.470823 7.5681292,138.91927 4.3147292,172.26743 6.5757292,221.47589 5.7125292,246.68099 5.4653292,253.73289 4.7189292,297.16569 4.0563292,343.19659 3.3939292,389.22759 2.4923292,441.66739 2.0523292,459.73179 1.2479292,492.75719 0.56452922,550.18439 0.31412922,592.45839 0.18252922,614.67529 0.13692922,633.85379 0.33012922,640.62629 1.3833292,677.61379 1.5303292,683.83369 3.1427292,758.55209 5.1181292,888.02359 9.8147292,1052.9293 11.798929,1143.8411 12.226929,1163.4597 12.535329,1167.2517 13.919929,1169.9311 16.094929,1174.1399 20.834329,1178.7005 24.794929,1180.3959 42.970529,1183.7955 63.760129,1179.1641 79.443529,1176.0091 83.075729,1175.2539 87.598729,1174.5331 101.24813,1172.5287 129.68932,1168.3519 134.97152,1166.7615 140.33792,1160.7553 144.27952,1156.3435 145.64192,1150.7535 147.46292,1131.5169 154.50392,1078.8131 157.25092,1034.7533 160.77152,1001.9545 162.92812,981.88629 164.70952,963.62439 164.72852,961.37249 164.74852,959.11609 164.54652,957.71329 163.81052,956.75529 163.07432,955.79719 161.80232,955.28529 159.68572,954.81389 158.52152,954.55459 157.85812,954.06119 157.13872,953.84899 156.81972,953.75499 133.80952,954.17589 133.70512,953.92319 133.60112,953.67049 156.73592,953.48299 156.79492,953.16539 157.03132,951.89479 158.30452,949.21539 161.24812,946.43099 L 166.64272,941.32559 167.68172,932.33339 C 171.44252,899.77829 172.59412,888.89319 178.90832,826.22789 180.25372,812.87399 181.58752,800.33049 181.86912,798.35289 182.15052,796.37519 184.35852,775.12939 186.77552,751.14189 192.11412,698.15879 196.23732,659.62729 199.96292,627.95049 204.36632,590.51259 204.28312,593.79919 201.44732,570.81379 198.45152,546.53039 192.77652,497.65769 190.93572,480.26689 188.59452,458.15289 187.26652,445.87149 184.30672,419.00909 182.69632,404.39209 179.49932,374.39319 177.20132,352.34509 172.84792,310.57619 172.69272,309.12489 169.30272,277.57159 165.48952,242.08169 165.54392,242.39179 162.95912,240.04819 161.68392,238.89189 159.16532,236.60789 157.36532,234.97009 155.56512,233.33199 153.84512,231.09989 153.54112,230.01299 153.29152,229.12109 154.22292,228.33079 153.68512,228.31769 141.97372,228.03269 126.49732,227.93039 129.98192,227.88409 133.46632,227.83789 155.91412,227.84589 156.76712,227.79029 159.10212,227.63849 160.91312,226.96619 161.50932,226.03249 162.76472,224.06689 161.78292,212.17903 155.93112,158.65359 154.71332,126.91365 149.05752,94.741423 146.79052,72.169223 142.56692,29.920503 142.00292,27.156363 136.57172,21.880163 130.80232,16.275223 128.45472,15.501243 107.68893,12.345003 104.22833,11.819043 99.444729,10.985303 97.059929,10.493443 80.236729,6.9480427 62.099729,4.8908427 47.919329,2.8411027 43.717129,2.2197227 39.065129,1.3844827 37.583529,0.98564274 35.488129,0.42178274 33.098129,0.16344274 30.763129,0.20438274 Z',
      width: 204,
      height: 1182,
      position2D:{
        x: 1740,
        y: 180
      }
    },
    {
      name: 'wingbottom',
      path: 'M 30.763329,0.20444274 C 28.428529,0.24544274 26.149929,0.58672274 24.278929,1.2200627 18.874929,3.0497627 13.970929,7.1790227 11.946929,11.602883 9.5705292,16.796703 9.1707292,28.470823 7.5681292,138.91927 4.3147292,172.26743 6.5757292,221.47589 5.7125292,246.68099 5.4653292,253.73289 4.7189292,297.16569 4.0563292,343.19659 3.3939292,389.22759 2.4923292,441.66739 2.0523292,459.73179 1.2479292,492.75719 0.56452922,550.18439 0.31412922,592.45839 0.18252922,614.67529 0.13692922,633.85379 0.33012922,640.62629 1.3833292,677.61379 1.5303292,683.83369 3.1427292,758.55209 5.1181292,888.02359 9.8147292,1052.9293 11.798929,1143.8411 12.226929,1163.4597 12.535329,1167.2517 13.919929,1169.9311 16.094929,1174.1399 20.834329,1178.7005 24.794929,1180.3959 42.970529,1183.7955 63.760129,1179.1641 79.443529,1176.0091 83.075729,1175.2539 87.598729,1174.5331 101.24813,1172.5287 129.68932,1168.3519 134.97152,1166.7615 140.33792,1160.7553 144.27952,1156.3435 145.64192,1150.7535 147.46292,1131.5169 154.50392,1078.8131 157.25092,1034.7533 160.77152,1001.9545 162.92812,981.88629 164.70952,963.62439 164.72852,961.37249 164.74852,959.11609 164.54652,957.71329 163.81052,956.75529 163.07432,955.79719 161.80232,955.28529 159.68572,954.81389 158.52152,954.55459 157.85812,954.06119 157.13872,953.84899 156.81972,953.75499 133.80952,954.17589 133.70512,953.92319 133.60112,953.67049 156.73592,953.48299 156.79492,953.16539 157.03132,951.89479 158.30452,949.21539 161.24812,946.43099 L 166.64272,941.32559 167.68172,932.33339 C 171.44252,899.77829 172.59412,888.89319 178.90832,826.22789 180.25372,812.87399 181.58752,800.33049 181.86912,798.35289 182.15052,796.37519 184.35852,775.12939 186.77552,751.14189 192.11412,698.15879 196.23732,659.62729 199.96292,627.95049 204.36632,590.51259 204.28312,593.79919 201.44732,570.81379 198.45152,546.53039 192.77652,497.65769 190.93572,480.26689 188.59452,458.15289 187.26652,445.87149 184.30672,419.00909 182.69632,404.39209 179.49932,374.39319 177.20132,352.34509 172.84792,310.57619 172.69272,309.12489 169.30272,277.57159 165.48952,242.08169 165.54392,242.39179 162.95912,240.04819 161.68392,238.89189 159.16532,236.60789 157.36532,234.97009 155.56512,233.33199 153.84512,231.09989 153.54112,230.01299 153.29152,229.12109 154.22292,228.33079 153.68512,228.31769 141.97372,228.03269 126.49732,227.93039 129.98192,227.88409 133.46632,227.83789 155.91412,227.84589 156.76712,227.79029 159.10212,227.63849 160.91312,226.96619 161.50932,226.03249 162.76472,224.06689 161.78292,212.17903 155.93112,158.65359 154.71332,126.91365 149.05752,94.741423 146.79052,72.169223 142.56692,29.920503 142.00292,27.156363 136.57172,21.880163 130.80232,16.275223 128.45472,15.501243 107.68893,12.345003 104.22833,11.819043 99.444729,10.985303 97.059929,10.493443 80.236729,6.9480427 62.099729,4.8908427 47.919329,2.8411027 43.717129,2.2197227 39.065129,1.3844827 37.583529,0.98564274 35.488129,0.42178274 33.098129,0.16344274 30.763129,0.20438274 Z',
      width: 204,
      height: 1182,
      position2D:{
        x: 1520,
        y: 180
      }
    },{
      name: 'angle',
      path: 'M 28.842542,490.80021 C 44.248942,490.84641 46.417942,490.23681 47.681042,485.50645 55.530642,446.82175 61.899342,407.37105 68.610542,368.33555 71.364842,352.66913 75.781042,327.00073 78.424342,311.29469 81.067742,295.58863 83.558542,282.04853 83.959642,281.20559 84.543842,279.97763 84.217642,279.64361 82.318142,279.52529 62.915242,275.25017 65.500742,236.59189 69.556642,223.72407 71.843242,217.44559 75.262842,213.53509 79.763942,212.05143 82.086542,211.28583 83.406742,210.28753 83.471442,209.24773 83.526842,208.35961 82.352542,200.72209 80.861942,192.27541 79.371442,183.82875 77.609942,173.63781 76.947442,169.62889 76.285042,165.61995 74.690842,156.59339 73.404742,149.56985 71.195242,137.50317 68.468942,121.79651 62.282942,85.495647 62.245442,73.150527 58.228342,61.005267 56.468742,50.576687 51.641542,21.595587 48.254342,3.6614469 47.378342,2.4460869 46.627342,1.4041269 43.003442,1.0641869 27.967842,0.62538691 17.799942,0.32864691 8.4626422,0.14446691 7.2183422,0.21614691 5.9739422,0.28774691 4.1967422,0.35094691 3.2690422,0.35654691 1.4284422,0.36654691 1.3579422,1.7071869 1.5125422,33.726767 1.1285422,61.034407 1.1465422,81.595367 1.0014422,98.620487 0.81174224,119.03687 0.75264224,133.94929 0.74964224,162.17777 0.74764224,180.00893 0.78644224,230.11851 0.81024224,240.63327 0.81924224,244.60151 0.76024224,255.35113 0.67904224,264.52133 0.38474224,334.00691 -0.13435776,374.16389 0.50464224,434.03833 0.60974224,443.71609 0.67644224,459.14007 0.65294224,468.31385 0.62944224,477.48763 0.72434224,486.37643 0.86364224,488.06675 L 1.1171422,491.14007 8.0528422,490.94947 C 11.867442,490.84467 21.222442,490.77747 28.841742,490.80027 Z',
      width: 84,
      height: 491,
      position2D:{
        x: 50,
        y: 400
      }
    }];

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
      if(!id){
        id = '??-???';
      }
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
      this.updateBumpTextures();

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
        this.setId(obj._id);
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
