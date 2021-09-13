import { DragControls } from 'three/examples/jsm/controls/DragControls';
import * as Cesium from 'cesium';
import * as THREE from 'three';

export class DragObjects {
    constructor(object, callback) {
        this.object = object;
        this.callback = callback;
        let camera = MeteoInstance.three.camera;
        let renderer = MeteoInstance.three.renderer;
        this.controls = new DragControls( object, camera, renderer.domElement );
        this.raycaster = new THREE.Raycaster();
        this.addListenerEvent();
    }

    findObject () {
        this.raycaster.setFromCamera( mouse, camera );

        const intersections = this.raycaster.intersectObjects( scene.children, true );
    
        if ( intersections.length > 0 ) {
          console.log('intersections ==>', intersections);
    
          // const object = intersections[ 0 ].object;
    
          let len = intersections.length;
          for (let i = 0; i < len; i++) {
            const object = intersections[ i ].object;
            if (object.name === 'moveNs') {
              targetObject = object;
              break;
            }
          }
        }
    }

    addListenerEvent() {
        var viewer = MeteoInstance.cesium.viewer;
        var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene._imageryLayerCollection);
        var cartesianEnd;
        var cartesianStart;
        handler.setInputAction((movement) => {
            let ray = viewer.camera.getPickRay(movement.endPosition);
            cartesianEnd = viewer.scene.globe.pick(ray, viewer.scene);
            if (!Cesium.defined(cartesianEnd)) //跳出地球时异常
                return;
            console.log('this.object ==>', this.object, cartesianEnd, cartesianStart);
            if (cartesianStart) {
                this.object.position.y = (cartesianEnd.y - cartesianStart.y) * 500;
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        
        handler.setInputAction((movement) => {
            let ray = viewer.camera.getPickRay(movement.position);
            cartesianStart = viewer.scene.globe.pick(ray, viewer.scene);
            if (!Cesium.defined(cartesianStart)) //跳出地球时异常
                return;

        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        
        handler.setInputAction((movement) => {
            // handler.destroy(); //关闭事件句柄
            // handler = undefined;
            // positions.pop(); //最后一个点无效
        
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    }


    //空间两点距离计算函数
    getSpaceDistance(positions) {
        console.log(22)
        //只计算最后一截，与前面累加
        //因move和鼠标左击事件，最后两个点坐标重复
        var i = positions.length - 3;
        var point1cartographic = Cesium.Cartographic.fromCartesian(positions[i]);
        var point2cartographic = Cesium.Cartographic.fromCartesian(positions[i + 1]);
        this.getTerrainDistance(point1cartographic, point2cartographic);
    }
    
    getTerrainDistance(point1cartographic, point2cartographic) {
        var geodesic = new Cesium.EllipsoidGeodesic();
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
            return distance;
        });
    }
}