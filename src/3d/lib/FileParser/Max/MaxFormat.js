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
            centerLon: flongitude / 360000,
            centerLat: flatitude / 360000
        }
    }

    readTopData (bytes) {
        console.log('readTopData bytes ===>', bytes);
        this.DataTop = new Float32Array(bytes.buffer);
    }

    readNSData (bytes) {
        this.DataNS = new Float32Array(bytes.buffer);
    }

    readWEData (bytes) {
        this.DataWE = new Float32Array(bytes.buffer);
    }

    toImageData (data, width, height, inverseX) {
        let canvas = document.createElement('canvas');
        let colors = new THREE.Color();
        canvas.width = width;
        canvas.height = height;
        let ctx = canvas.getContext('2d');
        let imageData = ctx.createImageData(width, height);
        let len = data.length;
        for (let i = 0; i < len; i ++) {
            let maxVal = data[i] | 0;
            let hexColor = MeteoInstance.colorCard ? MeteoInstance.colorCard[maxVal] : 0xffffff;
            let color = colors.setHex(hexColor);
            let offset;
            if (inverseX) {
                offset = this.inverseX(width, height, i) * 4;
            } else {
                offset = i * 4; 
            }
            imageData.data[offset]     = color.r * 255 | 0;  // red
            imageData.data[offset + 1] = color.g * 255 | 0;  // green
            imageData.data[offset + 2] = color.b * 255 | 0;  // blue
            imageData.data[offset + 3] = maxVal === 0 ? 0 : 255;
            // imageData.data[offset + 3] =  255;
        }
        return imageData;
    }

    toImageCanvas (data, width, height, inverseX) {
        let canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        let ctx = canvas.getContext('2d');
        let imageData = this.toImageData(data, width, height,  inverseX);
        console.log('imageData ==>', imageData);
        ctx.putImageData(imageData, 0, 0);
        this.drawGrid(ctx, width, height);
        return canvas;
    }


    drawGrid(ctx, width, height) {
        let len = 5;
        let distanceH = height / len;
        for (let i = 0; i <= len; i ++) {
            let dist = i * distanceH;
            if (i == 0) {
                dist += 1;
            } else if (i == len - 1) {
                dist += -1;
            }
            ctx.beginPath();
            ctx.moveTo(0, dist);
            ctx.lineTo(width, dist);
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 0.01;
            ctx.stroke();
        }

        len = 9;
        let distanceW = width / len;
        for (let i = 0; i <= len; i ++) {
            let dist = i * distanceW;
            if (i == 0) {
                dist += 1;
            } else if (i == len - 1) {
                dist += -1;
            }
            ctx.beginPath();
            ctx.moveTo(dist, 0);
            ctx.lineTo(dist, height);
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 0.01;
            ctx.stroke();
        }
    }

    /**
     * 
     * @param {*} data 
     * @param {*} width 
     * @param {*} height 
     * @param {*} clockwise 顺时针
     * @returns 
     */
    toRotationImageData (data, width, height, clockwise) {
        let canvas = document.createElement('canvas');
        let colors = new THREE.Color();
        canvas.width = width;
        canvas.height = height;
        let ctx = canvas.getContext('2d');
        let imageData = ctx.createImageData(width, height);
        let len = data.length;
        for (let i = 0; i < len; i ++) {
            let rotationIndex;
            if (clockwise) {
                rotationIndex = this.clockWiseRotation(height, width, i);
            } else {
                rotationIndex = this.aniclockWiseRotation(height, width, i);
            }
            let maxVal = data[rotationIndex] | 0;
            let hexColor = MeteoInstance.colorCard ? MeteoInstance.colorCard[maxVal] : 0xffffff;
            let color = colors.setHex(hexColor);
            let offset = i * 4;
            imageData.data[offset]     = color.r * 255 | 0;  // red
            imageData.data[offset + 1] = color.g * 255 | 0;  // green
            imageData.data[offset + 2] = color.b * 255 | 0;  // blue
            imageData.data[offset + 3] = maxVal === 0 ? 0 : 255;
            // imageData.data[offset + 3] =  255;
        }
        return imageData;
    }


    toRotationImageCanvas (data, width, height, clockWise) {
        let canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        let ctx = canvas.getContext('2d');
        let imageData = this.toRotationImageData(data, width, height, clockWise);
        ctx.putImageData(imageData, 0, 0);
        this.drawGrid(ctx, width, height);
        return canvas;
    }

    /**
     *  0   1   2   3
     *  4   5   6   7  
     *  8   9  10  11
     *    
     * 
     *  3   7  11
     *  2   6  10
     *  1   5   9
     *  0   4   8
     * 
     * 索引变换
     * @param {*} index 
     * @param {*} width 
     * @param {*} height 
     * @returns 
     */
    aniclockWiseRotation (width, height, index) {
        let mod = index % height;
        let mult = index / height | 0;
        return mod * width + (width - mult - 1);
    }

    /**
     *  0   1   2   3
     *  4   5   6   7  
     *  8   9  10  11
     *    
     * 
     *  8   4   0
     *  9   5   1
     *  10  6   2
     *  11  7   3
     * 
     * 索引变换
     * 顺时针
     * @param {*} index 
     * @param {*} width 
     * @param {*} height 
     * @returns 
     */
     clockWiseRotation (width, height, index) {
        let mod = index % height;
        let mult = index / height | 0;
        return (height - mod - 1) * width + mult;
    }

    /**
     *   0   1   2   3   4   5   6   7   8   9
     *  10  11  12  13  14  15  16  17  18  19
     *  20  21  22  23  24  25  26  27  28  29
     *   .   .   .   .   .   .   .   .   .   .
     * 
     *  transform
     *   .   .   .   .   .   .   .   .   .   .
     *  20  21  22  23  24  25  26  27  28  29
     *  10  11  12  13  14  15  16  17  18  19
     *   0   1   2   3   4   5   6   7   8   9
     * 
     * x轴翻转
     * @param {*} width 
     * @param {*} height 
     * @param {*} index 
     */
    inverseX (width, height, index) {
        let mod = index % width;
        let mult = index / width | 0;
        return (height - mult - 1) * width + mod;
    }


    /**
     *   0   1   2   3   4  |  5   6   7   8   9
     *  10  11  12  13  14  | 15  16  17  18  19
     *  20  21  22  23  24  | 25  26  27  28  29
     *   .   .   .   .   .  |  .   .   .   .   .
     * 
     *  transform
     * 
     *   9   8   7   6   5  |  4   3   2   1   0
     *  19  18  17  16  15  | 14  13  12  11  10
     *  29  28  27  26  25  | 24  23  22  21  20
     *   .   .   .   .   .  |  .   .   .   .   .
     * y轴翻转
     * @param {*} width 
     * @param {*} height 
     * @param {*} index 
     */
     inverseY (width, height, index) {
        let mod = index % width;
        let rest = index - mod;
        return rest + (height - mod - 1);
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
        maxFormat.widthPixel = maxFormat.Headers.iCellNum;
        maxFormat.heightPixel = maxFormat.Headers.iNSwinnumv;
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