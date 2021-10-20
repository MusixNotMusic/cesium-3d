import * as Cesium from 'cesium';
import * as THREE from 'three';
import { getDataFromBuffer } from '../Common/readBufferUtil';
import { bufferToGB2312  } from '../util';
import { 
    subractLocationFunc
} from '@/3d/lib/mathCesium';

export class RTDPZFormat {
    RTDPZHeaders = {};
    FileHeadSize = 1266;
    RTDPZHeadSize = 694;
    StationHeadSize = 96;
    DecodeData = [];
    StationHeaders = [];
    offsetMapVerticesIndex = {};
    centerLon = -1;
    centerLat = -1;

    /**
     * 
     * @param {*} bytes 
     * @return 
     *  unsigned int Ver;			//!< 版本号   **								【4】
     *  unsigned int HeadLen;		//头大小，包含文件头、产品头、各站点信息(即数据开始偏移)		【4】
     *  unsigned short RadarsCount;	//站点个数										【2】
     *  SYSTEMTIME StartTime;		//年月日时分秒（参与拼图数据的开始时刻）		【16】
     *  SYSTEMTIME EndTime;			//年月日时分秒（参与拼图数据的结束时刻）		【16】
        //边界经纬度，必须采用经纬线为直线的地图
     *  long int LeftLongitude;		//左边界经度，即最小经度， 单位取1／360000度	【4】
        long int RightLongitude;	//右边界经度，即最大经度， 单位取1／360000度	【4】
        long int BottomLatitude;	//下边界纬度，即最小纬度， 单位取1／360000度	【4】
        long int TopLatitude;		//上边界纬度，即最大纬度， 单位取1／360000度	【4】

        unsigned int iHeight;		//高度上的切割间隔值，单位米	【4】
        unsigned int LenofWin;		//拼图窗口大小，1/1000度			【4】
        unsigned int RealCutNum;	//纵向上实际切割层数			【4】
        unsigned int WidthofWin;	//拼图区域x方向的网格数		【4】
        unsigned int HeightofWin;	//拼图区域y方向的网格数		【4】
        unsigned int LayerPos[150];    //每一层的相对于文件起始位置的偏移

        unsigned char ProjectionMode;//拼图所采用的投影方式（网格大小的单位）		【1】
        char Reserve[15];      //!< 保留 【15】
     */
    readRTDPZHeader (bytes) {
        var bytePos = 0;
        var Ver = getDataFromBuffer(bytes.buffer, 'Uint32', bytePos, 1);
        bytePos = bytePos + 4; 
        var HeadLen = getDataFromBuffer(bytes.buffer, 'Uint32', bytePos, 1);
        bytePos = bytePos + 4; 
        var RadarsCount = getDataFromBuffer(bytes.buffer, 'Uint16', bytePos, 1);
        bytePos = bytePos + 2; 
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

        var iHeight     = getDataFromBuffer(bytes.buffer, 'Uint32', bytePos, 1);
        bytePos = bytePos + 4; 
        var LenofWin    = getDataFromBuffer(bytes.buffer, 'Uint32', bytePos, 1);
        bytePos = bytePos + 4; 
        var RealCutNum  = getDataFromBuffer(bytes.buffer, 'Uint32', bytePos, 1);
        bytePos = bytePos + 4;
        var WidthofWin  = getDataFromBuffer(bytes.buffer, 'Uint32', bytePos, 1);
        bytePos = bytePos + 4; 
        var HeightofWin = getDataFromBuffer(bytes.buffer, 'Uint32', bytePos, 1);
        bytePos = bytePos + 4; 

        var LayerPos    = new Uint32Array(bytes.slice(bytePos, bytePos + 4 * 150).buffer);
        bytePos = bytePos + 4 * 150;

        var ProjectionMode = getDataFromBuffer(bytes.buffer, 'Uint8', bytePos, 1);
        bytePos = bytePos + 1; 

        var Reserve = new Uint8Array(bytes.slice(bytePos, bytePos + 15).buffer);
        bytePos + 15;

        this.RTDPZHeaders = {
            Ver,
            HeadLen,
            RadarsCount,
            StartTime,
            EndTime,
            LeftLongitude,
            RightLongitude,
            BottomLatitude,
            TopLatitude,
            iHeight,
            LenofWin,
            RealCutNum,
            WidthofWin,
            HeightofWin,
            ProjectionMode,
            LayerPos,
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
     * 起始层 数据
     * @param {*} bytes 
     * @returns 
     */
    readLayerHead (bytes) {
        var bytePos = 0;
        var LayerSize  = getDataFromBuffer(bytes.buffer, 'Uint32', bytePos, 1);
        bytePos = bytePos + 4;
        var Reserve = new Uint8Array(bytes.slice(bytePos, bytePos + 64).buffer);
        bytePos = bytePos + 64;
        return {
            LayerSize,
            Reserve
        }
    }
    /**
     * 每一层里面每一列数据标识
     * 数据集
     * 
     * @param {*} bytes 
     * @returns cols
     * 
     * colHead1 colHead2 colHead3
     * colData  colData  colData
     */
    readLayerColHeadAndData (bytes) {
        var cols = []
        var bytePos = 0;
        var widthSize = this.RTDPZHeaders.WidthofWin;
        while (widthSize--) {
            var ColPos    = getDataFromBuffer(bytes.buffer, 'Uint32', bytePos, 1);
            bytePos = bytePos + 4;
            var StartPos  = getDataFromBuffer(bytes.buffer, 'Uint16', bytePos, 1);
            bytePos = bytePos + 2;
            var EndPos    = getDataFromBuffer(bytes.buffer, 'Uint16', bytePos, 1);
            bytePos = bytePos + 2;
            
            // if (StartPos < EndPos) {
            //     console.log('StartPos < EndPos',ColPos, StartPos, EndPos);
            // }

            var colHead = {
                ColPos,
                StartPos,
                EndPos
            };
            cols.push({
                colHead
            })
        }

        var widthSize = this.RTDPZHeaders.WidthofWin;
        var i = 0;
        while (i < widthSize) {
            var col = cols[i];
            var StartPos = col.colHead.StartPos;
            var EndPos   = col.colHead.EndPos;
            var ColPos   = col.colHead.ColPos;
            var diff = EndPos - StartPos + 1;
            if (StartPos < EndPos) {
                col.data = new Uint8Array(bytes.slice(bytePos, bytePos + diff).buffer);
                bytePos = bytePos + diff;
                console.log('StartPos < EndPos', ColPos, StartPos, EndPos);
                // if (ColPos > 1e5) {
                //     console.log('ColPos > 1e5', ColPos, StartPos, EndPos);
                // }
            }
            i++;
        }
        
        return cols;
    }

    /**
     * 每一层里面每一列数据标识数据集
     * 
     *      -------------  1
     *     -------------   2
     *    -------------    3
     *   -------------     4
     *  -------------      5
     * -------------       n
     * 
     * @param {*} bytes 
     * @returns cols
     
     */

    readLayerData (bytes) {
        let layers = [];
        let bytePos = 0;
        let layerHeadLength = 68;
        while (bytePos < bytes.length) {
            let layerHead = this.readLayerHead(bytes.slice(bytePos, (bytePos += layerHeadLength)));
            let subBytes = bytes.slice(bytePos, (bytePos += layerHead.LayerSize));
            let layer = this.readLayerColHeadAndData(subBytes);
            layers.push(layer);
        }
        this.DecodeData = layers;
        return layers;
    }


    /**
     * 二次加工获取 格点 空间(x, y, z) val值点数据
     */
     computeGridSpaceData () {
        let LeftLongitude = this.RTDPZHeaders.LeftLongitude;
        let RightLongitude = this.RTDPZHeaders.RightLongitude;
        let TopLatitude = this.RTDPZHeaders.TopLatitude;
        let BottomLatitude = this.RTDPZHeaders.BottomLatitude;

        let widthSize = this.RTDPZHeaders.WidthofWin;
        let HeightSize = this.RTDPZHeaders.HeightofWin;
        let HighSize= this.DecodeData.length;


        let unitWidth = (RightLongitude - LeftLongitude) / widthSize;
        let unitHeight = (TopLatitude - BottomLatitude) / HeightSize;
        let unitHigh = this.RTDPZHeaders.iHeight;

        let centerLon = (RightLongitude + LeftLongitude) / 2; 
        let centerLat = (TopLatitude + BottomLatitude) / 2;
        let center = this.geography2XYZ(centerLon / 360000, centerLat / 360000, 0);

        let subractLocation = subractLocationFunc(center);
    
        let vertices = [];
        let colors = [];
        // 色卡
        const colorCard = MeteoInstance.colorCard;
        let color = new THREE.Color();
        
        for (let z = 0; z < HighSize; z++) {
            for (let x = 0; x < widthSize; x++) {
                let colArr = this.DecodeData[z][x];
                if (colArr && colArr.data) {
                    let m = 0;
                    let index = colArr.colHead.StartPos;
                    let end   = colArr.colHead.EndPos;
                    for (; index <= end; index++, m++) {
                        let val = colArr.data[m];
                        if (!this.invalidValue(val)) {

                            let start =  this.geography2XYZ(
                                (LeftLongitude + x * unitWidth) / 360000, 
                                (TopLatitude - index * unitHeight) / 360000 , 
                                z * unitHigh);

                            // let pos =  this.translateByCenter(
                            //     (LeftLongitude + x * unitWidth) / 360000, 
                            //     // (LeftLongitude) / 360000, 
                            //     (TopLatitude - index * unitHeight) / 360000,
                            //     // TopLatitude / 360000,
                            //     z * unitHigh,
                            //     center.x,
                            //     center.y,
                            //     center.z);
                            let pos = subractLocation(start);
                            // pos.z = z * unitHigh;
                            vertices.push(pos.x, pos.y, pos.z);
                            color.setHex(colorCard[val | 0]);
                            colors.push(color.r, color.g, color.b);
                        }
                    }
                }
            }
        }
        return {
            vertices,
            colors
        }
    }

    /**
     * 经度 纬度 索引隐射 原数据
     * @param {*} lonIndex 经度索引
     * @param {*} latIndex 维度索引
     */
    gridIndexMapData (lonIndex, latIndex, bytes) {
        let offset = latIndex * this.RTDPZHeaders.WidthofWin + lonIndex
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
        let offset = 80;
        if (val < offset) {
            return 0;
        }
        if (val >= offset){
            return 3.8 ** Math.log2(val - offset);
        }
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

    computeCenterLatLon () {
        let LeftLongitude = this.RTDPZHeaders.LeftLongitude;
        let RightLongitude = this.RTDPZHeaders.RightLongitude;
        let TopLatitude = this.RTDPZHeaders.TopLatitude;
        let BottomLatitude = this.RTDPZHeaders.BottomLatitude;

        this.centerLon = (RightLongitude + LeftLongitude) / 360000 / 2; 
        this.centerLat = (TopLatitude + BottomLatitude) / 360000 / 2;
    }

}

RTDPZFormat.Load = (bufferData) => {
    return new Promise((resolve, rejcet) => {
        var data = new RTDPZFormat();
        let stationOffset = data.FileHeadSize + data.RTDPZHeadSize;
        data.readRTDPZHeader(bufferData.slice(data.FileHeadSize, stationOffset));
        data.readStationHeaders(bufferData.slice(stationOffset, stationOffset + data.StationHeadSize * data.RTDPZHeaders.RadarsCount));
        // window._data = data;
        data.readLayerData(bufferData.slice(data.RTDPZHeaders.HeadLen));
        data.computeCenterLatLon();
        resolve(data);
    })
}