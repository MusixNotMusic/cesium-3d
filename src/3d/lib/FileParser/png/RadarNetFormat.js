import * as Cesium from 'cesium'
import File from '../File'
import ImageUtil from './ImageUtil'
import RadarNetHeader from './RadarNetHeader'
var PI = Math.PI
//根据给定仰角计算该仰角的范围（判断处于那两个仰角层之间）
function getElevRange(elevationOut, minMaxElevIndex, minMaxElev, that) {
  var minElevIndex = -1
  var maxElevIndex = -1
  var minElev = -1.0
  var maxElev = -1.0
  var elevationArray = that.Header.Elevations
  if (elevationOut <= elevationArray[0]) {
    maxElevIndex = 0
    minElevIndex = 0
    minElev = elevationArray[0]
    maxElev = elevationArray[0]
  } else {
    for (var i = 1; i < that.Header.ElevationCount; i += 1) {
      if (
        elevationArray[i] >= elevationOut &&
        elevationArray[i - 1] <= elevationOut
      ) {
        maxElevIndex = i
        minElevIndex = i - 1
        minElev = elevationArray[i - 1]
        maxElev = elevationArray[i]
        break
      }

      if (i >= that.Header.ElevationCount - 1.0) {
        maxElevIndex = i
        minElevIndex = i
        minElev = elevationArray[i]
        maxElev = elevationArray[i]
        break
      }
    }
  }
  minMaxElevIndex[0] = minElevIndex
  minMaxElevIndex[1] = maxElevIndex
  minMaxElev[0] = minElev
  minMaxElev[1] = maxElev
}

function cartesian2Polar(cartesian3, that) {
  var result = new Cesium.Cartesian3(-1.0, -1.0, -1.0)
  var elev, azimuth, polarDistance

  var xDistance = -cartesian3.x
  var yDistance = cartesian3.y
  var zDistance = cartesian3.z
  var lonlatDistance = Math.sqrt(
    Math.pow(xDistance, 2.0) + Math.pow(yDistance, 2.0)
  )

  if (yDistance != 0.0) {
    azimuth = Math.atan(xDistance, yDistance)
    if (xDistance < 0.0 && yDistance < 0.0) {
      azimuth += PI * 2.0
    }
    azimuth += PI / 2.0
  } else if (xDistance >= 0.0) {
    azimuth = PI / 2.0
  } else {
    azimuth = (3.0 * PI) / 2.0
  }

  elev = Cesium.Math.toDegrees(Math.atan(zDistance, lonlatDistance))
  polarDistance = Math.sqrt(
    Math.pow(lonlatDistance, 2.0) + Math.pow(zDistance, 2.0)
  )

  result.z = elev
  result.y = Cesium.Math.toDegrees(azimuth)
  result.x = polarDistance / that.Header.GateSizeOfReflectivity
  if (result.x > that.Header.Gates[that.Header.BandNo]) {
    result.x = -1.0
    result.y = -1.0
    result.z = -1.0
  }
  return result
}

function linearInterp(x1, y1, z1, x2, y2, z2, d, outVal, that) {
  var count = 0.0

  var val = 0.0
  var val1 = that.get(z1, 360 - y1, x1)
  var val2 = that.get(z2, 360 - y2, x2)
  if (val1 != that.m_invalidValue) {
    val += val1 * (1.0 - d)
    count++
  }
  if (val2 != that.m_invalidValue) {
    val += val2 * d
    count++
  }
  outVal[0] = val

  return count
}

//8点插值法插值
function epiInterp(polarCoords, that) {
  var x = new Int32Array(2),
    y = new Int32Array(2)
  z = new Int32Array(2)

  var minElev, maxElev
  var minMaxElev = []
  getElevRange(polarCoords.z, z, minMaxElev, that)
  ;(minElev = minMaxElev[0]), (maxElev = minMaxElev[1])

  x[0] = Math.floor(polarCoords.x)
  x[1] = Math.ceil(polarCoords.x)
  y[0] = Math.floor(polarCoords.y)
  y[1] = Math.ceil(polarCoords.y)

  var val
  var count = 0.0

  var fcvy1 = 0.0,
    fcvy2 = 0.0,
    fcvy3 = 0.0,
    fcvy4 = 0.0
  var d1 = polarCoords.x - x[0]

  var outVals = []
  count += linearInterp(x[0], y[0], z[1], x[1], y[0], z[1], d1, outVals, that)
  fcvy1 = outVals[0]
  count += linearInterp(x[0], y[0], z[0], x[1], y[1], z[0], d1, outVals, that)
  fcvy2 = outVals[0]

  count += linearInterp(x[0], y[0], z[1], x[1], y[0], z[1], d1, outVals, that)
  fcvy3 = outVals[0]

  count += linearInterp(x[0], y[0], z[0], x[1], y[1], z[0], d1, outVals, that)
  fcvy4 = outVals[0]

  var fcvy5, fcvy6
  var d2 = polarCoords.y - y[0]
  fcvy5 = fcvy1 * d2 + (1.0 - d2) * fcvy3
  fcvy6 = fcvy2 * d2 + (1.0 - d2) * fcvy4

  var d3 = (polarCoords.z - minElev) / (maxElev - minElev)
  val = fcvy5 * d3 + fcvy6 * (1.0 - d3)
  if (z[0] == z[1]) {
    val = fcvy5
  }
  if (count == 0.0) return that.m_invalidValue
  return val
}

/**
 *天气雷达数据网络传输格式
 *@constructor
 */
function RadarNetFormat() {
  /**
   *@type{RadarNetHeader}
   */
  this.Header = null
  /**
   *@type {Object}
   */
  this.ProjParams = {
    r: 0,
    h: 0,
  }
  /**
   *@type{String}
   */
  this.TextureUrl = null
  /// <summary>
  /// 已解码数据（(编码值-Offset)/Scale）
  /// </summary>
  this.DecodedData = []
  /// <summary>
  /// 已编码数据（ 解码值*Scale+Offset）
  /// </summary>
  this.EncodedData = []

  /// <summary>
  /// 编码值中的特殊标记,表示无有效观测数据
  /// </summary>
  this.m_invalidCode = 0

  /// <summary>
  /// 编码值中的特殊标记,表示有距离模糊
  /// </summary>
  this.m_ranfoldCode = 1

  /// <summary>
  /// 实际值中的特殊标记,表示无有效观测数据
  /// </summary>
  this.m_invalidValue = -999

  /// <summary>
  /// 实际值中的特殊标记,表示有距离模糊
  /// </summary>
  this.m_ranfoldValue = 999
}

RadarNetFormat.prototype.sampleData = function (cartesian3) {
  //笛卡尔坐标转极坐标
  var polarCoords = cartesian2Polar(cartesian3, this)
  if (polarCoords.x == -1.0 && polarCoords.x == -1.0 && polarCoords.x == -1.0)
    return this.m_invalidValue
  //8点插值
  var val = epiInterp(polarCoords, this)
  return val
}
/**
 *@param {Float|Number}data
 *@return {Byte|Number}
 */
RadarNetFormat.prototype._encodeSingle = function (data) {
  if (data == this.m_invalidValue) return this.m_invalidCode
  else if (data == this.m_ranfoldValue) return this.m_ranfoldCode
  else return data * this.Header.Scale + this.Header.Offset
}

/**
 *编码
 */
RadarNetFormat.prototype.Encode = function () {
  if (this.DecodedData == null) {
    throw new Error('解码数据未加载')
  }
  if (this.EncodedData != null && this.EncodedData.length) {
    return
  }
  this.EncodedData = new Uint8Array(this.DecodedData.length)
  for (var i = 0; i < this.DecodedData.length; i++) {
    this.EncodedData[i] = this._encodeSingle(this.DecodedData[i])
  }
}

/**
 *@param {Byte|Number}code
 *@return {Float|Number}
 */
RadarNetFormat.prototype._decodeSingle = function (code) {
  if (code == this.m_invalidCode) return this.m_invalidValue
  else if (code == this.m_ranfoldCode) return this.m_ranfoldValue
  else return (code - this.Header.Offset) / this.Header.Scale
}
/**
 *解码
 */
RadarNetFormat.prototype.Decode = function () {
  if (this.EncodedData == null) {
    throw new Error('编码数据未加载')
  }
  if (this.DecodedData != null && this.DecodedData.length) {
    return
  }
  this.DecodedData = new Float32Array(this.EncodedData.length)
  for (var i = 0; i < this.EncodedData.length; i++) {
    this.DecodedData[i] = this._decodeSingle(this.EncodedData[i])
  }
}

/**
 *@param {String}fileName
 */
RadarNetFormat.prototype.SaveAs = function (fileName) {}
/**
 *@param {Number}elevationIndex 仰角层索引
 *@param {Number}azimuthIndex 方位角索引
 *@param {Number}radialIndex 径向索引
 *@return {Number}
 */
RadarNetFormat.prototype.get = function (
  elevationIndex,
  azimuthIndex,
  radialIndex
) {
  var gates = this.Header.Gates[this.Header.BandNo]
  var offset = elevationIndex * 360 * gates + azimuthIndex * gates + radialIndex
  return this.map(offset)
}

/**
 *@param {Number}elevationIndex 仰角层索引
 *@param {Number}azimuthIndex 方位角索引
 *@param {Number}radialIndex 径向索引
 *@return {Number}
 */
RadarNetFormat.prototype.getOriginVal = function (
  elevationIndex,
  azimuthIndex,
  radialIndex
) {
  var gates = this.Header.Gates[this.Header.BandNo]
  var offset = elevationIndex * 360 * gates + azimuthIndex * gates + radialIndex
  return {
    val: this.EncodedData[offset],
    offset: offset,
  }
}

/**
 *@param {Number} offset 偏移角
 *@return {Number}
 */
RadarNetFormat.prototype.map = function (offset) {
  if (this.DecodedData && this.DecodedData.length) {
    return {
      val: this.DecodedData[offset],
      offset: offset,
    }
  } else {
    return {
      val: this._decodeSingle(this.EncodedData[offset]),
      offset: offset,
    }
  }
}
/**
 *@param {Number}elevationIndex 仰角层索引
 *@param {Number}azimuthIndex 方位角索引
 *@param {Number}radialIndex 径向索引
 *@param {Number}val 雷达数据值
 *@param {Boolean}[encoded=false] 传入的值是否为已经编码的值，true表示已编码，false表示未编码，默认为false
 *@return {Number}
 */
RadarNetFormat.prototype.set = function (
  elevationIndex,
  azimuthIndex,
  radialIndex,
  val,
  encoded
) {
  var gates = this.Header.Gates[this.Header.BandNo]
  var offset = elevationIndex * 360 * gates + azimuthIndex * gates + radialIndex
  if (encoded) {
    if (!this.EncodedData || this.EncodedData.length == 0)
      this.EncodedData = new Uint8Array(
        gates * 360 * this.Header.ElevationCount
      )
    this.EncodedData[offset] = val
  } else {
    if (!this.DecodedData || this.DecodedData.length == 0)
      this.DecodedData = new Float32Array(
        gates * 360 * this.Header.ElevationCount
      )
    this.DecodedData[offset] = val
  }
}

/**
 *@param {Number}elevationIndex 仰角层索引
 *@param {Number}azimuthIndex 方位角索引
 *@param {Number}radialIndex 径向索引
 *@param {Number}val 雷达数据值
 *@param {Boolean}[encoded=false] 传入的值是否为已经编码的值，true表示已编码，false表示未编码，默认为false
 *@return {x y z}
 */
RadarNetFormat.prototype.polar2Cartesian = function (
  elevationIndex,
  azimuthIndex,
  radialIndex
) {
  // 仰角弧度
  var elevaRadian = Cesium.Math.toRadians(
    this.Header.Elevations[elevationIndex]
  )

  // 方位角
  var azimuthRadian = Cesium.Math.toRadians(azimuthIndex)

  // 距离
  var distance = radialIndex * this.Header.GateSizeOfReflectivity

  var y = Math.sin(elevaRadian) * distance
  var xz = Math.cos(elevaRadian) * distance

  var z = Math.sin(azimuthRadian) * xz
  var x = Math.cos(azimuthRadian) * xz

  return [x, y, z]
}

RadarNetFormat.prototype._computeProjectionParams = function () {
  var rDistance =
    this.Header.GateSizeOfReflectivity *
    this.Header.Gates[this.Header.BandNo] *
    Math.cos(Cesium.Math.toRadians(this.Header.Elevations[0]))
  var lonlatDistance = 2.0 * rDistance
  this.ProjParams.d = lonlatDistance

  var maxZDistance =
    this.Header.GateSizeOfReflectivity *
    this.Header.Gates[this.Header.BandNo] *
    Math.sin(
      Cesium.Math.toRadians(
        this.Header.Elevations[this.Header.Elevations.length - 1]
      )
    )
  this.ProjParams.h = maxZDistance
}
/**
 *
 *@param {Blob|File}blobOrUrl
 *@return {Promise.<RadarNetFormat>}
 */
RadarNetFormat.Load = function (blob) {
  if (!(blob instanceof Blob) && !(blob instanceof File)) {
    //如果给定blobOrUrl参数是文件地址则先下载后解析
    if (typeof blob == 'string') {
      // return Cesium.loadWithXhr({ url: blob, responseType: 'blob' }).then(
      //   function (blob) {
      //     return RadarNetFormat.Load(blob)
      //   }
      // )
    } else {
      throw new Error('blobOrUrl参数类型有误')
    }
  }

  //开始解析

  //先读取magic和headlength部分，验证文件格式和获取雷达文件头的长度（字节数）
  var header = blob.slice(blob.size - 5, blob.size)
  return File.readAllBytes(header).then(function (bytes) {
    var data = new RadarNetFormat()
    data.Header = new RadarNetHeader()
    data.Header.HeadLength = bytes[0]

    //解析雷达文件头
    header = blob.slice(blob.size - data.Header.HeadLength, blob.size)
    function release() {
      data.Header = null
      data = null
      header = null
    }
    return File.readAllBytes(header)
      .then(function (bytes) {
        if (data.Header.FromBytes(bytes)) {
          //获取png文件主体（base64格式）
          return File.readAsDataURL(blob)
            .then(function (dataUrl) {
              data.TextureUrl = dataUrl

              //获取png像素，即雷达数据（已编码）
              return ImageUtil.getPixels(dataUrl)
                .then(function (pixels) {
                  data.EncodedData = new Uint8Array(pixels.length / 4)
                  // data.Pixels = pixels;
                  var index = 0
                  for (var i = 0; i < pixels.length; i += 4) {
                    if (pixels[i + 3] == 0) {
                      data.EncodedData[index++] = data.m_invalidCode
                    } else {
                      data.EncodedData[index++] = pixels[i]
                    }
                  }
                  data._computeProjectionParams()
                  return data //返回网络传输格式（RadarNetFormat）的雷达数据
                })
                .otherwise(function (err) {
                  release()
                  throw err
                })
            })
            .otherwise(function (err) {
              release()
              throw err
            })
        } else {
          throw new Error('给定文件（流）不是天气雷达数据网络传输格式')
        }
      })
      .otherwise(function (err) {
        release()
        throw err
      })
  })
}

RadarNetFormat.RadarNetHeader = RadarNetHeader

export default RadarNetFormat
