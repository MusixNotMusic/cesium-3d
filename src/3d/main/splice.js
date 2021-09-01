import * as Cesium from 'cesium'
import * as THREE from 'three'
// import CesiumMeshVisualizer from 'cesiummeshvisualizer/Source/Main.js'
// const CesiumMeshVisualizer = require('cesiummeshvisualizer/Source/Main')
import $ from 'jquery'
import { MeteoLib } from '../lib/MeteoLib/_MeteoLib'
// import * as MeteoLib from './lib/MeteoLib/MeteoLib'
// const VectorTileImageryProvider = require('./lib/CesiumVectorTile.js')
import {
  distance,
  computeAcrossDescartesXYZ,
  computeAcrossPolar,
} from '../lib/math2'
// import MeteoLib = require('./lib/MeteoLib/MeteoLib')

const intersection = new Cesium.Cartesian3()
const intersectionLocal = new Cesium.Cartesian3()
const intersectionPolar = {
  azimuth: 0,
  elevation: 0,
  radius: 0,
}
const intersectCartographic = new Cesium.Cartographic()
let scratchPixels
let scratchVerticalPixels

const CoordinateHelper = MeteoLib.Data.CoordinateHelper
const MyLatLng = MeteoLib.Data.MyLatLng
// const GridDataColorMap = MeteoLib.Render.GridDataColorMap
const RadarMaterial = MeteoLib.Render.RadarMaterial
const MeshVisualizer = MeteoLib.Render.MeshVisualizer
// const MeshVisualizer = Cesium.MeshVisualizer
const Mesh = MeteoLib.Render.Mesh
//  RadarNetFormat = MeteoLib.Data.Radar.RadarNetFormat,
const PlaneBufferGeometry = MeteoLib.Render.PlaneBufferGeometry
const FramebufferTexture = MeteoLib.Render.FramebufferTexture
const ImageUtil = MeteoLib.Util.ImageUtil
// const VectorLayer = MeteoLib.Render.VectorLayer;

export class Splice {
  constructor(opt) {
    opt = opt || {}
    console.log('opt ==>', opt, opt.radarNf)
    if (!opt.radarNf || !opt.radarNf.Header || !opt.handler) return false
    // console.log('opt ==>', opt.radarNf)
    this.handler = opt.handler
    this.radarNf = opt.radarNf
    this.colorMap = opt.colorMap || null
    this.VCSImageViewer = opt.VCSImageViewer || null
    this.parentDoc = opt.parentDoc || null

    this.position = {}
    this.position.left = 0
    this.position.top = 0
    this.station = {}
    this.size = {
      width: document.body.clientWidth - 30,
      height: document.body.clientHeight - 30,
    }

    this.currentRadarLayerIndex = 0
    this.currentBandNo = 0
    this.ready = true

    this.sliceMaterial = null
    this.radarMaterials = []
    this.sliceFramebuffer = null

    this.cappiViewport = { x: 0, y: 0, width: 1024, height: 1024 }
    this.verticalViewport = { x: 0, y: 0, width: 397, height: 310 } //width:460
    this.weatherRadarSpace

    this.rectangle = new Cesium.Rectangle()
    this.viewRectangle = new Cesium.Rectangle()
    this.projection = new Cesium.WebMercatorProjection() //GeographicProjection();

    this.meshVisualizers = []
    this.viewer = opt.viewer || window.viewer
    /**
     *@type {ModuleViewer}
     */
    this.RHIImageViewer = null
    /**
     *@type {ModuleViewer}
     */
    // this.VCSImageViewer = null;
    /**
     *@type {ModuleViewer}
     */
    this.settingsViewer = null
    this.ingoreInvalidValue = true
    this.walls = []
    this.colorFPhrase = opt.colorFPhrase
    this.center = opt.center || [0, 0]
    this.R = opt.R || 1e6
    this.init(opt.radarNf)
  }

  init(radarNf) {
    if (!this.radarNf || !this.radarNf.Header) return false
    this.lon =
      this.radarNf.Header.Position[0] || window.radarPosition[0] || 103.2922
    this.lat =
      this.radarNf.Header.Position[1] || window.radarPosition[1] || 29.94614 //成都
    this.alt =
      this.radarNf.Header.Position[2] || window.radarPosition[2] || 1000
    this.station.Latitude = this.lat
    this.station.Longitude = this.lon
    this.station.Height = this.alt

    this.removeEvent()
    this.destroy()

    let center = Cesium.Cartesian3.fromDegrees(this.lon, this.lat, this.alt)
    let modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(center)
    this.weatherRadarSpace = new MeshVisualizer({
      up: { z: 1 },
      modelMatrix: modelMatrix,
    })
    this.viewer.scene.primitives.add(this.weatherRadarSpace)
    this.meshVisualizers.push(this.weatherRadarSpace)
    this.VCSImageViewer.available = true
    this.updateVCSLayer()

    this.initMouseEventHandler()
    this.updateData(radarNf)
  }
  // 移出原有绑定事件
  removeEvent() {
    this.handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE)
    this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK)
    this.handler.removeInputAction(
      Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK
    )
  }

  // 摧毁绑定事件
  destroy() {
    if (this.handler.isDestroy) this.handler.destroy()
    this.removeAllLayer()
  }

  // 摧毁所有图层

  removeAllLayer() {
    if (this.vectorLayer) {
      this.viewer.imageryLayers.remove(this.vectorLayer)
      this.vectorLayer = null
    }
    if (this.radarBaseImageryLayer) {
      this.viewer.imageryLayers.remove(this.radarBaseImageryLayer)
      this.radarBaseImageryLayer = null
    }
    if (this.radarGridLayer) {
      this.viewer.imageryLayers.remove(this.radarGridLayer)
      this.radarGridLayer = null
    }
    if (this.RHIImageViewer && this.RHIImageViewer.available) {
      this.RHIImageViewer.hide()
    }
    if (this.VCSImageViewer && this.VCSImageViewer.available) {
      this.VCSImageViewer.hide()
    }
    if (this.legendOverlay) {
      this.legendOverlay.hide()
    }
    if (this.walls && this.walls.length > 0) {
      this.walls.forEach((wall) => {
        this.viewer.entities.remove(wall)
      })
    }
  }

  /**
   * 处理鼠标交互
   */

  initMouseEventHandler() {
    let handler = this.handler //new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
    let startPick = false
    let endPick = false

    let startPoint = new Cesium.Cartesian3(0, 0, 0)
    let endPoint = new Cesium.Cartesian3(1, 1, 1)
    let pickedPoint = {}

    let vcsPoints = [
      new Cesium.Cartesian3(0, 0, 0),
      new Cesium.Cartesian3(1, 1, 1),
    ]
    let defaultImage = document.createElement('canvas')
    let cvsSliceEntity
    let transparent = false
    let run = () => {
      let wall = {
        name: '',
        polyline: {
          positions: new Cesium.CallbackProperty(function () {
            return vcsPoints
          }, false),
          width: 2,
          material: Cesium.Color.BLUE,
        },
        wall: {
          positions: new Cesium.CallbackProperty(function () {
            return vcsPoints
          }, false),
          material: new Cesium.ImageMaterialProperty({
            image: new Cesium.CallbackProperty(function () {
              if (this.VCSImage) {
                return this.VCSImage
              } else {
                return defaultImage
              }
            }, false),
            // transparent: transparent
          }),
          fill: true,
          outline: true,
          outlineColor: Cesium.Color.RED,
          minimumHeights: [0, 0],
          maximumHeights: [20 * 1000, 20 * 1000],
        },
        show: false,
      }
      cvsSliceEntity = this.viewer.entities.add(wall)
      this.walls.push(cvsSliceEntity)
    }

    run()

    handler.setInputAction((movement) => {
      if (!this.VCSImageViewer.available) {
        return
      }
      pickedPoint = this.pickPoint(movement.position, pickedPoint)
      console.log('LEFT_CLICK ==>', movement, pickedPoint)
      if (pickedPoint && pickedPoint.radarCoordinates) {
        if (this.VCSImageViewer.available) {
          this.weatherRadarSpace.localToWorldCoordinates(
            vcsPoints[1],
            vcsPoints[1]
          )
          if (!startPick) {
            Cesium.Cartesian3.clone(pickedPoint.radarCoordinates, startPoint)
            Cesium.Cartesian3.clone(pickedPoint.worldCoordinates, vcsPoints[0])
            cvsSliceEntity.show = false
            startPick = true
          } else {
            Cesium.Cartesian3.clone(pickedPoint.radarCoordinates, endPoint)
            Cesium.Cartesian3.clone(pickedPoint.worldCoordinates, vcsPoints[1])
            // this.updateVCSLayer(startPoint, endPoint);
            // this.calcVCSLayer(startPoint, endPoint)
            this.calcVCSLayer(vcsPoints[0], vcsPoints[1])
            cvsSliceEntity.show = this.VCSImageViewer.available
            startPick = false
          }
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

    handler.setInputAction((movement) => {
      pickedPoint = this.pickPoint(movement.endPosition, pickedPoint)

      if (pickedPoint && pickedPoint.radarCoordinates) {
        this.pickWeatherRadar(pickedPoint)
        if (startPick) {
          Cesium.Cartesian3.clone(pickedPoint.radarCoordinates, endPoint)
          Cesium.Cartesian3.clone(pickedPoint.worldCoordinates, vcsPoints[1])
          // this.updateVCSLayer(startPoint, endPoint);
          // this.calcVCSLayer(vcsPoints[0], vcsPoints[1])
          this.calcVCSLayer(vcsPoints[0], vcsPoints[1])
          cvsSliceEntity.show = this.VCSImageViewer.available
        }
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)
  }

  calcVCSLayer(startPoint, endPoint) {
    console.log('startPoint', startPoint, endPoint, this.center, this.R)
    let dx1 = startPoint.x - this.center.x
    let dy1 = startPoint.y - this.center.y

    let dx2 = endPoint.x - this.center.x
    let dy2 = endPoint.y - this.center.y

    // let dis1 = distance([startPoint.x, startPoint.y], [this.center.x, this.center.y])
    // let dis2 = distance([endPoint.x, endPoint.y], [this.center.x, this.center.y])

    let dis1 = Cesium.Cartesian3.distance(
      new Cesium.Cartesian3(startPoint.x, startPoint.y, startPoint.z),
      new Cesium.Cartesian3(this.center.x, this.center.y, this.center.z)
    )
    let dis2 = Cesium.Cartesian3.distance(
      new Cesium.Cartesian3(endPoint.x, endPoint.y, endPoint.z),
      new Cesium.Cartesian3(this.center.x, this.center.y, this.center.z)
    )

    let points = computeAcrossDescartesXYZ(
      [this.center.x, this.center.y],
      this.R,
      [startPoint.x, startPoint.y],
      [endPoint.x, endPoint.y]
    )
    let polar = computeAcrossPolar(
      [this.center.x, this.center.y],
      this.R,
      [startPoint.x, startPoint.y],
      [endPoint.x, endPoint.y]
    )

    let image2DSrcData = this.polorTransfrom2DImage(polar.polarPoint)
    this.draw2DImage(image2DSrcData)

    console.log('image2DSrcData ===>', image2DSrcData)
    console.log('points ===>', points)
    console.log('polar ===>', polar)

    console.log('dis1 ==>', dis1, this.R)
    console.log('dis2 ==>', dis2, this.R)
  }
  /**
   * 极坐标转换为2d像素点
   * 对应radarNf数据
   * @param {*} polarCoords
   */
  polorTransfrom2DImage(polarCoords) {
    let layers2DVal = []
    let Elevations = this.radarNf.Header.Elevations // 仰角
    let GateSizeOfReflectivity = this.radarNf.Header.GateSizeOfReflectivity // 仰角

    Elevations.forEach((ele, index) => {
      let layer = []
      polarCoords.forEach((polar) => {
        let val = this.radarNf.getOriginVal(
          index,
          polar.radian | 0,
          (polar.distance / Math.cos(ele) / GateSizeOfReflectivity) | 0
        )
        layer.push(val)
      })
      layers2DVal.push(layer)
    })

    return layers2DVal
  }

  draw2DImage(layers) {
    // document.querySelector('.myCanvas').remove()
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
    console.log('canvasWidth ==>', canvasWidth, canvasHeight)
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
            color.setHSL(Math.abs(obj.val) > 200 ? -1 : obj.val / 200, 1.0, 0.5)
          ),
            this.distanceComputeFuncs
        })
      })

      // this.drawDemoTest(imageData)
      console.log('imageData ==>', imageData)
      ctx.putImageData(imageData, 0, 0)
      canvas.setAttribute('class', 'myCanvas')
      canvas.setAttribute(
        'style',
        `width: ${canvasWidth}; height: ${canvasHeight}; margin-left: calc(50% - ${
          canvasWidth / 2
        }px)`
      )
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
  drawLocationCanvasPiexlImage(
    imageData,
    offsetX,
    offsetY,
    width,
    height,
    canvasWidth,
    colors
  ) {
    // let r = Math.random() * 255 | 0
    // let g = Math.random() * 255 | 0
    // let b = Math.random() * 255 | 0
    for (let y = offsetY; y < offsetY + height; y++) {
      for (let x = offsetX * 4; x < (offsetX + width) * 4; x += 4) {
        imageData.data[y * canvasWidth * 4 + x] = (colors.r * 255) | 0
        imageData.data[y * canvasWidth * 4 + x + 1] = (colors.g * 255) | 0
        imageData.data[y * canvasWidth * 4 + x + 2] = (colors.b * 255) | 0
        imageData.data[y * canvasWidth * 4 + x + 3] = 255

        // imageData.data[y * canvasWidth * 4 + x] =  r
        // imageData.data[y * canvasWidth * 4 + x + 1] = g
        // imageData.data[y * canvasWidth * 4 + x + 2] = b
        // imageData.data[y * canvasWidth * 4 + x + 3] = 255
      }
    }
  }

  drawDemoTest(imageData) {
    for (let i = 0; i < imageData.data.length; i += 4) {
      imageData.data[i] = (Math.random() * 255) | 0 // red
      imageData.data[i + 1] = (Math.random() * 255) | 0 // green
      imageData.data[i + 2] = (Math.random() * 255) | 0 // blue
      imageData.data[i + 3] = 255
    }
  }

  distanceComputeFuncs(pointA, center) {
    return Cesium.Cartesian3.distance(
      new Cesium.Cartesian3(pointA[0], pointA[1], center[2]),
      new Cesium.Cartesian3(center[0], center[1], center[2])
    )
  }

  /**
   *  获取当前点击点的各类坐标
   */
  pickPoint(windowPosition, pickedPoint) {
    var viewer = this.viewer
    var scene = viewer.scene
    //if (!scene.pickPositionSupported || this.viewer.scene.mode == Cesium.SceneMode.SCENE2D) {
    let intersection = viewer.camera.pickEllipsoid(
      windowPosition,
      scene.globe.ellipsoid
    )
    //} else {
    //    scene.pickPosition(windowPosition, intersection);
    //}
    if (!intersection) {
      return undefined
    }
    scene.globe.ellipsoid.cartesianToCartographic(
      intersection,
      intersectCartographic
    )
    if (!pickedPoint) {
      pickedPoint = {}
    }
    if (this.radarNf && this.weatherRadarSpace) {
      var weatherRadarSpace = this.weatherRadarSpace
      weatherRadarSpace.worldCoordinatesToLocal(intersection, intersectionLocal)
      intersection.z += 1000
      intersectionLocal.z += 1000
      var azimuth = Cesium.Math.toDegrees(
        Math.atan2(intersectionLocal.x, intersectionLocal.y)
      )
      if (azimuth < 0) {
        azimuth = 360 + azimuth
      }

      var rXY = Math.sqrt(
        Math.pow(intersectionLocal.x, 2),
        Math.pow(intersectionLocal.y, 2)
      )
      intersectionPolar.elevation = Cesium.Math.toDegrees(
        Math.atan2(rXY, intersectionLocal.z)
      )
      intersectionPolar.azimuth = azimuth
      intersectionPolar.radius = Math.sqrt(
        Math.pow(rXY, 2),
        Math.pow(intersectionLocal.z, 2)
      )
      intersectionPolar.radiusXY = rXY
      pickedPoint.worldCoordinates = intersection
      pickedPoint.radarCoordinates = intersectionLocal
      pickedPoint.lonlat = intersectCartographic
      pickedPoint.polarCoordinates = intersectionPolar
    } else {
      pickedPoint.worldCoordinates = undefined
      pickedPoint.radarCoordinates = undefined
      pickedPoint.lonlat = undefined
      pickedPoint.polarCoordinates = undefined
    }

    return pickedPoint
  }

  /**
   * 鼠标跟踪和点选功能
   */
  pickWeatherRadar(pickedPoint) {
    if (
      this.radarNf &&
      this.weatherRadarSpace &&
      pickedPoint.radarCoordinates
    ) {
      if (this.currentRadarLayerIndex >= 9) {
        map.mapStateBar.appendText(' ' + this.currentFileName)
        return
      }
      var radarNf = this.radarNf
      var elev = radarNf.Header.Elevations[this.currentRadarLayerIndex]

      var azimuth = pickedPoint.polarCoordinates.azimuth

      var r =
        pickedPoint.polarCoordinates.radiusXY /
        Math.cos(Cesium.Math.toRadians(elev))

      var v = radarNf.get(
        0,
        parseInt(azimuth),
        parseInt(r / radarNf.Header.GateSizeOfReflectivity)
      )
      var unit = 'dBZ'
      if (radarNf.Header.BandNo != 0) {
        unit = ''
      }
      if (v == -999.0) {
        unit = ''
        v = '无效值'
      }
      // map.mapStateBar.appendText(" " + this.currentFileName + " <span style='color:rgba(23,169,228,1);'>雷达点(" + elev.toFixed(2) + "°," + azimuth.toFixed(2) + "°," + (r / 1000.0).toFixed(2) + "km):" + v + " " + unit + "</span>");
    }
  }

  /**
   * 雷达局部坐标（笛卡尔）转地理坐标
   */
  radarCoordinatesToCartographic(radarCoordinates, cartographic) {
    if (!cartographic) {
      cartographic = new Cesium.Cartographic()
    }

    var cn = new MyLatLng(this.station.Longitude, this.station.Latitude)
    var length = Math.sqrt(
      Math.pow(radarCoordinates.x, 2) + Math.pow(radarCoordinates.y, 2)
    )
    var angle = Cesium.Math.toDegrees(
      Math.atan2(radarCoordinates.x, radarCoordinates.y)
    )
    var lonlat = CoordinateHelper.getMyLatLng(cn, length / 1000.0, angle)
    cartographic.longitude = Cesium.Math.toRadians(lonlat.m_Longitude)
    cartographic.latitude = Cesium.Math.toRadians(lonlat.m_Latitude)
    cartographic.height = this.station.Height + this.alt
    return cartographic
  }

  /**
   * 获取底部地理坐标范围
   */
  rectangleFromDimensions(dimensions, rectangle) {
    if (!rectangle) {
      rectangle = new Cesium.Rectangle()
    }
    var rX = dimensions.x / 2,
      rY = dimensions.y / 2
    var sw = this.radarCoordinatesToCartographic(
      new Cesium.Cartesian3(-rX, -rY, 0)
    )
    var ne = this.radarCoordinatesToCartographic(
      new Cesium.Cartesian3(rX, rY, 0)
    )
    rectangle.west = sw.longitude
    rectangle.south = sw.latitude
    rectangle.east = ne.longitude
    rectangle.north = ne.latitude

    return rectangle
  }

  getBandName(bandNo) {
    switch (bandNo) {
      case 0:
        return 'R'
      case 1:
        return 'V'
      case 2:
        return 'W'
      default:
        return 'R'
    }
  }

  createRadarLayerGeometry(radarDataNf, layerIndex, rCount, angleCount) {
    if (!layerIndex) {
      layerIndex = 0
    }

    var gates = radarDataNf.Header.Gates[radarDataNf.Header.BandNo]
    var gateSize = radarDataNf.Header.GateSizeOfReflectivity
    // var positions = new Float32Array(gates * 361 * 3);
    var positions = new Float32Array(gates * 360 * 3)
    var indices = []
    var elv = radarDataNf.Header.Elevations[layerIndex]
    var index = 0
    var indicesMatrix = []
    if (!rCount) {
      rCount = gates
    }
    if (!angleCount) {
      angleCount = 360
    }
    var deltR = Math.floor(gates / rCount)
    var deltA = parseInt(360 / angleCount)
    for (var k = 0; k <= Math.ceil(deltR * rCount); k += deltR) {
      // var rowIndicesMatrix = new Int32Array(361);
      // for (var j = 0; j <= 360; j += 1) {
      var rowIndicesMatrix = new Int32Array(360)
      for (var j = 0; j < 360; j += 1) {
        //计算顶点坐标（局部，相对雷达站点位置，距离单位为米）
        var length = gateSize * k //径向距离
        var radius = length * Math.cos(elv) //投影距离
        var height = length * Math.sin(elv)
        height +=
          radarDataNf.Header.Position[2] * (1 + Math.sin(elv)) +
          800 * (1 + Math.sin(elv))

        var x = radius * Math.cos(Cesium.Math.toRadians(j)),
          y = radius * Math.sin(Cesium.Math.toRadians(j)),
          z = height

        positions[index * 3] = x
        positions[index * 3 + 1] = y
        positions[index * 3 + 2] = z
        rowIndicesMatrix[j] = index++
      }
      indicesMatrix.push(rowIndicesMatrix)
    }

    for (var i = 1; i < indicesMatrix.length; i++) {
      for (var j = 1; j < indicesMatrix[i].length; j++) {
        let i0 = indicesMatrix[i - 1][j - 1],
          i1 = indicesMatrix[i][j - 1],
          i2 = indicesMatrix[i][j],
          i3 = indicesMatrix[i - 1][j]

        indices.push(i0)
        indices.push(i3)

        indices.push(i1)
        indices.push(i2)

        if (j % deltA == 0) {
          indices.push(i2)
          indices.push(i3)
        }
        if (j == indicesMatrix[i].length - 1) {
          //首尾相连
          ;(i0 = indicesMatrix[i - 1][j]),
            (i1 = indicesMatrix[i][j]),
            (i2 = indicesMatrix[i][0]),
            (i3 = indicesMatrix[i - 1][0])

          indices.push(i0)
          indices.push(i3)

          indices.push(i1)
          indices.push(i2)
        }
      }
    }

    var attributes = {
      position: new Cesium.GeometryAttribute({
        componentDatatype: Cesium.ComponentDatatype.DOUBLE,
        componentsPerAttribute: 3,
        values: positions,
      }),
    }
    indices = new Int32Array(indices)
    var bs = Cesium.BoundingSphere.fromVertices(positions)
    var geo = new Cesium.Geometry({
      attributes: attributes,
      indices: indices,
      primitiveType: Cesium.PrimitiveType.LINES, //TRIANGLES,
      boundingSphere: bs,
    })
    return geo
  }

  cesiumGeometryToGeojson(geometry, proerties) {
    var indices = geometry.indices

    var points = []
    var p = new Cesium.Cartesian3()
    var lonlat = new Cesium.Cartographic()

    var triangles = []
    var lines = []
    // var turf = MeteoLib.Util.turf;
    for (var i = 0; i < indices.length; i++) {
      var idx = indices[i] * 3
      Cesium.Cartesian3.fromArray(geometry.attributes.position.values, idx, p)
      this.radarCoordinatesToCartographic(p, lonlat)
      points.push([
        Cesium.Math.toDegrees(lonlat.longitude),
        Cesium.Math.toDegrees(lonlat.latitude),
      ])
      if (
        geometry.primitiveType == Cesium.PrimitiveType.TRIANGLES &&
        points.length == 3
      ) {
        triangles.push(points)
        points = []
      } else if (points.length == 2) {
        lines.push(points)
        points = []
      }
    }
    // if (geometry.primitiveType == Cesium.PrimitiveType.LINES) {
    //     return turf.featureCollection([turf.multiLineString(lines, proerties)]);
    // } else {
    //     return turf.featureCollection([turf.polygon(triangles, proerties)]);
    // }
  }

  drawGrid(options) {
    var xOptions = options.x,
      yOptions = options.y,
      offset = options.offset,
      title = options.title,
      clientSize = options.clientSize,
      baseLayers = options.baseLayers,
      fontSize = options.fontSize,
      backColor = options.backColor,
      target = options.target
    if (!fontSize) {
      fontSize = 12
    }
    if (!baseLayers) {
      baseLayers = []
    }
    if (!clientSize) {
      clientSize = { width: 512, height: 256 }
    }
    if (!backColor) {
      backColor = 'rgb(255,255,255)'
    }
    if (!offset) offset = {}
    offset = Object.assign(offset, {
      // left: 40,
      // top: 40,
      // bottom: 30,
      // right: 50,
      left: 10,
      top: 25,
      bottom: 20,
      right: 10,
      width: function () {
        return this.left + this.right
      },
      height: function () {
        return this.top + this.bottom
      },
    })

    var newCv = target ? target : document.createElement('canvas')
    // newCv.width = clientSize.width + offset.width();
    // newCv.height = clientSize.height + offset.height();
    newCv.width = clientSize.width
    newCv.height = clientSize.height
    var ctx = newCv.getContext('2d')

    ctx.font = fontSize + 'px arial'
    ctx.strokeStyle = 'rgba(230,230,230,1)'
    ctx.fillStyle = 'rgba(230,230,230,1)'

    if (yOptions.label) {
      offset.top += fontSize
      offset.left += ctx.measureText(yOptions.label).width / 2
    }
    if (xOptions.label) {
      offset.bottom += fontSize
      offset.right += ctx.measureText(xOptions.label).width / 2
    }
    // newCv.width = clientSize.width + offset.width();
    // newCv.height = clientSize.height + offset.height();
    newCv.width = clientSize.width
    newCv.height = clientSize.height
    // ctx = newCv.getContext("2d");

    ctx.fillStyle = backColor
    ctx.fillRect(0, 0, newCv.width, newCv.height)
    ctx.font = fontSize + 'px Microsoft YaHei'
    ctx.strokeStyle = 'rgba(230,230,230,1)'
    ctx.fillStyle = 'rgba(230,230,230,1)'
    for (var i = 0; i < baseLayers.length; i++) {
      var layer = baseLayers[i]
      if (
        layer instanceof HTMLCanvasElement ||
        layer instanceof HTMLImageElement ||
        layer instanceof HTMLVideoElement
      ) {
        layer = { image: layer }
      }
      if (!layer.image) {
        continue
      }
      if (!layer.position) {
        layer.position = { x: 0, y: 0 }
      }
      if (!layer.size) {
        layer.size = { width: layer.image.width, height: layer.image.height }
      }
      // ctx.drawImage(layer.image, layer.position.x + offset.left, layer.position.y + offset.top, layer.size.width, layer.size.height);
      // ctx.drawImage(layer.image, layer.position.x+offset.width(), layer.position.y - offset.bottom, layer.size.width - offset.width(), layer.size.height);
      ctx.drawImage(
        layer.image,
        layer.position.x + offset.width(),
        layer.position.y + offset.top,
        layer.size.width - offset.width() - 15,
        layer.size.height - offset.height()
      ) // 防止图像超出网格 2019-01-04
    }

    var deltX = (clientSize.width - offset.width() - 15) / xOptions.count // -15 是为了横坐标值显示完整 2019-01-04
    var deltY = (clientSize.height - offset.height()) / yOptions.count
    for (var i = 0; i < yOptions.count; i++) {
      for (var j = 0; j < xOptions.count; j++) {
        ctx.strokeRect(
          j * deltX + offset.width(),
          i * deltY + offset.top,
          deltX,
          deltY
        )
        // ctx.strokeRect(j * deltX + offset.left, i * deltY, deltX, deltY);
      }
    }

    var deltDisY = yOptions.distance / yOptions.count
    var deltDisX = xOptions.distance / xOptions.count

    var i
    var txtLen, txt, posX, poxY
    for (i = 0; i <= yOptions.count; i++) {
      txt = ((yOptions.count - i) * deltDisY).toFixed(1)
      txtLen = ctx.measureText(txt).width
      posX = offset.width() - txtLen - 5
      poxY = i * deltY + fontSize / 3 + offset.top
      ctx.fillText(txt, posX, poxY)
    }
    if (yOptions.label) {
      poxY = offset.top - fontSize
      txt = yOptions.label
      txtLen = ctx.measureText(txt).width
      posX = offset.width() - txtLen - 5
      ctx.fillText(txt, posX, poxY)
    }

    for (i = 0; i <= xOptions.count; i++) {
      txt = (i * deltDisX).toFixed(1)
      txtLen = ctx.measureText(txt).width
      posX = i * deltX + offset.width() - txtLen / 2
      //posY = clientSize.height + fontSize + 5 + offset.top; // 原来的
      posY = clientSize.height - fontSize - 2 // 2019-01-04
      ctx.fillText(txt, posX, posY)
    }
    if (xOptions.label) {
      posX = posX + txtLen + offset.width()
      txt = xOptions.label
      txtLen = ctx.measureText(txt).width
      //posY = clientSize.height + fontSize + 5 + offset.top; // 原来的
      posY = clientSize.height - fontSize - 2 // 2019-01-04
      ctx.fillText(txt, posX, posY)
    }

    fontSize = 12
    //ctx.font = fontSize + "px FangSong";

    if (title) {
      var txtLen = ctx.measureText(title).width
      //ctx.strokeText(title, (newCv.width - txtLen) / 2, offset.top - fontSize - 5);//描边
      ctx.fillStyle = ctx.fillText(
        title,
        (newCv.width - txtLen) / 2 + 8,
        offset.top - fontSize - 10
      ) // 填充 2019-01-03
    }
    return newCv
  }

  //更新雷达仰角
  updateRadarLayerIndex(idx) {
    if (!this.radarNf) return false
    if (!idx || typeof idx !== 'number') idx = 0
    this.currentRadarLayerIndex = idx
    this.updateData(this.radarNf)
  }

  //更新雷达扫描数据
  updateData(radarNf) {
    if (!this.radarNf) return false
    if (!radarNf) radarNf = this.radarNf
    this.MaxLayerNum = radarNf.Header.ElevationCount
    radarNf._computeProjectionParams()
    var pixels = new Uint8Array(radarNf.EncodedData.length * 4)
    for (var i = 0; i < radarNf.EncodedData.length; i++) {
      pixels[i * 4] = radarNf.EncodedData[i]
      pixels[i * 4 + 1] = radarNf.EncodedData[i]
      pixels[i * 4 + 2] = radarNf.EncodedData[i]
      pixels[i * 4 + 3] = radarNf.EncodedData[i] >= 1 ? 255 : 0
    }
    var width = radarNf.Header.Gates[radarNf.Header.BandNo],
      // height = radarNf.Header.ElevationCount * 361;
      height = radarNf.Header.ElevationCount * 360

    radarNf.Pixels = pixels
    radarNf.TextureUrl = ImageUtil.fromPixels(pixels, width, height).toDataURL()
    // if (this.radarNf) {
    //     this.radarNf.destroy();
    // }
    this.radarNf = {}
    this.radarNf = radarNf
    this.ready = true
    // this.update();
  }

  /**
   * 通过数据更新绘图
   */
  update() {
    if (this.radarNf && this.ready) {
      var radarNf = this.radarNf
      var d = radarNf.ProjParams.d
      var r = d / 2.0
      var h = radarNf.ProjParams.h
      var gates = radarNf.Header.Gates[radarNf.Header.BandNo]
      var gateSize = radarNf.Header.GateSizeOfReflectivity
      var deltR = Math.floor(gates / 9.0)
      var rView =
        Math.cos(radarNf.Header.Elevations[0]) * deltR * 8 * gateSize * 2
      var hView = 20 * 1000

      var dimensions = new Cesium.Cartesian3(d, d, h)
      var viewDimensions = new Cesium.Cartesian3(rView, rView, hView) //500 * 1000, 500 * 1000, 20 * 1000)
      this.rectangle = this.rectangleFromDimensions(dimensions, this.rectangle)
      this.viewRectangle = this.rectangleFromDimensions(
        viewDimensions,
        this.viewRectangle
      )
      this.viewDimensions = viewDimensions
      this.dimensions = dimensions

      // if (!this.sliceFramebuffer) {
      //     var materialInterp = new RadarMaterial({
      //         colorMap: this.colorMap,
      //         data: radarNf,
      //         dimensions: dimensions,
      //         type: RadarMaterial.Types.Slice,
      //         uniforms: {
      //             granularity: 0.1,
      //             // min: this.colorMap[this.colorMap.length - 1][1],
      //             // max: this.colorMap[0][0],
      //             min: this.colorMap[0][0],
      //             max: this.colorMap[this.colorMap.length - 1][1],
      //             sliceCoord: -999,
      //             mode: RadarMaterial.SliceMode.Z,
      //             encode: 0,
      //             startPoint: new Cesium.Cartesian3(),//仅在任意垂直剖面有用
      //             endPoint: new Cesium.Cartesian3(),//仅在任意垂直剖面有用
      //             useLinearInterp: true,
      //             viewDimensions: viewDimensions
      //         },
      //         //fragmentShader: interp_frag,
      //         //vertexShader: interp_vert
      //     });

      //     var geometry = new PlaneBufferGeometry(3, 3);
      //     var meshInterp = new Mesh(geometry, materialInterp);
      //     var fb = new FramebufferTexture(meshInterp);
      //     this.sliceFramebuffer = fb;
      //     this.sliceMaterial = materialInterp;
      //     this.radarMaterials.push(materialInterp);

      // }

      //绘制地面圆盘网格
      // if (!this.radarGridLayer) {
      //     var geometry = this.createRadarLayerGeometry(this.radarNf, this.currentRadarLayerIndex, this.radarNf.Header.ElevationCount, 12);

      //     var radarGridGeojson = this.cesiumGeometryToGeojson(geometry);
      //     this.radarGridLayer = this.viewer.imageryLayers.addImageryProvider(
      //         new VectorTileImageryProvider({
      //             source: radarGridGeojson,
      //             defaultStyle: {
      //                 outlineColor: "rgb(255,255,255)",//"rgba(23,169,228,1)",
      //                 lineWidth: 1.2,
      //                 fill: false,
      //                 fillColor: "rgba(16,71,97,0.7)"
      //             }
      //         })
      //     );
      // }

      //绘制色卡
      // if (!this.legendOverlay) {
      //     this.legendOverlay = new MeteoLib.Widgets.ScreenOverlay(this.viewer);
      //     var legendSize, recMargins, legendPadding, fontSize = 15;
      //     var lg = MeteoLib.Render.GridDataColorMap.getLegendEx(this.colorMap,
      //         " dBZ  ",
      //         { width: 20, height: 40 }, legendSize, recMargins, legendPadding, fontSize).imageUrl
      //     this.legendOverlay.showSingleImage(lg);
      // } else {
      //     this.legendOverlay.show();
      // }
      // this.legendOverlay.container.style = "position:absolute;right:10px;bottom:30px;";

      const imageLoaded = (img) => {
        this.radarNf.TextureUrl = img
        for (var i = 0; i < this.radarMaterials.length; i++) {
          this.radarMaterials[i].data = this.radarNf
          this.radarMaterials[i].uniforms.dimensions.value.x = d
          this.radarMaterials[i].uniforms.dimensions.value.y = d
          this.radarMaterials[i].uniforms.dimensions.value.z = h
          this.radarMaterials[i].uniforms.viewDimensions.value.x = rView // 500 * 1000;
          this.radarMaterials[i].uniforms.viewDimensions.value.y = rView // 500 * 1000;
          this.radarMaterials[i].uniforms.viewDimensions.value.z = hView //20 * 1000;
          // this.radarMaterials[i].uniforms.min.value = this.colorMap[this.colorMap.length - 1][1];
          // this.radarMaterials[i].uniforms.max.value = this.colorMap[0][0];
          this.radarMaterials[i].uniforms.min.value = this.colorMap[0][0]
          this.radarMaterials[i].uniforms.max.value =
            this.colorMap[this.colorMap.length - 1][1]
        }
        // this.updateBaseRadarLayer();
        // this.updateRHILayer();
        this.updateVCSLayer()
      }
      if (!this.radarNf.TextureUrl) return false
      imageLoaded(this.radarNf.TextureUrl)
      Cesium.loadImage(this.radarNf.TextureUrl).then(imageLoaded)
      // this.updateBaseRadarLayer();
      // this.updateVCSLayer();
      // if (typeof this.radarNf.TextureUrl === 'string') {
      //     Cesium.loadImage(this.radarNf.TextureUrl).then(imageLoaded);
      // }
      // else {
      //     imageLoaded(this.radarNf.TextureUrl);
      // }
    }
  }

  /**
   * 更新雷达底图图层
   */
  updateBaseRadarLayer() {
    if (this.currentRadarLayerIndex < this.MaxLayerNum) {
      this.sliceMaterial.uniforms.sliceCoord.value =
        this.radarNf.Header.Elevations[this.currentRadarLayerIndex]
      this.sliceMaterial.uniforms.mode.value = RadarMaterial.SliceMode.L
    } else if (this.currentRadarLayerIndex == 0) {
      this.sliceMaterial.uniforms.sliceCoord.value = this.cappiHeight * 1000
      this.sliceMaterial.uniforms.mode.value = RadarMaterial.SliceMode.Z
    } else if (this.currentRadarLayerIndex == this.MaxLayerNum) {
      this.sliceMaterial.uniforms.mode.value = 7 //RadarMaterial.SliceMode.L;
    }

    this.cappiViewport.height =
      (this.cappiViewport.width * this.rectangle.height) / this.rectangle.width
    if (
      scratchPixels &&
      scratchPixels.length !=
        this.cappiViewport.width * this.cappiViewport.height * 4
    ) {
      scratchPixels = undefined
    }
    scratchPixels = this.weatherRadarSpace.getPixels(
      this.viewer.scene.frameState,
      this.sliceFramebuffer,
      this.cappiViewport,
      scratchPixels
    )
    var cv = ImageUtil.fromPixels(
      scratchPixels,
      this.cappiViewport.width,
      this.cappiViewport.height
    )

    var newLayer = this.viewer.imageryLayers.addImageryProvider(
      new Cesium.SingleTileImageryProvider({
        // rectangle: this.rectangle,
        rectangle: new Cesium.Rectangle(
          this.rectangle.west,
          this.rectangle.south,
          this.rectangle.east,
          this.rectangle.north
        ),
        url: cv,
      }),
      3
    )
    newLayer.imageryProvider.readyPromise.then(function () {
      setTimeout(function () {
        if (this.radarBaseImageryLayer) {
          this.viewer.imageryLayers.remove(this.radarBaseImageryLayer)
        }
        this.radarBaseImageryLayer = newLayer
      }, 80)
    })
  }
  /**
   *更新VCS垂直面
   */
  updateVCSLayer(sPoint, ePoint) {
    if (sPoint) this.startPoint = sPoint
    if (ePoint) this.endPoint = ePoint
    let startPoint = this.startPoint
    let endPoint = this.endPoints
    if (!this.VCSImageViewer.available || !this.ready || !this.radarNf) {
      return
    }
    if (!endPoint && !startPoint && !this.VCSImage) {
      this.VCSImageViewer.show()
      //  let canvas = this.parentDoc.querySelector('#cutDiv canvas#scCanvas');
      // canvas.width = canvas.width;
      // canvas.height = canvas.height;
      if (
        this.VCSImageViewer.css('left') == '0px' &&
        this.VCSImageViewer.css('top') == '0px'
      )
        this.VCSImageViewer.css({
          left: $(window).width() - this.VCSImageViewer.width() - 50 + 'px',
          top: '50px',
        })
      return
    }
    // this.verticalViewport.width = this.VCSImageViewer.size.width
    // this.verticalViewport.height = this.VCSImageViewer.size.height;
    if (this.VCSImageViewer[0].clientWidth != 0) {
      this.verticalViewport.width =
        this.VCSImageViewer[0].clientWidth > 60
          ? this.VCSImageViewer[0].clientWidth - 60
          : this.VCSImageViewer[0].clientWidth // 爲了自適應，所以不能設置固定值 2019-01-03
      this.verticalViewport.height =
        this.VCSImageViewer[0].clientHeight > 60
          ? this.VCSImageViewer[0].clientHeight - 60
          : this.VCSImageViewer[0].clientHeight // 爲了自適應，所以不能設置固定值 2019-01-03
    }
    // let dom = this.parentDoc.querySelector('#cutDiv .imgDiv');
    // this.verticalViewport.width = dom.clientWidth
    // this.verticalViewport.height = dom.clientHeight
    var r = 414 * 1000
    var d = 2 * r
    var h = 20 * 1000

    this.sliceMaterial.uniforms.mode.value = RadarMaterial.SliceMode.VCS
    if (startPoint) {
      Cesium.Cartesian3.clone(
        startPoint,
        this.sliceMaterial.uniforms.startPoint.value
      )
    } else {
      startPoint = this.sliceMaterial.uniforms.startPoint.value
    }
    if (endPoint) {
      Cesium.Cartesian3.clone(
        endPoint,
        this.sliceMaterial.uniforms.endPoint.value
      )
    } else {
      endPoint = this.sliceMaterial.uniforms.endPoint.value
    }

    if (
      scratchVerticalPixels &&
      scratchVerticalPixels.length !=
        this.verticalViewport.width * this.verticalViewport.height * 4
    ) {
      scratchVerticalPixels = undefined
    }

    scratchVerticalPixels = this.weatherRadarSpace.getPixels(
      this.viewer.scene.frameState,
      this.sliceFramebuffer,
      this.verticalViewport,
      scratchVerticalPixels
    )

    // let dom1 = this.parentDoc.querySelector('#cutDiv .imgDiv');
    // let dom2 = this.parentDoc.querySelector('#cutDiv_zoomView_0_cutDiv .imgDiv');
    var cv = ImageUtil.fromPixels(
      scratchVerticalPixels,
      this.verticalViewport.width,
      this.verticalViewport.height
    )
    var cv1 = ImageUtil.fromPixels(
      scratchVerticalPixels,
      dom1.clientWidth,
      dom1.clientHeight
    )
    if (dom2) {
      let viewPort = {
        x: 0,
        y: 0,
        width: dom2.clientWidth,
        height: dom2.clientHeight,
      }
      let scratchVerticalPixels2 = this.weatherRadarSpace.getPixels(
        this.viewer.scene.frameState,
        this.sliceFramebuffer,
        viewPort
      )
      var cv2 = ImageUtil.fromPixels(
        scratchVerticalPixels2,
        viewPort.width,
        viewPort.height
      )
    }
    var startAngle = Cesium.Math.toDegrees(
      Math.atan2(startPoint.x, startPoint.y)
    )
    var startRadius = Math.sqrt(
      Math.pow(startPoint.x, 2) + Math.pow(startPoint.y, 2)
    )
    if (startAngle < 0) {
      startAngle += 360
    }
    var endAngle = Cesium.Math.toDegrees(Math.atan2(endPoint.x, endPoint.y))
    var endRadius = Math.sqrt(Math.pow(endPoint.x, 2) + Math.pow(endPoint.y, 2))
    if (endAngle < 0) {
      endAngle += 360
    }
    //    let target = this.parentDoc.querySelector('#cutDiv canvas#scCanvas')
    //    let target2 = this.parentDoc.querySelector('#cutDiv_zoomView_0_cutDiv canvas#scCanvas')
    let targetArr = []
    if (target) targetArr.push({ target: target, cv: cv1 })
    if (target2) targetArr.push({ target: target2, cv: cv2 })
    for (let i = 0; i < targetArr.length; i++) {
      let layer = targetArr[i].cv
      var cvWidthGrid = this.drawGrid({
        target: targetArr[i].target,
        baseLayers: [layer],
        x: {
          count: Math.floor(layer.width / 50), // 防止x坐标文字重合
          distance: Cesium.Cartesian3.distance(startPoint, endPoint) / 1500.0,
          label: 'km',
        },
        y: {
          count: 5,
          distance: 10,
          label: 'km',
        },
        // title: "起始点[" + startAngle.toFixed(1) + "°," + startRadius.toFixed(1) + "km]  " + "结束点[" + endAngle.toFixed(1) + "°," + endRadius.toFixed(1) + "km]  ",
        title:
          '起始点[' +
          startAngle.toFixed(1) +
          '°]  ' +
          '结束点[' +
          endAngle.toFixed(1) +
          '°]  ',
        clientSize: {
          width: layer.width,
          height: layer.height,
        },
        backColor: 'rgba(255,255,255,0)',
      })
      this.VCSImage = layer
    }
    this.VCSImageViewer.show()
    if (
      this.VCSImageViewer.css('left') == '0px' &&
      this.VCSImageViewer.css('top') == '0px'
    )
      this.VCSImageViewer.css({
        left: $(window).width() - this.VCSImageViewer.width() - 50 + 'px',
        top: '50px',
      })
  }
}
