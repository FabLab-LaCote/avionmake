/// <reference path="../app.ts" />

'use strict';

module avionmakeApp {
  export interface IAboutScope extends ng.IScope {
    plane: Plane;
  }

  declare function PDFDocument(args:any):void;
  declare function blobStream():void;

  export class AboutCtrl {

    constructor (private $scope: IAboutScope, planes:Planes) {
      $scope.plane = planes.plane1;
      setTimeout(()=>{
      var doc = new PDFDocument({size:'A4', layout:'landscape'});
      var stream = doc.pipe(blobStream());
      doc.info.title = 'demo';
      doc.info.author = 'test';
      
      // cutout page
                 
      // draw SVG plane
      doc.scale(0.42)
         .lineWidth(1)
         .stroke('red');
      
      planes.plane1.forEach((part:Part) => {
        if(part.hasOwnProperty('position2D')){
          doc.translate(part.position2D.x, part.position2D.y);
          doc.path(part.path);
          doc.stroke();
          doc.translate(-part.position2D.x, -part.position2D.y);
        }
      });
      
      

      //TODO
      // draw symbols
      
      // draw fonts
         
      doc.font('Helvetica', 32)
         .stroke('red')
         .lineWidth(1)
         .text('more texte', 60, 200, {
           stroke: true,
           fill: false
         });    
      
      //print page
      //doc.addPage();
      
      doc.font('Helvetica', 62)
         .stroke('black')
         .text('AVION:MAKE', 25, 25, {
         });    
         
      doc.image(avionmakeApp.fablab_logo,1650,0);
      
      //CUSTOM FIX textures
      //copy cockpit
      var p = planes.getPart(planes.plane1, 'fuselage');
      
      var c = planes.getPart(planes.plane1, 'cockpit');
      var canvas:HTMLCanvasElement = document.createElement('canvas');
      var ctx = <CanvasRenderingContext2D> canvas.getContext('2d');
      canvas.width = c.width;
      canvas.height = c.height;
      var img = new Image();
      img.src = p.textureBitmap;
      var wy = 172;
      var ww = 370;
      ctx.drawImage(img, 0, wy, ww, p.height-wy, 0, 120, ww, p.height-wy);
      ctx.scale(1, -1);
      ctx.drawImage(img, 0, wy, ww, p.height-wy, 0, -0, ww, -(p.height-wy));
      c.textureBitmap = canvas.toDataURL();
      
      //copy left
      var c = planes.getPart(planes.plane1, 'left_side');
      var canvas:HTMLCanvasElement = document.createElement('canvas');
      var ctx = <CanvasRenderingContext2D> canvas.getContext('2d');
      canvas.width = c.width;
      canvas.height = c.height;
      ctx.drawImage(img, 0, wy, p.width, p.height-wy, 0, 110, p.width, p.height-wy);
      
      c.textureBitmap = canvas.toDataURL();
      
      //copy right
      var c = planes.getPart(planes.plane1, 'right_side');
      var canvas:HTMLCanvasElement = document.createElement('canvas');
      var ctx = <CanvasRenderingContext2D> canvas.getContext('2d');
      canvas.width = c.width;
      canvas.height = c.height;
      ctx.scale(-1, 1);
      ctx.drawImage(img, 0, wy, p.width, p.height-wy, 0, 110, -p.width, p.height-wy);
      c.textureBitmap = canvas.toDataURL();
           
      planes.plane1.forEach((part:Part) => {
        if(part.hasOwnProperty('position2D') && part.hasOwnProperty('textureBitmap')){
          doc.image(part.textureBitmap, part.position2D.x, part.position2D.y);
        }
      });
      
      // end and display the document in the iframe to the right
      doc.end();
      stream.on('finish', function() {
        (<HTMLIFrameElement>document.getElementById('pdf')).src = stream.toBlobURL('application/pdf');
      });
      }, 500);
    }
  }
}

angular.module('avionmakeApp')
  .controller('AboutCtrl', avionmakeApp.AboutCtrl);
