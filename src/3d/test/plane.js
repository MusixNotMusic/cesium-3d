import * as Cesium from 'cesium';
import * as THREE from 'three';
import { 
    getInterPointASegmentIntersectionCircle,
    computeIntersectionSegmentCirclePolar
} from '@/3d/lib/math';

export class MouseMoveWall {
    constructor (data) {
        this.radarNf = data;
        this.positions = []; 
        this.viewer = MeteoInstance.cesium.viewer;
        this.scene = this.viewer.scene;
        // this.handler = new Cesium.ScreenSpaceEventHandler(this.scene.canvas);
        this.startPicker = false;
        this.endPicker = false;
        this.poly = undefined;
        this.initMouseEventHandler();
    }

    initMouseEventHandler () {
        let viewer = this.viewer;
        let scene = this.scene;
        if (this.handler) {
            this.handler.destroy();
        }
        let handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
        this.handler = handler;
        // var positions = [new Cesium.Cartesian3(0, 0, 0), new Cesium.Cartesian3(1, 1, 1)];
        var poly = undefined;
        var wallPoly = (function() {
            function _(positions) {
                this.options = {
                    id:"crossanalysis",
                    type: "crossanalysis",
                    wall: {
                        positions: [],
                        material: Cesium.Color.BLACK.withAlpha(0.8),
                        fill: true,
                        outline: true,
                        outlineColor: Cesium.Color.RED,
                        minimumHeights: [0, 0],
                        maximumHeights: [20 * 1000, 20 * 1000]
                    }
                };
                this.positions = positions;
                this._init();
            }
            _.prototype._init = function () {
                var _self = this;
                var _update = function () {
                    var dp=[];
                    for (var i = 0; i < _self.positions.length; i++) {
                        var ellipsoid = viewer.scene.globe.ellipsoid;
                        var positions = _self.positions;
                        var cartesian3 = new Cesium.Cartesian3(positions[i].x, positions[i].y, positions[i].z);
                        var cartographic = ellipsoid.cartesianToCartographic(cartesian3);
                        var lat = Cesium.Math.toDegrees(cartographic.latitude);
                        var lng = Cesium.Math.toDegrees(cartographic.longitude);
                        var alt = cartographic.height;
                        dp.push(lng); dp.push(lat); dp.push(200);
                    }
                    return Cesium.Cartesian3.fromDegreesArrayHeights(dp);//_self.positions;
                };
                this.options.wall.positions = new Cesium.CallbackProperty(_update, false);
                viewer.entities.add(this.options);
            };
            return _;
        })();
    
        handler.setInputAction((movement) => {
            var cartesian = scene.camera.pickEllipsoid(movement.position, scene.globe.ellipsoid);
            cartesian.z += 1000;
            if (this.startPicker && this.endPicker) {
                this.startPicker = false;
                this.endPicker = false;
            }
            if (!this.startPicker) {
                this.positions[0] = cartesian;
                this.startPicker = true;
            } else {
                this.positions[1] = cartesian;
                this.computeClipLineDot();
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    
        handler.setInputAction((movement) => {
            var cartesian = scene.camera.pickEllipsoid(movement.endPosition, scene.globe.ellipsoid);
            cartesian.z += 1000;
            if (this.positions.length >=1) {
                if (!Cesium.defined(poly)) {
                    poly = new wallPoly(this.positions);
                } else {
                    // positions.pop();
                    // positions.push(cartesian);
                    if (!this.endPicker) {
                        this.positions[1] = cartesian;
                        this.computeClipLineDot();
                    }
                }
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    
        handler.setInputAction((movement) => {
            // handler.destroy();
            if (this.startPicker) {
                this.endPicker = true;
            }
            var polyli = viewer.entities.getById(poly.options.id);
            console.log(polyli, this.positions);
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    }
    /**
     *  计算截面的 线数据
     */
    computeClipLineDot () {
        // origin data
        let GateSizeOfReflectivity = this.radarNf.Header.GateSizeOfReflectivity; // 库距离
        let GateSize = this.radarNf.Header.Gates[this.radarNf.Header.BandNo];
        let Position = this.radarNf.Header.Position;
        let Elevations = this.radarNf.Header.Elevations;
        // calc data
        let R = GateSizeOfReflectivity * GateSize;
        let pointA = [this.positions[0].x, this.positions[0].y];
        let pointB = [this.positions[1].x, this.positions[1].y];
        let cartographic = Cesium.Cartesian3.fromDegrees(Position[0], Position[1]);
        let center = [cartographic.x,  cartographic.y];
        
        let density = 1/4;
        // let intersections = getInterPointASegmentIntersectionCircle( center, R, pointA, pointB, GateSizeOfReflectivity);
        let polar = computeIntersectionSegmentCirclePolar( center, R, pointA, pointB, GateSizeOfReflectivity, density, Elevations, this.radarNf);
        // console.log('intersections',  intersections);
        // console.log('polar',  polar);
        console.log('polar', polar[0][0].azIndex, polar[0][polar[0].length - 1].azIndex);
        // let _2DData = this.polorTransfrom2DImage(polar);
        // console.log('_2DData ==>', _2DData);
        this.draw2DImage(polar);
    }

    /**
     * 极坐标转换为2d像素点
     * 对应radarNf数据
     * @param {*} polarCoords 
     */
    polorTransfrom2DImage (polarCoords) {
        let layers2DVal = [];
        let Elevations = this.radarNf.Header.Elevations; // 仰角
        let GateSizeOfReflectivity = this.radarNf.Header.GateSizeOfReflectivity; // 库距离
    
        Elevations.forEach((ele, index) => {
            let layer = [];
            polarCoords.forEach(polar => {
                let val = this.radarNf.getOriginVal(index, polar.radian | 0,  polar.distance / Math.cos(ele) / GateSizeOfReflectivity | 0);
                layer.push(val);
            })
            layers2DVal.push(layer);
        })
    
        return layers2DVal;
    }


    draw2DImage (layers) {
        const canvas = document.querySelector('.myCanvas')
        const width = layers[0].length
        const height = layers.length
        const continueColorWidth = 2
        const continueColorHeight = 5
        const canvasWidth = width * continueColorWidth
        const canvasHeight = height * continueColorHeight
        canvas.width = canvasWidth
        canvas.height = canvasHeight
        const color = new THREE.Color()
        const colorArray = MeteoInstance.colorArray;
        // console.log('canvasWidth ==>', canvasWidth, canvasHeight)
        if (canvas) {
            const ctx = canvas.getContext('2d')
            let imageData = ctx.createImageData(canvasWidth, canvasHeight)
            ctx.clearRect(0, 0, width, height)
            layers.forEach((layer, y) => {
                layer.forEach((obj, x) => {
                    this.drawLocationCanvasPiexlImage(
                        imageData, 
                        x * continueColorWidth, 
                        (height - y) * continueColorHeight, 
                        continueColorWidth, 
                        continueColorHeight, 
                        canvasWidth, 
                        color.set(colorArray[obj.val]),
                        this.distanceComputeFuncs)
                })
            })

            // this.drawDemoTest(imageData)
            ctx.putImageData(imageData, 0, 0)
            canvas.setAttribute('class', 'myCanvas')
            canvas.setAttribute('style', `width: ${canvasWidth}; height: ${canvasHeight}; margin-left: calc(50% - ${canvasWidth / 2}px)`)
        }
    }

     /**
     * 
     * @param {*} imageData 
     * @param {*} offsetX 
     * @param {*} offsetY 
     * @param {*} width 
     * @param {*} height 
     */
      drawLocationCanvasPiexlImage (imageData, offsetX, offsetY, width, height, canvasWidth, colors) {
        for(let y = offsetY; y < offsetY + height; y++) {
            for(let x = offsetX * 4; x < (offsetX + width) * 4; x += 4) {
                imageData.data[y * canvasWidth * 4 + x] =  colors.r * 255 | 0
                imageData.data[y * canvasWidth * 4 + x + 1] = colors.g * 255 | 0
                imageData.data[y * canvasWidth * 4 + x + 2] = colors.b * 255 | 0
                imageData.data[y * canvasWidth * 4 + x + 3] = 255
            }
        }
    }

    distanceComputeFuncs (pointA, center) {
        return Cesium.Cartesian3.distance(new Cesium.Cartesian3(pointA[0], pointA[1], center[2]), new Cesium.Cartesian3(center[0], center[1], center[2]))
    }
}
