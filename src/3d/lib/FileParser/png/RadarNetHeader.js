/**
 *天气雷达数据网络传输格式——文件头（存放在png文件末尾）
 */
export default function RadarNetHeader() {
  /// <summary>
  /// 文件标记
  /// </summary>
  this.Magic = null
  /// <summary>
  /// 文件头大小（字节数）
  /// </summary>
  this.HeadLength = 0
  /// <summary>
  /// 要素编号（0：R——反射率，1：V——速度，2：W——谱宽）
  /// </summary>
  this.BandNo = 0
  /// <summary>
  /// 雷达位置（按经度、纬度、海拔高度依次存储）
  /// </summary>
  this.Position = []
  /// <summary>
  /// 库数数组（按反射率、速度、谱宽的库数依次存储）
  /// </summary>
  this.Gates = []
  /// <summary>
  /// 反射率的距离库长（单位：米）
  /// </summary>
  this.GateSizeOfReflectivity = 0
  /// <summary>
  /// 用于编、解码的截距，径向数据值 = (存储值-Offset)/Scale
  /// </summary>
  this.Offset = 0
  /// <summary>
  /// 用于编、解码的系数，径向数据值 = (存储值-Offset)/Scale
  /// </summary>
  this.Scale = 0
  /// <summary>
  /// 仰角层数
  /// </summary>
  this.ElevationCount = 0
  /// <summary>
  /// 从底到高的各层仰角（单位数角度）
  /// </summary>
  this.Elevations = []
}
/// <summary>
/// 从字节数组中解析雷达文件头
/// </summary>
/// <param name="bytes"></param>
RadarNetHeader.prototype.FromBytes = function (bytes) {
  var mg = bytes.length - 1 - 3
  this.Magic = String.fromCharCode(
    bytes[mg],
    bytes[mg + 1],
    bytes[mg + 2],
    bytes[mg + 3]
  )
  if (this.Magic != 'rada') return false

  this.HeadLength = bytes[bytes.length - 1 - 4]
  var floatArr = new Float32Array(bytes.buffer, 0, (this.HeadLength - 5) / 4)

  this.BandNo = floatArr[0]
  this.Position = new Float32Array([floatArr[1], floatArr[2], floatArr[3]])
  this.Gates = new Float32Array([floatArr[4], floatArr[5], floatArr[6]])
  this.GateSizeOfReflectivity = floatArr[7]
  this.Offset = floatArr[8]
  this.Scale = floatArr[9]
  this.ElevationCount = floatArr[10]
  this.Elevations = new Float32Array(floatArr.length - 11)
  for (var i = 0; i < this.Elevations.length; i++) {
    this.Elevations[i] = floatArr[11 + i]
  }
  return true
}

/**
 *生成雷达文件头字节
 *@return {Uint8Array}
 */
RadarNetHeader.prototype.ToBytes = function () {
  var floatList = []
  floatList.push(this.BandNo)
  floatList.push(this.Position[0], this.Position[1], this.Position[2])
  floatList.push(this.Gates[0], this.Gates[1], this.Gates[2])
  floatList.Add(this.GateSizeOfReflectivity)
  floatList.Add(this.Offset)
  floatList.Add(this.Scale)
  floatList.Add(this.ElevationCount)
  for (var i = 0; i < this.Elevations.length; i++) {
    floatList.Add(this.Elevations[i])
  }
  var floatArr = new Float32Array(floatList)
  var floatArrBytes = new Uint8Array(floatArr.buffer)

  var bytes = new Uint8Array(floatArr.length * 4 + 1 + 4)
  for (var i = 0; i < floatArrBytes.length; i++) {
    bytes[i] = floatArrBytes[i]
  }

  bytes[bytes.length - 1 - 4] = bytes.length

  this.Magic = 'rada'
  for (var i = 0; i < this.Magic.length; i++) {
    bytes[bytes.length - 1 - 3 + i] = this.Magic.charCodeAt(i)
  }
  return bytes
}

//    return RadarNetHeader;
//})
