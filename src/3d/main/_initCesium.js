import * as Cesium from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import { CESIUM_BASE_URL, token } from '../config/token';

window.CESIUM_BASE_URL = CESIUM_BASE_URL;
Cesium.Ion.defaultAccessToken = token;

let cesiumContainer = document.getElementById('cesiumContainer')

let cesium = {
    viewer: null,
}


export function initCesium() {
    let maxWGS84 = MeteoInstance.maxWGS84;
    let minWGS84 = MeteoInstance.minWGS84;
    console.log('initCesium ===>', maxWGS84, minWGS84);
    cesium.viewer = new Cesium.Viewer(cesiumContainer, {
      useDefaultRenderLoop: false,
      selectionIndicator: false,
      homeButton: false,
      sceneModePicker: false,
      navigationHelpButton: false,
      infoBox: false,
      navigationHelpButton: false,
      navigationInstructionsInitiallyVisible: false,
      animation: false,
      timeline: false,
      fullscreenButton: false,
      allowTextureFilterAnisotropic: false,
      contextOptions: {
        webgl: {
          alpha: false,
          antialias: true,
          preserveDrawingBuffer: true,
          failIfMajorPerformanceCaveat: false,
          depth: true,
          stencil: false,
          anialias: false,
        },
      },
      targetFrameRate: 60,
      resolutionScale: 0.1,
      orderIndependentTranslucency: true,
      // creditContainer: 'hidecredit',
      // imageryProvider: new Cesium.TileMapServiceImageryProvider({
      //   url: './node_modules/cesium/Source/Assets/Textures/NaturalEarthII/',
      //   maximumLevel: 5,
      // }),
      baseLayerPicker: false,
      geocoder: false,
      automaticallyTrackDataSourceClocks: false,
      dataSources: null,
      clock: null,
      terrainShadows: Cesium.ShadowMode.DISABLED,
    })
  
    var center = Cesium.Cartesian3.fromDegrees(
      (minWGS84[0] + maxWGS84[0]) / 2,
      (minWGS84[1] + maxWGS84[1]) / 2 - 1,
      200000
    )

    cesium.viewer.camera.flyTo({
      destination: center,
      orientation: {
        heading: Cesium.Math.toRadians(0),
        pitch: Cesium.Math.toRadians(-60),
        roll: Cesium.Math.toRadians(0),
      },
      duration: 3,
    });
  
    cesium.viewer.cesiumWidget.creditContainer.style.display = 'none'

    MeteoInstance.cesium = cesium;
  }