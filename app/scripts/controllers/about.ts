/// <reference path="../app.ts" />

'use strict';

module avionmakeApp {
  export interface IAboutScope extends ng.IScope {
    awesomeThings: any[];
  }

  declare function PDFDocument(args:any):void;
  declare function blobStream():void;

  export class AboutCtrl {

    constructor (private $scope: IAboutScope, planes:Planes) {
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
      
      

      
      // draw symbols
      
      // draw fonts
         
      doc.font('Times-Roman', 32)
         .stroke('red')
         .lineWidth(1)
         .text('more texte', 60, 200, {
           stroke: true,
           fill: false
         });    
      
      //print page
      
      ///doc.addPage();
      //doc.image(canvas1.toDataURL());
      
      // end and display the document in the iframe to the right
      doc.end();
      stream.on('finish', function() {
        (<HTMLIFrameElement>document.getElementById('pdf')).src = stream.toBlobURL('application/pdf');
      });
    }
  }
}

angular.module('avionmakeApp')
  .controller('AboutCtrl', avionmakeApp.AboutCtrl);
