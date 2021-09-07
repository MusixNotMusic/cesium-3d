import { getDataFromBuffer } from '../Common/readBufferUtil';
import PhraseProductHead from '../Common/PhraseProductHead';
import * as THREE from 'three';

export class MaxFormat {
    Headers = {};
    FileHeaders = {};
    FileHeadSize = 1266;
    HeadSize = 28;
    DecodeData = [];
    DataTop = [];
    DataNS = [];
    DataWE = [];


    readFileHeader (bytes) {
        let fileHead = new PhraseProductHead();
        fileHead.phrase(bytes);
        this.FileHeaders = fileHead;
    }
    /**
     * 
     * 
     *  struct _MAXHeader { 
     *      float fLenOfWin;         // MAX窗口大小
     *      float H;                 // N-S、W-E的起始高度
     *      float fThreshold;        // 阈值
     *      int  iCellNum;           // TOP图中窗口数
     *      int iNSwinnumv;         // N_S图垂直方向上的窗口数
     *      float flongitude;       // 起始窗口的经度
     *      float flatitude;        // 起始窗口的纬度
     *  };
     * 
     * @param {*} bytes 
     */
    readMaxHeader (bytes) {
        var bytePos = 0;
        var fLenOfWin = getDataFromBuffer(bytes.buffer, 'Float32', bytePos, 1);
        bytePos = bytePos + 4; 
        var H = getDataFromBuffer(bytes.buffer, 'Float32', bytePos, 1);
        bytePos = bytePos + 4; 
        var fThreshold = getDataFromBuffer(bytes.buffer, 'Float32', bytePos, 1);
        bytePos = bytePos + 4; 
        var iCellNum  = getDataFromBuffer(bytes.buffer, 'Uint32', bytePos, 1);
        bytePos = bytePos + 4; 
        var iNSwinnumv = getDataFromBuffer(bytes.buffer, 'Uint32', bytePos, 1);
        bytePos = bytePos + 4; 
        var flongitude = getDataFromBuffer(bytes.buffer, 'Float32', bytePos, 1);
        bytePos = bytePos + 4; 
        var flatitude    = getDataFromBuffer(bytes.buffer, 'Float32', bytePos, 1);
        bytePos = bytePos + 4; 

        this.Headers = {
            fLenOfWin,
            H,
            fThreshold,
            iCellNum,
            iNSwinnumv,
            flongitude,
            flatitude
        }
    }

    readTopData (bytes) {
        this.DataTop = bytes;
    }

    readNSData (bytes) {
        this.DataNS = bytes;
    }

    readWEData (bytes) {
        this.DataWE= bytes;
    }

    toImageData (data, width, height) {
        let canvas = document.createElement('canvas');
        let colors = new THREE.Color();
        canvas.width = width;
        canvas.height = height;
        let ctx = canvas.getContext('2d');
        let imageData = ctx.createImageData(width, height);
        data.forEach((val, i) => {
            let hexColor = MeteoInstance.colorCard ? MeteoInstance.colorCard[val] : 0xffffff;
            let color = colors.setHex(hexColor);

            imageData.data[i * 4]     = color.r;  // red
            imageData.data[i * 4 + 1] = color.g;  // green
            imageData.data[i * 4 + 2] = color.b;  // blue
            imageData.data[i * 4 + 3] = 255;
        });
        return imageData;
    }

    toImageCanvas (data, width, height) {
        let canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        let ctx = canvas.getContext('2d');
        let imageData = this.toImageData(data, width, height);
        ctx.putImageData(imageData, 0, 0);
        return canvas;
    }
}

MaxFormat.Load = (bufferData) => {
    return new Promise((resolve, rejcet) => {
        var maxFormat = new MaxFormat();

        var start = Date.now()

        let dataPos = 0;
        // file head
        maxFormat.readFileHeader(bufferData.slice(dataPos, (dataPos = dataPos + maxFormat.FileHeadSize)));
        // max head
        maxFormat.readMaxHeader(bufferData.slice(dataPos, (dataPos = dataPos + maxFormat.HeadSize)));

        let topWidth = maxFormat.Headers.iCellNum / maxFormat.Headers.fLenOfWin;
        let NSHeight = maxFormat.Headers.iNSwinnumv / maxFormat.Headers.fLenOfWin;
        maxFormat.widthPixel = topWidth;
        maxFormat.heightPixel = NSHeight;
        // top
        maxFormat.readTopData(bufferData.slice(dataPos, (dataPos = dataPos + topWidth * topWidth)));
        // n_s
        maxFormat.readNSData(bufferData.slice(dataPos, (dataPos = dataPos + topWidth * NSHeight)));
        // w_e
        maxFormat.readWEData(bufferData.slice(dataPos, (dataPos = dataPos + topWidth * NSHeight)));

        console.log(Date.now() - start + ' ms', maxFormat);
        resolve(maxFormat);
    })
}