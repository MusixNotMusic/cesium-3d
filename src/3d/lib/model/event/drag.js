import * as Cesium from 'cesium';
import * as THREE from 'three';
import { vectorDegree } from '@/3d/lib/math';

export class DragObjects {
    constructor(object, callback) {
        this.object = object;
        this.callback = callback;
        this.raycaster = new THREE.Raycaster();
        this.targetObject = null;
        this.cartesianStart = [];
        this.cartesianEnd = [];
        this.addListenerEvent();
    }

    findObject (position) {
        let camera = MeteoInstance.three.camera;
        let scene = MeteoInstance.three.scene;
        const mouse = new THREE.Vector2();
        // mouse.x = position.x;
        // mouse.y = position.y;
        mouse.x = ( position.x / window.innerWidth ) * 2 - 1;
        mouse.y = - ( position.y / window.innerHeight ) * 2 + 1;
        this.raycaster.setFromCamera( mouse, camera );

        const intersections = this.raycaster.intersectObjects( scene.children, true );
    
        if ( intersections.length > 0 ) {
          console.log('intersections ==>', intersections);
          let objects = intersections.map(inter => inter.object);
          if (objects.includes(this.object)) {
              this.targetObject = this.object;
          }
        }
    }

    addListenerEvent() {
        var viewer = MeteoInstance.cesium.viewer;
        var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene._imageryLayerCollection);
        // move
        handler.setInputAction((movement) => {
            let ray = viewer.camera.getPickRay(movement.endPosition);
            this.cartesianEnd = viewer.scene.globe.pick(ray, viewer.scene);
            let ray1 = viewer.camera.getPickRay(movement.startPosition);
            this.cartesianStart = viewer.scene.globe.pick(ray1, viewer.scene);

            // this.cartesianStart = viewer.scene.pick(movement.startPosition);
            // this.cartesianEnd = viewer.scene.pick(movement.endPosition);

            if (!Cesium.defined(this.cartesianEnd)) //跳出地球时异常
                return;
            // console.log('this.object ==>', this.object,this.cartesianEnd, this.cartesianStart, movement);
            if (this.targetObject) {
                if (this.callback) {
                    this.callback(this.cartesianStart, this.cartesianEnd, this);
                }
                // this.cartesianStart.x = 0;
                // this.cartesianEnd.x = 0;
                // this.getSpaceDistance(this.cartesianStart, this.cartesianEnd).then((dis) => {
                //     dis = this.cartesianEnd.y > this.cartesianStart.y ? dis : -dis;
                //     this.targetObject.position.y = this.targetObject.position.y + dis;
                //     MeteoInstance.emitter.emit('moveNsPlane', {})
                // })
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        
        // LEFT_DOWN
        handler.setInputAction((movement) => {
            console.log('LEFT_DOWN', movement);
            if (!Cesium.defined(this.cartesianStart)) //跳出地球时异常
                return;

            this.findObject(movement.position);
            if (this.targetObject) {
                this.lockCesiumViewScene();
            }

        }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
        
        // click left
        handler.setInputAction((movement) => {
            console.log('LEFT_UP');
            this.targetObject = null;
            this.cartesianEnd = { x: 0, y: 0 };
            this.cartesianStart = { x: 0, y: 0 };
            this.unlockCesiumViewScene();
        }, Cesium.ScreenSpaceEventType.LEFT_UP);
    }

    lockCesiumViewScene () {
        MeteoInstance.cesium.viewer.scene.screenSpaceCameraController.enableRotate = false;
        document.body.style.cursor = 'move';
        // MeteoInstance.cesium.viewer.scene.screenSpaceCameraController.enableTranslate = false;
        // MeteoInstance.cesium.viewer.scene.screenSpaceCameraController.enableZoom = false;
        // MeteoInstance.cesium.viewer.scene.screenSpaceCameraController.enableTilt = false;
    }

    unlockCesiumViewScene () {
        MeteoInstance.cesium.viewer.scene.screenSpaceCameraController.enableRotate = true;
        document.body.style.cursor = 'default';
        // MeteoInstance.cesium.viewer.scene.screenSpaceCameraController.enableTranslate = true;
        // MeteoInstance.cesium.viewer.scene.screenSpaceCameraController.enableZoom = true;
        // MeteoInstance.cesium.viewer.scene.screenSpaceCameraController.enableTilt = true;
    }

    //空间两点距离计算函数
    getSpaceDistance(position1, position2) {
        //只计算最后一截，与前面累加
        //因move和鼠标左击事件，最后两个点坐标重复
        var point1cartographic = Cesium.Cartographic.fromCartesian(position1);
        var point2cartographic = Cesium.Cartographic.fromCartesian(position2);
        return this.getTerrainDistance(point1cartographic, point2cartographic);
    }
    
    getTerrainDistance(point1cartographic, point2cartographic) {
        return new Promise((resolve, reject) => {
            var geodesic = new Cesium.EllipsoidGeodesic();
            var viewer = MeteoInstance.cesium.viewer;
            var distance = 0;
            geodesic.setEndPoints(point1cartographic, point2cartographic);
            var s = geodesic.surfaceDistance;
            var cartoPts = [point1cartographic];
            for (var jj = 1000; jj < s; jj += 1000) {　　//分段采样计算距离
                var cartoPt = geodesic.interpolateUsingSurfaceDistance(jj);
                cartoPts.push(cartoPt);
            }
            cartoPts.push(point2cartographic);
            //返回两点之间的距离
            var promise = Cesium.sampleTerrain(viewer.terrainProvider, 8, cartoPts);
            Cesium.when(promise, function (updatedPositions) {
                for (var jj = 0; jj < updatedPositions.length - 1; jj++) {
                    var geoD = new Cesium.EllipsoidGeodesic();
                    geoD.setEndPoints(updatedPositions[jj], updatedPositions[jj + 1]);
                    var innerS = geoD.surfaceDistance;
                    innerS = Math.sqrt(Math.pow(innerS, 2) + Math.pow(updatedPositions[jj + 1].height - updatedPositions[jj].height, 2));
                    distance += innerS;
                }
                resolve(distance);
            });
        })
    }

    getSpaceDistance2(position1, position2){
        var distance = 0;
        var point1cartographic = Cesium.Cartographic.fromCartesian(position1);
        var point2cartographic = Cesium.Cartographic.fromCartesian(position2);
        /**根据经纬度计算出距离**/
        var geodesic = new Cesium.EllipsoidGeodesic();
        geodesic.setEndPoints(point1cartographic, point2cartographic);
        var s = geodesic.surfaceDistance;
        //返回两点之间的距离
        //s = Math.sqrt(Math.pow(s, 2) + Math.pow(point2cartographic.height - point1cartographic.height, 2));	
        s = Math.abs(point2cartographic.height - point1cartographic.height);	
        distance = distance + s;
        return distance.toFixed(3);
    }	
}

let obj =
{
  "id": 49,
  "ename": "RCS",
  "cname": "反射率垂直切割",
  "cnameAlias": null,
  "type": 9,
  "enableApply": 0,
  "enableTimeApply": 0,
  "enableQuery": 1,
  "enableMovie": 0,
  "productOrder": 0,
  "typeOfCut": -1,
  "typeOfMultiLayer": 17,
  "level": 1,
  "colorFile": "clrZ.clr",
  "typeOfEXTRA": -1,
  "typeOfPZ": -1,
  "isPZ": 0,
  "applyConfigFile": null,
  "typeOfStack": null,
  "productAlias": "反射率垂直切割",
  "params": [
      3025.2150915501893,
      358,
      6267.503517416775,
      190
  ],
  "fileParams": [
      3025.2150915501893,
      358,
      6267.503517416775,
      190
  ],
  "sTime": 1629990773000,
  "eTime": 1629990773000
}

let scale = 500;

export function dragMoveCallback (cartesianStart, cartesianEnd, context) {
    cartesianStart.x = 0;
    cartesianEnd.x = 0;
    const radius = (700 * scale) / 2;
    context.getSpaceDistance(cartesianStart, cartesianEnd).then((dis) => {
        dis = context.cartesianEnd.y > context.cartesianStart.y ? dis : -dis;
  
        if (context.targetObject.position.y >= -radius && context.targetObject.position.y <= radius) {
          context.targetObject.position.y = context.targetObject.position.y + dis;
        }
  
        if (context.targetObject.position.y < -radius) {
          context.targetObject.position.y = -radius;
        } else if (context.targetObject.position.y > radius) {
          context.targetObject.position.y = radius;
        }
  
        let y = context.targetObject.position.y;
        let degree1 = vectorDegree([0,0], [Math.sqrt(radius ** 2 - y ** 2), y])
        let degree2 = 180 - degree1;
        degree2 = degree2 > 0 ? degree2 : (360 + degree2);
        // console.log('radius ==>', radius);
        // console.log('y ==>', y);
        // console.log('x ==>', Math.sqrt(radius ** 2 - y ** 2));
        // console.log('degree1 ==>', degree1);
        // console.log('degree2 ==>', degree2);
        // obj
        obj.params = [
          1e5,
          degree1,
          1e5,
          degree2
        ]
  
        obj.fileParams = [
          1e5,
          degree1,
          1e5,
          degree2
        ]
        MeteoInstance.emitter.emit('moveNsPlane', obj);
    })
  }

  export function dragMoveWECallback (cartesianStart, cartesianEnd, context) {
    cartesianStart.y = 0;
    cartesianEnd.y = 0;
    const radius = (700 * scale) / 2;
    context.getSpaceDistance(cartesianStart, cartesianEnd).then((dis) => {
        dis = context.cartesianEnd.x > context.cartesianStart.x ? dis : -dis;
        if (context.targetObject.position.x >= -radius && context.targetObject.position.x <= radius) {
          context.targetObject.position.x = context.targetObject.position.x + dis;
        } 
        if (context.targetObject.position.x < -radius) {
          context.targetObject.position.x = -radius;
        } else if (context.targetObject.position.x > radius) {
          context.targetObject.position.x = radius;
        }
  
        let x = context.targetObject.position.x;
        let degree1 = vectorDegree([0,0], [x, Math.sqrt(radius ** 2 - x ** 2)])
        let degree2 = 360 - degree1;
        // degree2 = degree2 > 0 ? degree2 : (360 + degree2);
        // console.log('radius ==>', radius);
        // console.log('y ==>', Math.sqrt(radius ** 2 - x ** 2));
        // console.log('x ==>', x);
        // console.log('degree1 ==>', degree1);
        // console.log('degree2 ==>', degree2);
        // obj
        obj.params = [
          1e5,
          degree1,
          1e5,
          degree2
        ]
  
        obj.fileParams = [
          1e5,
          degree1,
          1e5,
          degree2
        ]
        MeteoInstance.emitter.emit('moveWsPlane', obj);
    })
  }