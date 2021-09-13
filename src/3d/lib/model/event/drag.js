import * as Cesium from 'cesium';
import * as THREE from 'three';

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
                this.targetObject.position.y = this.targetObject.position.y + (this.cartesianEnd.y - this.cartesianStart.y);
                // this.targetObject.position.y += (this.cartesianEnd.y - this.targetObject.parent.position.y);
                console.log('this.object ==>', this.targetObject,  movement);
                console.log('this.object ==>', this.cartesianEnd, this.cartesianStart);
                console.log('delta Z==>', (this.cartesianEnd.z - this.cartesianStart.z));
                console.log('delta Y==>', (this.cartesianEnd.y - this.cartesianStart.y));
                console.log('delta X==>', (this.cartesianEnd.x - this.cartesianStart.x));
                console.log('getSpaceDistance ==>', this.getSpaceDistance2(this.cartesianStart, this.cartesianEnd));
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
        this.getTerrainDistance(point1cartographic, point2cartographic);
    }
    
    getTerrainDistance(point1cartographic, point2cartographic) {
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
            console.log('updatedPositions ==>', updatedPositions);
            for (var jj = 0; jj < updatedPositions.length - 1; jj++) {
                var geoD = new Cesium.EllipsoidGeodesic();
                geoD.setEndPoints(updatedPositions[jj], updatedPositions[jj + 1]);
                var innerS = geoD.surfaceDistance;
                innerS = Math.sqrt(Math.pow(innerS, 2) + Math.pow(updatedPositions[jj + 1].height - updatedPositions[jj].height, 2));
                distance += innerS;
            }
            console.log('distance===>', distance)
            return distance;
        });
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