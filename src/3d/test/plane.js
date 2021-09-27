import * as Cesium from 'cesium';
import * as THREE from 'three';
import { 
    computeIntersectionSegmentCirclePolar,
    computeIntersectionSegmentCircleSpace,
    subractLocation
} from '@/3d/lib/mathCesium';

import { Object3D } from '@/3d/main/objectStore';

import { throttle } from 'lodash'

window.Cesium = Cesium;
export class MouseMoveWall2 {
    constructor (data) {
        this.radarNf = data;
        this.positions = []; 
        this.viewer = MeteoInstance.cesium.viewer;
        this.scene = this.viewer.scene;
        // this.handler = new Cesium.ScreenSpaceEventHandler(this.scene.canvas);
        this.startPicker = false;
        this.endPicker = false;
        this.poly = undefined;

        this._computeClipLineDot = throttle(this.computeClipLineDot.bind(this), 30);
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
            if (this.startPicker && this.endPicker) {
                this.startPicker = false;
                this.endPicker = false;
            }
            if (!this.startPicker) {
                this.positions[0] = cartesian;
                this.startPicker = true;
            } else {
                this.positions[1] = cartesian;
                this._computeClipLineDot();
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    
        handler.setInputAction((movement) => {
            var cartesian = scene.camera.pickEllipsoid(movement.endPosition, scene.globe.ellipsoid);
            if (this.positions.length >=1) {
                if (!Cesium.defined(poly)) {
                    poly = new wallPoly(this.positions);
                } else {
                    // positions.pop();
                    // positions.push(cartesian);
                    if (!this.endPicker) {
                        this.positions[1] = cartesian;
                        this._computeClipLineDot();
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
        let now = Date.now();
        // origin data
        let GateSizeOfReflectivity = this.radarNf.Header.GateSizeOfReflectivity; // 库距离
        let GateSize = this.radarNf.Header.Gates[this.radarNf.Header.BandNo];
        let Position = this.radarNf.Header.Position;
        let Elevations = this.radarNf.Header.Elevations;
        // calc data
        let R = GateSizeOfReflectivity * GateSize;
        let pointA = [this.positions[0].x, this.positions[0].y, this.positions[0].z];
        let pointB = [this.positions[1].x, this.positions[1].y, this.positions[1].z];
        let cartographic = Cesium.Cartesian3.fromDegrees(Position[0], Position[1], Position[2]);
        let center = [cartographic.x, cartographic.y, cartographic.z];
        
        let density = 1 / 4;
        // let intersections = getInterPointASegmentIntersectionCircle( center, R, pointA, pointB, GateSizeOfReflectivity);
        let polar = computeIntersectionSegmentCirclePolar( center, R, pointA, pointB, GateSizeOfReflectivity, density, Elevations, this.radarNf);
        // console.log('intersections',  intersections);
        // console.log('polar',  polar);
        if (polar && polar.length > 0) {
            console.log('polar', polar[0][0].azIndex, polar[0][polar[0].length - 1].azIndex);

            console.log('delta polar', polar[0][polar[0].length - 1].azIndex - polar[0][0].azIndex);
            this.draw2DImage(polar);
        }
        console.log('computeClipLineDot speed time =>', Date.now() - now, ' ms');

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


export class MouseMoveWall {
    constructor (data) {
        this.radarNf = data;
        this.positions = []; 
        this.viewer = MeteoInstance.cesium.viewer;
        this.scene = this.viewer.scene;
        // this.handler = new Cesium.ScreenSpaceEventHandler(this.scene.canvas);

        this.shiftDown = true;
        this.pcikerStartPoint = false;
        this.clickCount = 0;

        this.movePlane = null;
        this._computeClipLineDot = throttle(this.computeClipLineDot.bind(this), 30);
        this._updateMeshMovePlane = throttle(this.updateMeshMovePlane.bind(this), 30);
        this.raycaster = new THREE.Raycaster();
        //  创建移动截面模板
        this.createMovePlane();

        // 笛卡尔 center
        let Position = this.radarNf.Header.Position;
        this.center = Cesium.Cartesian3.fromDegrees(Position[0], Position[1], Position[2]);

        this.prevPoint = new THREE.Vector3();

        this.listenerEvents.bind(this)();
    }

    getMovePlane () {
        if (!this.movePlane) {
            return this.createMovePlane();
        }
        return this.movePlane;
    }

    createMovePlane () {
        // move panel
        let vetices = [
            1, 0, 1, 
            1, 1, 1, 
            0, 0, 1, 
            0, 0, 1, 
            0, 1, 1, 
            1, 1, 1 
        ]
        let colors = [
            Math.random(), 
            Math.random(), 
            Math.random(), 

            Math.random(), 
            Math.random(), 
            Math.random(), 
            
            Math.random(), 
            Math.random(), 
            Math.random(), 
            
            Math.random(), 
            Math.random(), 
            Math.random(), 
            
            Math.random(), 
            Math.random(), 
            Math.random(), 
            
            Math.random(), 
            Math.random(), 
            Math.random()
        ]

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vetices, 3 ) );
        geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );
        // geometry.computeBoundingSphere();
        const material = new THREE.MeshBasicMaterial( {side: THREE.DoubleSide, vertexColors: true} );
        // const material = new THREE.PointsMaterial({ size: 150, vertexColors: true });
        this.movePlane = new THREE.Mesh( geometry, material );
        this.movePlane.name = 'movePlane';
        // this.movePlane.rotation.x = Math.PI / 2;
        // this.movePlane.rotation.y = Math.PI;

        MeteoInstance.three.scene.add(this.movePlane);
        let minWGS84 = MeteoInstance.minWGS84;
        let maxWGS84 = MeteoInstance.maxWGS84;
        var _3DOB = new Object3D(this.movePlane, minWGS84, maxWGS84, true)
        let objectStoreIns = MeteoInstance.objectStoreIns;
        objectStoreIns.push(_3DOB)
    }

    updateMovePlane (vectorA, vectorB) {
        let vectorCenter = new THREE.Vector3(this.center.x, this.center.y, this.center.z);
        // vectorA = new THREE.Vector3().subVectors(vectorA, vectorCenter);
        // vectorB = new THREE.Vector3().subVectors(vectorB, vectorCenter);
        vectorA = subractLocation(vectorA, vectorCenter);
        vectorB = subractLocation(vectorB, vectorCenter);
        vectorA = new THREE.Vector3(vectorA.x, vectorA.y, vectorA.z);
        vectorB = new THREE.Vector3(vectorB.x, vectorB.y, vectorB.z);
        console.log('vectorA, vectorB', vectorA, vectorB);
        vectorA.z = 0;
        vectorB.z = 0;
        // let ax = vectorA.x - this.center.x;
        // let ay = vectorA.y - this.center.y;
        // let az = vectorA.z - this.center.z;

        let hA =  new THREE.Vector3().copy(vectorA);
        let hB =  new THREE.Vector3().copy(vectorB);

        hA.z += 30000;
        hB.z += 30000;

        let vertices = []
        // vertices.push(...vectorB.toArray())
        // vertices.push(...vectorA.toArray())
        // vertices.push(...hA.toArray())
        // vertices.push(...vectorB.toArray())
        // vertices.push(...hB.toArray())
        // vertices.push(...hA.toArray())

        vertices.push(...vectorA.toArray())
        vertices.push(...vectorB.toArray())
        vertices.push(...hA.toArray())
        vertices.push(...hB.toArray())
        let indices = [1, 0, 2, 1, 2, 3];
        // meshPlane.geometry.attributes.position.needsUpdate = true
        this.movePlane.geometry.setIndex(indices);
        this.movePlane.geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    }

    updateMeshMovePlane() {
        let GateSizeOfReflectivity = this.radarNf.Header.GateSizeOfReflectivity; // 库距离
        let GateSize = this.radarNf.Header.Gates[this.radarNf.Header.BandNo];
        let Elevations = this.radarNf.Header.Elevations;
        // calc data
        let R = GateSizeOfReflectivity * GateSize;
        let pointA = [this.positions[0].x, this.positions[0].y, this.positions[0].z];
        let pointB = [this.positions[1].x, this.positions[1].y, this.positions[1].z];
        let center = [this.center.x, this.center.y, this.center.z];
        
        let density = 1/4;
        let now = Date.now()
        let { vertices, colors, indices,  normals} = computeIntersectionSegmentCircleSpace( center, R, pointA, pointB, GateSizeOfReflectivity, density, Elevations, this.radarNf);
        console.log('computeIntersectionSegmentCircleSpace ==>', Date.now() - now, ' ms');
        // meshPlane.geometry.attributes.position.needsUpdate = true
        this.movePlane.geometry.setIndex(indices);
        this.movePlane.geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        this.movePlane.geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        this.movePlane.geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    }

    listenerEvents() {
        // let domElement = MeteoInstance.three.renderer.domElement;
        let domElement = MeteoInstance.cesium.viewer.scene.canvas;
        
        // window.addEventListener('keydown', this.keyDownHandle.bind(this))
    
        // window.addEventListener('keyup', this.keyUpHandle.bind(this))
    
        domElement.addEventListener('click', this.clickHandle.bind(this))
    
        domElement.addEventListener('mousemove', this.mouseMoveHandle.bind(this));
    }

    keyDownHandle(e) {
        if (e.key === 'Shift') {
            this.shiftDown = true;
        }
    }

    keyUpHandle(e) {
        if (e.key === 'Shift') {
            this.shiftDown = false;
            this.pickerStartPoint = false;
            this.clickCount = 0;
        }
    }

    clearHandleStatus () {
        this.clickCount = 0;
        this.pickerStartPoint = false;
    }

    clickHandle(e) {
        if (this.shiftDown) {
            console.log('click ==>', e)
            if (this.clickCount === 2) {
                this.clearHandleStatus();
            }
            if (this.clickCount === 0) {
                this.positions[0] = this.screen2World(e);
                this.clickCount++;
                this.pickerStartPoint = true;
            } else if (this.clickCount === 1) {
                this.positions[1] = this.screen2World(e);
                this.pickerStartPoint = false;
                this.clickCount++;
                // this.updateMovePlane(this.positions[0], this.positions[1]);
                // this._computeClipLineDot();
                this._updateMeshMovePlane();
            }

        }
    }

    mouseMoveHandle(e) {
        if (this.pickerStartPoint) {
            console.log('mousemove ==>', e)
            this.positions[1] = this.screen2World(e)
            // this.updateMovePlane(this.positions[0], this.positions[1]);
            // this._computeClipLineDot();
            this._updateMeshMovePlane();
        }
    }

    /**
     * 获取地面交点
     * @param {*} event 
     * @returns 
     */
    screen2World (event) {
        let now = Date.now();
        let wrap = event.target.parentNode;
        let left = wrap.getBoundingClientRect().left;
        let top = wrap.getBoundingClientRect().top;
        let clientX = event.clientX - left;
        let clientY = event.clientY - top;

        let mouse = new THREE.Vector2();

        let camera = MeteoInstance.three.camera;
        let scene = MeteoInstance.three.scene;

        mouse.x = (clientX / wrap.offsetWidth) * 2 - 1;
        mouse.y = -(clientY / wrap.offsetHeight) * 2 + 1;

        console.log( mouse.x,  mouse.y);

        this.raycaster.setFromCamera(mouse, camera);
        let ground = scene.getObjectByName('ground');
        let intersects = this.raycaster.intersectObjects([ground], true);
        console.log('intersects ==>', intersects);
        if (intersects.length == 1){
            let ground = intersects[0];
            console.log('delta time ==>', Date.now() - now, ' ms');
            this.prevPoint = ground.point;
            return ground.point;
        }

        return this.prevPoint;
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
        let pointA = [this.positions[0].x, this.positions[0].y, this.positions[0].z];
        let pointB = [this.positions[1].x, this.positions[1].y, this.positions[1].z];
        let center = [this.center.x, this.center.y, this.center.z];
        
        let density = 1/4;
        let polar = computeIntersectionSegmentCirclePolar( center, R, pointA, pointB, GateSizeOfReflectivity, density, Elevations, this.radarNf);
        if (polar && polar.length > 0) {
            console.log('polar', polar[0][0].azIndex, polar[0][polar[0].length - 1].azIndex);

            console.log('delta polar', polar[0][polar[0].length - 1].azIndex - polar[0][0].azIndex);
            this.draw2DImage(polar);
        }
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
        let now = Date.now();
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
        console.log('draw image time ===>', Date.now() - now, ' ms');
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
