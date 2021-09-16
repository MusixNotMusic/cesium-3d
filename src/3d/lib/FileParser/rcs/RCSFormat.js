import { getDataFromBuffer } from '../Common/readBufferUtil';
import PhraseProductHead from '../Common/PhraseProductHead';
import * as THREE from 'three';

export class RCSFormat {
    Headers = {};
    FileHeaders = {};
    FileHeadSize = 1266;
    HeadSize = 28;
    DecodeData = [];

    readFileHeader (bytes) {
      let fileHead = new PhraseProductHead();
      fileHead.phrase(bytes);
      this.FileHeaders = fileHead;
    }

    readRCSHeader (bytes) {
      var bytePos = 0;
      var height = getDataFromBuffer(bytes.buffer, 'Int32', bytePos, 1);
      bytePos = bytePos + 4; 
      var width = getDataFromBuffer(bytes.buffer, 'Int32', bytePos, 1);
      bytePos = bytePos + 4; 
      var sDis = getDataFromBuffer(bytes.buffer, 'Float32', bytePos, 1);
      bytePos = bytePos + 4; 
      var sAzi  = getDataFromBuffer(bytes.buffer, 'Float32', bytePos, 1);
      bytePos = bytePos + 4; 
      var eDis = getDataFromBuffer(bytes.buffer, 'Float32', bytePos, 1);
      bytePos = bytePos + 4; 
      var eAzi = getDataFromBuffer(bytes.buffer, 'Float32', bytePos, 1);
      bytePos = bytePos + 4; 
      var ele    = getDataFromBuffer(bytes.buffer, 'Float32', bytePos, 1);
      bytePos = bytePos + 4; 

      this.Headers = {
          height,
          width,
          sDis,
          sAzi,
          eDis,
          eAzi,
          ele
      }
  }

  toImageCanvas (canvasWidth, canvasHeight, colorCard) {
      let canvas = document.createElement('canvas');
      let width = this.Headers.width;
      let height = this.Headers.height;
      // let delta = (this.Headers.eDis - this.Headers.sDis) / width;
      let delta = 1;
      canvas.width = canvasWidth || width;
      canvas.height = canvasHeight || height;
      let ctx = canvas.getContext('2d');
      let start = Date.now();
      ctx.beginPath();
      for (let h = 0; h < height; h++) {
        for (let w = 0; w < width; w++) {
          let val = this.DecodeData[h * width + w];
          let color = val !== 0 ? colorCard[val] : '#ffffff';
          this.drawRect(ctx, w, h, delta, 1, color);
        }
      }
      console.log('toImageCanves speed time ==>', Date.now() - start);
      return canvas;
  }


  toImageCanvas2 (canvasWidth, canvasHeight, colorCard) {
    let canvas = document.createElement('canvas');
    let width = this.Headers.width;
    let height = this.Headers.height;
    // let delta = (this.Headers.eDis - this.Headers.sDis) / width;
    canvas.width = canvasWidth || width;
    canvas.height = canvasHeight || height;
    let ctx = canvas.getContext('2d');
    let start = Date.now();

    let imageData = ctx.createImageData(width, height);
    let colors = new THREE.Color();
    for (let i = 0; i < imageData.data.length; i += 4) {
        let val = this.DecodeData[i / 4] | 0;
        let hexColor = MeteoInstance.colorCard ? MeteoInstance.colorCard[val] : 0xffffff;
        let color = colors.setHex(hexColor);
        imageData.data[i]     = val !== 0 ? color.r * 255 | 0 : 255;  // red
        imageData.data[i + 1] = val !== 0 ? color.g * 255 | 0 : 255;  // green
        imageData.data[i + 2] = val !== 0 ? color.b * 255 | 0 : 255;  // blue
        imageData.data[i + 3] = val === 0 ? 200 : 255;
    }
    ctx.putImageData(imageData, 0, 0);
    console.log('toImageCanves speed time ==>', Date.now() - start);
    return canvas;
}


  drawRect (ctx, x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
    ctx.fill();
  }

}
var rcsFormat = new RCSFormat();
RCSFormat.Load = (bufferData) => {
  return new Promise((resolve, rejcet) => {

      let dataPos = 0;
      // file head
      rcsFormat.readFileHeader(bufferData.slice(dataPos, (dataPos = dataPos + rcsFormat.FileHeadSize)));
      // rcs head
      rcsFormat.readRCSHeader(bufferData.slice(dataPos, (dataPos = dataPos + rcsFormat.HeadSize)));
      // data
      rcsFormat.DecodeData = bufferData.slice(dataPos);
      resolve(rcsFormat);
  })
}