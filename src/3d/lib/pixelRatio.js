import * as Cesium from 'cesium';

export function pixelRatio (viewer) {
    let scene = viewer.scene;
// 获取画布的大小
    var width = scene.canvas.clientWidth;
    var height = scene.canvas.clientHeight;
    //获取画布中心两个像素的坐标（默认地图渲染在画布中心位置）
    var left = scene.camera.getPickRay(new Cesium.Cartesian2((width / 2) | 0, (height - 1) / 2));
    var right = scene.camera.getPickRay(new Cesium.Cartesian2(1 + (width / 2) | 0, (height - 1) / 2));

    var globe = scene.globe;
    var leftPosition = globe.pick(left, scene);
    var rightPosition = globe.pick(right, scene);

    if (!Cesium.defined(leftPosition) || !Cesium.defined(rightPosition)) {
        return;
    }

    var leftCartographic = globe.ellipsoid.cartesianToCartographic(leftPosition);
    var rightCartographic = globe.ellipsoid.cartesianToCartographic(rightPosition);
    var geodesic = new Cesium.EllipsoidGeodesic();
    geodesic.setEndPoints(leftCartographic, rightCartographic);
    var distance = geodesic.surfaceDistance;//分辨率
    return distance;
}