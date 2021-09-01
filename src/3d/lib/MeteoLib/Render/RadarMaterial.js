import * as Cesium from 'cesium'
import GridDataColorMap from './GridDataColorMap'
import ShaderChunk from './Shaders/ShaderChunk'
import MeshMaterial from './MeshMaterial'

// if (typeof document === 'undefined') {
//     return undefined;
// }

var radar_frag = ShaderChunk.radar_frag,
  radar_vert = ShaderChunk.radar_vert,
  radar_interp_frag = ShaderChunk.radar_interp_frag,
  radar_interp_vert = ShaderChunk.radar_interp_vert

var defaultTexture = document.createElement('canvas')
defaultTexture.width = 1
defaultTexture.height = 1

Cesium.defineProperties = Object.defineProperties
/**
 *
 *@constructor
 *@memberof MeteoLib.Render
 *@extends MeteoLib.Render.MeshMaterial
 *
 *@param {Object}options
 *@param {Object}options.colorMap
 *@param {MeteoLib.Data.Radar.RadarNetFormat}options.data
 *
 *@param {Object}[options.uniforms]
 *@param {Object}[options.uniformStateUsed]
 *@param {Boolean}[options.translucent]
 *@param {Boolean}[options.wireframe]
 *@param {Enum}[options.side=MeteoLib.Render.MeshMaterial.Sides.DOUBLE]
 *@param {String|Cesium.Color}[options.defaultColor=Cesium.Color.WHITE]
 *@param {String}[options.vertexShader]
 *@param {String}[options.fragmentShader]
 *
 *@property {Array}colorMap
 *@property {MeteoLib.Data.Radar.RadarNetFormat}data
 *
 *@property {Object}uniforms
 *@property {Number}[uniforms.layerCount=0]
 *@property {Number}[uniforms.tex]
 *@property {Number}[uniforms.rCount=361]
 *@property {Number}[uniforms.rGates=0]
 *@property {Number}[uniforms.gateSizeOfReflectivity=0]
 *@property {Number}[uniforms.elevationArray: new Float32Array(5)]
 *@property {Number}[uniforms.offset=0]
 *@property {Number}[uniforms.scale=0]
 *@property {Number}[uniforms.texTransform] 图例
 *@property {Number}[uniforms.min=-5] 图例最左边颜色表示的值，即最小有效值
 *@property {Number}[uniforms.max=70] 图例最右边颜色表示的值，即最大有效值
 *@property {Number}[uniforms.granularity=0.1] 插值精度（0~1）
 *@property {Number}[uniforms.alpha=-1] 透明度，仅用于体渲染
 *@property {Number}uniforms.dimensions]
 *@property {Number}uniforms.viewDimensions] 仅在VCS和RHI剖切时有用
 *@property {Boolean}uniforms.exportValue] 导出数据时有用
 *@property {Number}[uniforms.backTex]
 *@property {Number}[uniforms.steps=256]
 *@property {Number}[uniforms.alphaCorrection=1]
 *@property {Number}sliceCoord=0]
 *@property {Number}[mode=MeteoLib.Render.RadarMaterial.Z]
 *@property {Number}[encode=0] 0表示不编码，其余皆表示编码
 *@property {Cesium.Cartesian3}[startPoint] 仅在任意垂直剖面有用
 *@property {Cesium.Cartesian3}[endPoint] 仅在任意垂直剖面有用
 *@property {Object}uniformStateUsed
 *@property {Boolean}translucent
 *@property {Boolean}wireframe
 *@property {Enum}side
 *@property {String|Cesium.Color}defaultColor
 *@property {String}vertexShader
 *@property {String}fragmentShader
 *
 *@property {MeteoLib.Data.Radar.RadarNetFormat}data
 *@property {MeteoLib.Data.Radar.RadarNetFormat}colorMap
 */
function RadarMaterial(options) {
  if (!options) {
    throw new Error('缺少options参数')
  }

  options = Object.assign(
    {
      side: MeshMaterial.Sides.DOUBLE,
      wireframe: false,
      translucent: false,
      blending: true,
    },
    options
  )

  this._type = options.type
  if (!this._type) {
    this._type = RadarMaterial.Types.Normal
  }
  var glslDefine = ''
  switch (this._type) {
    case RadarMaterial.Types.Normal:
      glslDefine = '#define USE_NORMAL\n'
      options.vertexShader = Cesium.defaultValue(
        options.vertexShader,
        radar_vert
      )
      options.fragmentShader = Cesium.defaultValue(
        options.fragmentShader,
        radar_frag
      )
      break
    case RadarMaterial.Types.Volume:
      glslDefine = '#define USE_VOLUME\n'
      options.vertexShader = Cesium.defaultValue(
        options.vertexShader,
        radar_vert
      )
      options.fragmentShader = Cesium.defaultValue(
        options.fragmentShader,
        radar_frag
      )
      break
    case RadarMaterial.Types.Slice:
      options.vertexShader = Cesium.defaultValue(
        options.vertexShader,
        radar_interp_vert
      )
      options.fragmentShader = Cesium.defaultValue(
        options.fragmentShader,
        radar_interp_frag
      )
      break
    default:
  }
  options.vertexShader = glslDefine + options.vertexShader
  options.fragmentShader = glslDefine + options.fragmentShader
  this._data = options.data

  this._radarColorTransform = null
  this._colorMap = options.colorMap
  if (!this._colorMap) {
    //最小值 最大值 颜色分量（r g b a） 描述
    this._colorMap = [
      [0, 5, [0, 0, 246, 255], '0~5'],
      [5, 10, [1, 160, 246, 255], '5~10'],
      [10, 15, [0, 236, 236, 255], '10~15'],
      [15, 20, [1, 255, 0, 255], '15~20'],
      [20, 25, [0, 200, 0, 255], '20~25'],
      [25, 30, [1, 144, 0, 255], '25~30'],
      [30, 35, [255, 255, 0, 255], '30~35'],
      [35, 40, [231, 192, 0, 255], '35~40'],
      [40, 45, [255, 144, 0, 255], '40~45'],
      [45, 50, [255, 0, 0, 255], '45~50'],
      [50, 55, [214, 0, 0, 255], '50~55'],
      [55, 60, [192, 0, 0, 255], '55~60'],
      [60, 65, [255, 0, 240, 255], '60~65'],
      [65, 70, [120, 0, 132, 255], '65~70'],
      [70, 100, [173, 144, 240, 255], '>70'],
    ]
  }
  this._radarColorTransform = GridDataColorMap.getOverview(
    this._colorMap,
    256,
    16
  )

  this._dimensions = options.dimensions
  if (!this._dimensions) {
    this._dimensions = new Cesium.Cartesian3(1, 1, 1)
  }

  this._framebufferTexture = defaultTexture
  options.uniforms = options.uniforms ? options.uniforms : {}
  options.uniforms = Object.assign(
    {
      layerCount: 0, //this._data.Header.ElevationCount,
      tex: defaultTexture, //this._data.TextureUrl,
      rCount: 361,
      rGates: 0, //this._data.Header.Gates[this._data.Header.BandNo],
      gateSizeOfReflectivity: 0, //this._data.Header.GateSizeOfReflectivity,
      elevationArray: new Float32Array(5), // this._data.Header.Elevations,
      offset: 0, //this._data.Header.Offset,
      scale: 0, //this._data.Header.Scale,
      texTransform: this._radarColorTransform,
      min: -5,
      max: 70,
      useLinearInterp: true,
      granularity: 0.1, //插值精度，单位是米
      //体积渲染部分
      alpha: -1,
      dimensions: this._dimensions,
      backTex: this._framebufferTexture,
      steps: 256,
      alphaCorrection: 1,
      //剖切插值部分
      sliceCoord: 0,
      mode: 0,
      encode: 0, //0表示不编码，其余皆表示编码
      startPoint: new Cesium.Cartesian3(), //仅在任意垂直剖面有用
      endPoint: new Cesium.Cartesian3(), //仅在任意垂直剖面有用
      viewDimensions: new Cesium.Cartesian3(414 * 1000, 414 * 1000, 20 * 1000), //仅在剖切时有用
      exportValue: false, //
    },
    options.uniforms
  )

  MeshMaterial.apply(this, arguments)

  this.uniforms = Object.assign(this.uniforms, options.uniforms)

  this.materialFirstPass = new MeshMaterial({
    fragmentShader:
      "varying vec3 worldSpaceCoords;\n\
                        void main()\n\
                        {\n\
                            //The fragment's world space coordinates as fragment output.\n\
                            gl_FragColor = vec4( worldSpaceCoords.x , worldSpaceCoords.y, worldSpaceCoords.z, 1 );\n\
                        }",
    vertexShader:
      'attribute vec3 position;\n\
                        varying vec3 worldSpaceCoords;\n\
                        uniform mat4 projectionMatrix;\n\
                        uniform mat4 modelViewMatrix;\n\
                        uniform vec3 dimensions;\n\
                        \n\
                        void main()\n\
                        {\n\
                            //Set the world space coordinates of the back faces vertices as output.\n\
                            gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n\
                            worldSpaceCoords=(position+dimensions/2.0)/dimensions;\n\
                        }',
    side: MeshMaterial.Sides.BACK,
    uniforms: {
      dimensions: this._dimensions,
    },
  })

  if (this._data) {
    this.data = this._data
  }
}
RadarMaterial.Types = {
  Volume: 1,
  Normal: 0,
  Slice: 2,
}
/**
 *剖切方式：0表示分成剖切，1表示南北剖切，2表示东西剖切,3表示旋转剖切,4表示单层投影,5表示RHI距离高度显示,6表示VCS任意垂直剖面
 *@proerty {Number}X 表示东西剖切,仅调整x轴
 *@proerty {Number}Y 表示南北剖切 ,仅调整y轴
 *@proerty {Number}Z 表示分层剖切,仅调整z轴
 *@proerty {Number}R 表示旋转剖切,仅调整旋转角度
 *@proerty {Number}RHI 表示RHI距离高度显示
 *@proerty {Number}CVS 表示VCS任意垂直剖面
 */
RadarMaterial.SliceMode = {
  X: 2, //表示东西剖切,仅调整x轴
  Y: 1, //表示南北剖切 ,仅调整y轴
  Z: 0, //表示分层剖切,仅调整z轴
  R: 3, //表示旋转剖切,仅调整旋转角度
  L: 4, //表示单层投影
  RHI: 5, //表示RHI距离高度显示
  VCS: 6, //表示VCS任意垂直剖面
  CR: 7, //表示组合反射率
}
RadarMaterial.prototype = new MeshMaterial()

Cesium.defineProperties(RadarMaterial.prototype, {
  data: {
    get: function () {
      return this._data
    },
    set: function (val) {
      this._data = val
      this.uniforms.layerCount.value = this._data.Header.ElevationCount
      if (
        this.uniforms.tex.value instanceof HTMLImageElement &&
        this._data.TextureUrl instanceof HTMLImageElement
      ) {
        if (this.uniforms.tex.value.src != this._data.TextureUrl.src) {
          this.uniforms.tex.value = this._data.TextureUrl
        }
      } else if (this.uniforms.tex.value != this._data.TextureUrl) {
        this.uniforms.tex.value = this._data.TextureUrl
      }

      ;(this.uniforms.rGates.value =
        this._data.Header.Gates[this._data.Header.BandNo]),
        (this.uniforms.gateSizeOfReflectivity.value =
          this._data.Header.GateSizeOfReflectivity),
        (this.uniforms.elevationArray.value = this._data.Header.Elevations),
        (this.uniforms.offset.value = this._data.Header.Offset),
        (this.uniforms.scale.value = this._data.Header.Scale)
      //this.needsUpdate = true;
    },
  },
  colorMap: {
    get: function () {
      return this._colorMap
    },
    set: function (val) {
      this._colorMap = val
      this._radarColorTransform = GridDataColorMap.getOverview(
        this._colorMap,
        256,
        16
      )
      this.uniforms.texTransform.value = this._radarColorTransform
    },
  },
  dimensions: {
    get: function () {
      return this._dimensions
    },
    set: function (val) {
      this._dimensions = val
      this.uniforms.dimensions.value = this._dimensions
      this.materialFirstPass.uniforms.dimensions.value = this._dimensions
    },
  },
  framebufferTexture: {
    get: function () {
      return this._framebufferTexture
    },
    set: function (val) {
      this._framebufferTexture = val
      this.uniforms.backTex.value = this._framebufferTexture
    },
  },
  type: {
    get: function () {
      return this._type
    },
    set: function (val) {
      if (val != this._type) {
        this.needsUpdate = true
      }
      this._type = val

      if (this._type == RadarMaterial.Types.Volume) {
        if (this.vertexShader.indexOf('USE_NORMAL') >= 0) {
          this.vertexShader = this.vertexShader.replace(
            'USE_NORMAL',
            'USE_VOLUME'
          )
        } else {
          this.vertexShader = '#define USE_VOLUME' + this.fragmentShader
        }
        if (this.fragmentShader.indexOf('USE_NORMAL') >= 0) {
          this.fragmentShader = this.fragmentShader.replace(
            'USE_NORMAL',
            'USE_VOLUME'
          )
        } else {
          this.fragmentShader = '#define USE_VOLUME' + this.fragmentShader
        }
      } else if (this._type == RadarMaterial.Types.Normal) {
        if (this.vertexShader.indexOf('USE_VOLUME') >= 0) {
          this.vertexShader = this.vertexShader.replace(
            'USE_VOLUME',
            'USE_NORMAL'
          )
        } else {
          this.vertexShader = '#define USE_NORMAL' + this.fragmentShader
        }
        if (this.fragmentShader.indexOf('USE_VOLUME') >= 0) {
          this.fragmentShader = this.fragmentShader.replace(
            'USE_VOLUME',
            'USE_NORMAL'
          )
        } else {
          this.fragmentShader = '#define USE_NORMAL' + this.fragmentShader
        }
      }
    },
  },
})
export default RadarMaterial
