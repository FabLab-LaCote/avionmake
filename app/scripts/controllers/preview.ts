/// <reference path="../app.ts" />

'use strict';

module avionmakeApp {
  export interface IAboutScope extends ng.IScope {
    showPDF: boolean;
    planesService:Planes;
  }

  declare function PDFDocument(args:any):void;
  declare function blobStream():void;

  export class PreviewCtrl {
    /*@ngInject*/
    constructor (private $scope: IAboutScope, planes:Planes) {
      $scope.planesService = planes;
      var createPDF = ()=>{
        $scope.showPDF = false;
        var plane:Plane = planes.currentPlane;
        if(plane.printState >= PrintState.PRINT){
          $scope.showPDF = true;
          //TODO: what if pdf missing?
          return;
        }
        plane.printState = PrintState.NONE; 
        
        if(plane){
          //CUSTOM FIX textures
          if(plane.type === 'plane1'){
            var p = plane.getPart('fuselage');
            var c = plane.getPart('cockpit');
            var l = plane.getPart('left_side');
            var r = plane.getPart('right_side');
            
            //copy decals
            var wy = 172;
            var ww = 370;
            l.decals = [];
            r.decals = [];
            c.decals = [];
            p.decals.forEach((d:Decal) =>{
              if(d.y > wy){
                if(d.x < ww){
                  var c1 = angular.copy(d);
                  c1.y = c1.y-52;
                  c.decals.push(c1);
                }
                var dl = angular.copy(d);
                dl.y = dl.y-60;
                l.decals.push(dl);
              }
            });
         
            //copy textures
            var canvas:HTMLCanvasElement = document.createElement('canvas');
            var ctx = <CanvasRenderingContext2D> canvas.getContext('2d');
            canvas.width = c.width;
            canvas.height = c.height;
            var img = new Image();
            img.src = p.textureBitmap;
            ctx.drawImage(img, 0, wy, ww, p.height-wy, 0, 120, ww, p.height-wy);
            ctx.scale(1, -1);
            ctx.drawImage(img, 0, wy, ww, p.height-wy, 0, -0, ww, -(p.height-wy));
            c.textureBitmap = canvas.toDataURL();
            
            //copy left
            
            var canvas:HTMLCanvasElement = document.createElement('canvas');
            var ctx = <CanvasRenderingContext2D> canvas.getContext('2d');
            canvas.width = l.width;
            canvas.height = l.height;
            ctx.drawImage(img, 0, wy, p.width, p.height-wy, 0, 110, p.width, p.height-wy);
            
            l.textureBitmap = canvas.toDataURL();
            
            //copy right
            var canvas:HTMLCanvasElement = document.createElement('canvas');
            var ctx = <CanvasRenderingContext2D> canvas.getContext('2d');
            canvas.width = r.width;
            canvas.height = r.height;
            ctx.scale(-1, 1);
            ctx.drawImage(img, 0, wy, p.width, p.height-wy, 0, 110, -p.width, p.height-wy);
            r.textureBitmap = canvas.toDataURL();
          }
  
          //create PDF
          var doc = new PDFDocument({size:'A4', layout:'landscape'});
          var stream = doc.pipe(blobStream());
          doc.info.title = 'AVION:MAKE';
          doc.info.author = '';
          
          var scale = 0.42;
        
          // draw SVG plane
          doc.scale(scale);
        
        
          //first page print version
          doc.font('Helvetica', 62)
           .stroke('black')
           .text('AVION:MAKE', 25, 25, {
           });    
           
          doc.image(avionmakeApp.fablab_logo,1650,0);
          
               
          plane.parts.forEach((part:Part) => {
            if(part.hasOwnProperty('position2D') && part.hasOwnProperty('textureBitmap')){
              doc.image(part.textureBitmap, part.position2D.x, part.position2D.y);
            }
          });
  
        //cut out page
        if(!planes.mergePDF){
          doc.addPage();
          doc.scale(scale);
        }
         
         doc.lineWidth(1)
         .stroke('red');
        
        
        //svg + decals
        
        plane.parts.forEach((part:Part) => {
          if(part.hasOwnProperty('position2D')){
            doc.translate(part.position2D.x, part.position2D.y);
            doc.path(part.path);
            doc.stroke();
            //TODO
            //draw decals
            if(part.hasOwnProperty('decals')){
              part.decals.forEach((d:Decal)=>{              
                // draw text
                if(d.text){
                  doc.rotate(d.angle,{origin:[d.x,d.y]});
                  doc.font('Helvetica', d.size)
                     .stroke('red')
                     .lineWidth(1)
                     .text(d.text, d.x, d.y, {
                       stroke: true,
                       fill: false,
                       lineBreak:false
                     });   
                 doc.rotate(-d.angle,{origin:[d.x,d.y]});
                }   
                //draw symbols
              });
            }
            doc.translate(-part.position2D.x, -part.position2D.y);
          }
        });
        // end and display the document in the iframe to the right
        doc.end();
        stream.on('finish', function() {
          if(window.navigator.msSaveOrOpenBlob){
            window.navigator.msSaveOrOpenBlob(stream.toBlob(),'avion.pdf');
          }else{
            (<HTMLIFrameElement>document.getElementById('pdf')).src = stream.toBlobURL('application/pdf');
            $scope.$apply(()=>{
              $scope.showPDF = true;
            });
          }
          $scope.$apply(()=>{
            plane.printState = 1;
          });
        });
        
        }
      }; //createPDF
      $scope.$watch('planesService.mergePDF',()=>{
        createPDF();
      });
    }
  }
}

angular.module('avionmakeApp')
  .controller('PreviewCtrl', avionmakeApp.PreviewCtrl);
