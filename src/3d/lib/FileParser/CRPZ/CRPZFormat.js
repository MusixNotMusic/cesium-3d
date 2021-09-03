// import { CRPZHeader }  from './CRPZHeader'
import * as Cesium from 'cesium';
import { getDataFromBuffer } from '../readBufferUtil';
import { bufferToGB2312  } from '../util';

export class CRPZFormat {
    CRHeaders = {};
    FileHeadSize = 1266;
    CRHeadSize = 86;
    StationHeadSize = 96;
    DecodeData = [];
    StationHeaders = [];
    offsetMapVerticesIndex = {};
    centerLon = -1;
    centerLat = -1;

    readCRHeader (bytes) {
        var bytePos = 0;
        var Ver = getDataFromBuffer(bytes.buffer, 'Uint32', bytePos, 1);
        bytePos = bytePos + 4; 
        var HeadLen = getDataFromBuffer(bytes.buffer, 'Uint32', bytePos, 1);
        bytePos = bytePos + 4; 
        var RadarsCount = getDataFromBuffer(bytes.buffer, 'Uint16', bytePos, 1);
        bytePos = bytePos + 2; 
        // this.StartTime = new Uint32Array(bytes.buffer, bytePos, bytePos + 4);
        var StartTime = new Uint32Array(bytes.slice(bytePos, bytePos + 16).buffer);
        bytePos = bytePos + 16;
        var EndTime = new Uint32Array(bytes.slice(bytePos, bytePos + 16).buffer);
        bytePos = bytePos + 16;

        var LeftLongitude  = getDataFromBuffer(bytes.buffer, 'Uint32', bytePos, 1);
        bytePos = bytePos + 4; 
        var RightLongitude = getDataFromBuffer(bytes.buffer, 'Uint32', bytePos, 1);
        bytePos = bytePos + 4; 
        var BottomLatitude = getDataFromBuffer(bytes.buffer, 'Uint32', bytePos, 1);
        bytePos = bytePos + 4; 
        var TopLatitude    = getDataFromBuffer(bytes.buffer, 'Uint32', bytePos, 1);
        bytePos = bytePos + 4; 

        var LenofWin    = getDataFromBuffer(bytes.buffer, 'Uint32', bytePos, 1);
        bytePos = bytePos + 4; 
        var WidthofWin  = getDataFromBuffer(bytes.buffer, 'Uint32', bytePos, 1);
        bytePos = bytePos + 4; 
        var HeightofWin = getDataFromBuffer(bytes.buffer, 'Uint32', bytePos, 1);
        bytePos = bytePos + 4; 

        var ProjectionMode = getDataFromBuffer(bytes.buffer, 'Uint8', bytePos, 1);
        bytePos = bytePos + 1; 

        var Reserve = new Uint8Array(bytes.slice(bytePos, bytePos + 15).buffer);
        bytePos + 15;

        this.CRHeaders = {
            Ver,
            HeadLen,
            RadarsCount,
            StartTime,
            EndTime,
            LeftLongitude,
            RightLongitude,
            BottomLatitude,
            TopLatitude,
            LenofWin,
            WidthofWin,
            HeightofWin,
            ProjectionMode,
            Reserve
        }
    }

    /**
     * 台站信息
     * @param {*} bytes 
     */
    pzRadarInfoParser (bytes) {
        let bytePos = 0;
        let Station = getDataFromBuffer(bytes.buffer, 'Uint8', bytePos, 20, 'array');
        bytePos += 20;
        let StationNo = getDataFromBuffer(bytes.buffer, 'Uint8', bytePos, 20, 'array');
        bytePos += 20;
        let RadarType = getDataFromBuffer(bytes.buffer, 'Uint8', bytePos, 20, 'array');
        bytePos += 20;
        let LongitudeV = getDataFromBuffer(bytes.buffer, 'Uint32', bytePos, 1);

        bytePos += 4;
        let LatitudeV = getDataFromBuffer(bytes.buffer, 'Uint32', bytePos, 1);
        bytePos += 4;
        let Height = getDataFromBuffer(bytes.buffer, 'Uint32', bytePos, 1);
        bytePos += 4;

        let DataTime = new Uint32Array(bytes.slice(bytePos, bytePos + 16).buffer);
        bytePos = bytePos + 16;

        let Reserve = new Uint8Array(bytes.slice(bytePos, bytePos + 8).buffer);
        bytePos + 8;

        return {
            Station:    bufferToGB2312(Station),
            StationNo:  bufferToGB2312(StationNo),
            RadarType:  bufferToGB2312(RadarType),
            LongitudeV: LongitudeV / 360000,
            LatitudeV:  LatitudeV / 360000,
            Height,
            DataTime,
            Reserve
        }
    }

    /**
     * 读取 站点数据
     * @param {*} bytes 
     */
    readStationHeaders (bytes) {
        let len = bytes.length / this.StationHeadSize;
        for(let i = 0; i < len; i ++) {
            let start = i * this.StationHeadSize;
            let end = (i + 1) * this.StationHeadSize;
            let stationHead = this.pzRadarInfoParser(bytes.slice(start, end));
            this.StationHeaders.push(stationHead);
        }
    }
    /**
     * 读取网格数据点
     * @param {*} bytes 
     */
    readGridAbsoluteData (bytes) {

        let LeftLongitude = this.CRHeaders.LeftLongitude;
        let RightLongitude = this.CRHeaders.RightLongitude;
        let TopLatitude = this.CRHeaders.TopLatitude;
        let BottomLatitude = this.CRHeaders.BottomLatitude;

        let widthSize = this.CRHeaders.WidthofWin;
        let HeightSize = this.CRHeaders.HeightofWin;
        
        let unitWidth = (RightLongitude - LeftLongitude) / widthSize;
        let unitHeight = (TopLatitude - BottomLatitude) / widthSize;

        this.centerLon = (RightLongitude + LeftLongitude) / 360000 / 2; 
        this.centerLat = (TopLatitude + BottomLatitude) / 360000 / 2; 

        this.offsetMapVerticesIndex = {};

        for (let hIndex = 0; hIndex < HeightSize; hIndex++) {
            for (let wIndex = 0; wIndex < widthSize; wIndex++) {
                let { value, offset } = this.gridIndexMapData(wIndex, hIndex, bytes);
                if (!this.invalidValue(value)) {
                    let lon = LeftLongitude + unitWidth * wIndex;
                    let lat = BottomLatitude + unitHeight * hIndex;
                    this.DecodeData.push(lon, lat, value);
                    this.offsetMapVerticesIndex[offset] = this.DecodeData.length / 3 - 1;
                }
            }
        }
    }


    /**
     * 读取网格偏移量数据点
     * 1、格点数据绝对位置 所有的格点对应绝对的经纬度(lon, lat)
     *    __________
     *   /         /
     *  /         /
     * /_________/
     * 
     * 2、计算相对的位置 偏移量的中心点 
     *  Center Point:
     *  centerLon = (LeftLongitude + (RightLongitude - LeftLongitude) / 2)
     *  centerLat = (BottomLatitude + (TopLatitude - BottomLatitude) / 2)
     *  O________________________________ x
     *  |  __________
     *  | |          |
     *  | |    .     |
     *  | |_____\____|
     *  |        \
     *  |         \  (translate)
     *  |         _\________
     *  |        |  \       |
     *  |        |   \.     |
     *  |        |__________|
     *  y
     *  translate (LeftLongitude, BottomLatitude)
     *  relative coordinate to absolute coordinate
     * 
     * @param {*} bytes 
     */
     readGridRelateData (bytes) {
        let LeftLongitude = this.CRHeaders.LeftLongitude;
        let RightLongitude = this.CRHeaders.RightLongitude;
        let TopLatitude = this.CRHeaders.TopLatitude;
        let BottomLatitude = this.CRHeaders.BottomLatitude;

        let widthSize = this.CRHeaders.WidthofWin;
        let HeightSize = this.CRHeaders.HeightofWin;

        let unitWidth = (RightLongitude - LeftLongitude) / widthSize;
        let unitHeight = (TopLatitude - BottomLatitude) / HeightSize;

        this.centerLon = (RightLongitude + LeftLongitude) / 360000 / 2; 
        this.centerLat = (TopLatitude + BottomLatitude) / 360000 / 2; 

        this.offsetMapVerticesIndex = {};

        for (let hIndex = 0; hIndex < HeightSize; hIndex++) {
            for (let wIndex = 0; wIndex < widthSize; wIndex++) {
                let { value, offset } = this.gridIndexMapData(wIndex, hIndex, bytes);
                if (!this.invalidValue(value)) {
                    let lon = unitWidth * wIndex;
                    let lat = unitHeight * hIndex;
                    this.DecodeData.push(lon, lat, value);
                    this.offsetMapVerticesIndex[offset] = this.DecodeData.length / 3 - 1;
                }
            }
        }
    }

    /**
     * 经度 纬度 索引隐射 原数据
     * @param {*} lonIndex 经度索引
     * @param {*} latIndex 维度索引
     */
    gridIndexMapData (lonIndex, latIndex, bytes) {
        let offset = latIndex * this.CRHeaders.WidthofWin + lonIndex
        return {
            offset,
            value: bytes[offset]
        }
    }


    invalidValue (val) {
        return val < 2 || val > 255 
    }

    linearHight (val) {
        // return val ** 2;
        return 4 ** Math.log2(val);
    }

    /**
     * 地理坐标转 空间坐标
     * (lon, lat, hei) -> (x, y, z)
     */
    geography2XYZ (lon, lat, height) {
        return Cesium.Cartesian3.fromDegrees(lon, lat, height || 0);
    }

    /**
     * 
     * @param {*} lon 
     * @param {*} lat 
     * @param {*} height 
     * @param {*} centerX 
     * @param {*} centerY 
     */
    translateByCenter (lon, lat, height, centerX, centerY, centerZ) {
       let coord = this.geography2XYZ(lon, lat, height)
       return {
           x: coord.x - centerX,
           y: coord.y - centerY,
           z: coord.z - centerZ,
       }
    }

}

CRPZFormat.Load = (bufferData) => {
    return new Promise((resolve, rejcet) => {
        var data = new CRPZFormat();
        var start = Date.now()
        // console.log('bufferData ==>', bufferData);
        let stationOffset = data.FileHeadSize + data.CRHeadSize;
        data.readCRHeader(bufferData.slice(data.FileHeadSize, stationOffset));
        data.readStationHeaders(bufferData.slice(stationOffset, stationOffset + data.StationHeadSize * 3));
        // data.readGridAbsoluteData(bufferData.slice(data.CRHeaders.HeadLen));
        data.readGridRelateData(bufferData.slice(data.CRHeaders.HeadLen));
        console.log(Date.now() - start + ' ms', data);
        resolve(data);
    })
}