import * as Cesium from 'cesium';

export function movePlane () {
  let viewer = MeteoInstance.cesium.viewer;
  let scene = MeteoInstance.cesium.viewer.scene;
  let camera = MeteoInstance.cesium.viewer.camera;
  let pinBuilder = new Cesium.PinBuilder();
  let position = Cesium.Cartesian3.fromRadians(camera.positionCartographic.longitude, camera.positionCartographic.latitude, 1000);
  let entity = viewer.entities.add({
    position: position,
    billboard: {
      image: pinBuilder.fromColor(Cesium.Color.SALMON, 48),
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM
    },
    label : {
      text : '1000'
    }
  });
  function relevantSource() {
    let dragging = false;
    let handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
    handler.setInputAction(
      function(click) {
        let pickedObject = scene.pick(click.position);
        if (Cesium.defined(pickedObject) && (pickedObject.id === entity)) {
          entity.billboard.scale = 1.2;
          dragging = true;
          scene.screenSpaceCameraController.enableRotate = false;
        }
      },
      Cesium.ScreenSpaceEventType.LEFT_DOWN
    );
    handler.setInputAction(
      function(movement) {
        if (dragging) {
          let cartesian =  entity.position.getValue(Cesium.JulianDate.fromDate(new Date()));
          let cartographic = scene.globe.ellipsoid.cartesianToCartographic(cartesian);
          let surfaceNormal = scene.globe.ellipsoid.geodeticSurfaceNormal(cartesian);
          let planeNormal = Cesium.Cartesian3.subtract(scene.camera.position, cartesian, new Cesium.Cartesian3());
          planeNormal = Cesium.Cartesian3.normalize(planeNormal, planeNormal);
          let ray =  viewer.scene.camera.getPickRay(movement.endPosition);
          let plane = Cesium.Plane.fromPointNormal(cartesian, planeNormal);
          let newCartesian =  Cesium.IntersectionTests.rayPlane(ray, plane);
          let newCartographic = viewer.scene.globe.ellipsoid.cartesianToCartographic(newCartesian);
          let height = newCartographic.height;
          cartographic.height = height;
          entity.label.text =  height.toFixed(2);
          entity.position.setValue(scene.globe.ellipsoid.cartographicToCartesian(cartographic));
        }
      },
      Cesium.ScreenSpaceEventType.MOUSE_MOVE
    );
    handler.setInputAction(
      function() {
        entity.billboard.scale = 1;
        dragging = false;
        scene.screenSpaceCameraController.enableRotate = true;
      },
      Cesium.ScreenSpaceEventType.LEFT_UP
    );
  }
  relevantSource();
  camera.flyTo({
    destination: Cesium.Cartesian3.fromRadians(camera.positionCartographic.longitude, camera.positionCartographic.latitude, 300000)
  });
}
