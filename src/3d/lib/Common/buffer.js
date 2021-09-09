
// import textEncoding from 'text-encoding'
const TextDecoder = window.TextDecoder;
/** 获取字节十进制 **/
String.prototype.getBytes = function () {
  var bytes = []
  for (var i = 0; i < this.length; i++) {
    var charCode = this.charCodeAt(i)
    var cLen = Math.ceil(Math.log(charCode) / Math.log(256))
    for (var j = 0; j < cLen; j++) {
      bytes.push((charCode << (j * 8)) & 0xFF)
    }
  }
  return bytes
}


const buffer = {
  /*
   * @从buffer中读取目标数据
   * */
  getArrFromBuffer: function (buffers, pos, type, num) {
    let arr = []

    switch (type) {
      case 'Int8':
        if (buffers.byteLength < pos + num) throw new Error('sub-region exceeds array bounds.')
        arr = new Int8Array(buffers, pos, num)
        break
      case 'Uint8':
        if (buffers.byteLength < pos + num) throw new Error('sub-region exceeds array bounds.')
        arr = new Uint8Array(buffers, pos, num)
        break
      case 'Int16':
        if (buffers.byteLength < pos + num * 2) throw new Error('sub-region exceeds array bounds.')
        arr = new Int16Array(buffers.slice(pos, pos + num * 2), 0, num)
        break
      case 'Uint16':
        if (buffers.byteLength < pos + num * 2) throw new Error('sub-region exceeds array bounds.')
        arr = new Uint16Array(buffers.slice(pos, pos + num * 2), 0, num)
        break
      case 'Int32':
        if (buffers.byteLength < pos + num * 4) throw new Error('sub-region exceeds array bounds.')
        arr = new Int32Array(buffers.slice(pos, pos + num * 4), 0, num)
        break
      case 'Uint32':
        if (buffers.byteLength < pos + num * 4) throw new Error('sub-region exceeds array bounds.')
        arr = new Uint32Array(buffers.slice(pos, pos + num * 4), 0, num)
        break
      case 'Float32':
        if (buffers.byteLength < pos + num * 4) throw new Error('sub-region exceeds array bounds.')
        arr = new Float32Array(buffers.slice(pos, pos + num * 4), 0, num)
        break
      case 'Float64':
        if (buffers.byteLength < pos + num * 8) throw new Error('sub-region exceeds array bounds.')
        arr = new Float64Array(buffers.slice(pos, pos + num * 8), 0, num)
        break
      default:
        console.log(type + 'is undefined')
        break
    }
    arr.name = type
    return arr
  },
  /* 向buffer中写入数据。
   * 当type 为Uint8、Int8时，len表示长度，con表示字符串内容，内容长度不够的用0补齐；
   * 当type 为非(Uint8或、Int8)时,len表示需要写入type的个数，con表示type对应的数组，不够的个数用0补齐
   **/
  setConForDataView: function (dataview, pos, type, len, con) {
    if (!con || !len) return
    let i = 0
    switch (type) {
      case 'Int8':
        for (i = 0; i < con.length; i++) {
          dataview.setInt8(pos + i, con.getBytes()[i], true)
        }
        if (con.length < len) {
          for (i = con.length; i < len; i++) {
            dataview.setInt8(pos + i, 0, true)
          }
        }
        break
      case 'Uint8':
        for (i = 0; i < con.length; i++) {
          dataview.setUint8(pos + i, con.getBytes()[i], true)
        }
        if (con.length < len) {
          for (i = con.length; i < len; i++) {
            dataview.setUint8(pos + i, 0, true)
          }
        }
        break
      case 'Int16' :
        for (i = 0; i < con.length; i++) {
          dataview.setInt16(pos + i * 2, con[i], true)
        }
        if (con.length < len) {
          for (i = con.length; i < len; i++) {
            dataview.setInt16(pos + i * 2, 0, true)
          }
        }
        break
      case 'Uint16' :
        for (i = 0; i < con.length; i++) {
          dataview.setUint16(pos + i * 2, con[i], true)
        }
        if (con.length < len) {
          for (i = con.length; i < len; i++) {
            dataview.setUint16(pos + i * 2, 0, true)
          }
        }
        break
      case 'Int32' :
        for (i = 0; i < con.length; i++) {
          dataview.setInt32(pos + i * 4, con[i], true)
        }
        if (con.length < len) {
          for (i = con.length; i < len; i++) {
            dataview.setInt32(pos + i * 4, 0, true)
          }
        }
        break
      case 'Uint32' :
        for (i = 0; i < con.length; i++) {
          dataview.setUint32(pos + i * 4, con[i], true)
        }
        if (con.length < len) {
          for (i = con.length; i < len; i++) {
            dataview.setUint32(pos + i * 4, 0, true)
          }
        }
        break
      case 'Float32' :
        for (i = 0; i < con.length; i++) {
          dataview.setFloat32(pos + i * 4, con[i], true)
        }
        if (con.length < len) {
          for (i = con.length; i < len; i++) {
            dataview.setFloat32(pos + i * 4, 0, true)
          }
        }
        break
      case 'Float64' :
        for (i = 0; i < con.length; i++) {
          dataview.setFloat64(pos + i * 8, con[i], true)
        }
        if (con.length < len) {
          for (i = con.length; i < len; i++) {
            dataview.setFloat64(pos + i * 8, 0, true)
          }
        }
        break
      default:
        break
    }
  },
  /** 字符串编码 */
  textEncoder (str, textCodeRule = 'gbk') {
    let arr = []
    if (str) {
      arr = new textEncoding.TextEncoder(textCodeRule, {NONSTANDARD_allowLegacyEncoding: true}).encode(str)
    }
    return arr
  },
  /** 字符串解码 */
  textDecoder (arr, textCodeRule = 'gbk') {
    let str = ''
    if (arr) {
      let index = arr.findIndex(item => {
        return item === 0
      })
      if (index !== -1)arr = arr.slice(0, index)
      str = new TextDecoder(textCodeRule).decode(arr)
    }
    return str
  },
  getStringFromTypedArray: function (uint8Array, byteOffset, byteLength,  textCodeRule = 'gbk') {
    if (!uint8Array) throw new Error('uint8Array is undefined.')
    if (byteOffset < 0) throw new Error('byteOffset cannot be negative.')
    if (byteLength < 0) {
      throw new Error('byteLength cannot be negative.')
    }
    if ((byteOffset + byteLength) > uint8Array.byteLength) {
      throw new Error('sub-region exceeds array bounds.')
    }
    byteOffset = byteOffset !== undefined ? byteOffset : 0
    byteLength = byteLength !== undefined ? byteLength : uint8Array.byteLength - byteOffset
    uint8Array = uint8Array.subarray(byteOffset, byteOffset + byteLength)
    let index = uint8Array.findIndex(item => {
      return item === 0
    })
    uint8Array = uint8Array.slice(0, index)
    if (typeof TextDecoder !== 'undefined') {
      var decoder = new TextDecoder(textCodeRule) // 中文编码是gbk
      return decoder.decode(uint8Array)
    } else {
      return String.fromCharCode.apply(null, uint8Array)
    }
  },
  getValueFromTypedArray: function (typedArray, type = '', textCodeRule = 'gbk') {
    if (typedArray.name !== undefined) {
      switch (typedArray.name) {
        case 'Float32':
        case 'Float64':
          return parseFloat(typedArray)
        case 'Int32':
        case 'Uint32':
        case 'Int16':
        case 'Uint16':
          return parseInt(typedArray)
        default :
          if (type === 'int') return parseInt(typedArray)
          let index = typedArray.findIndex(item => {
            return item === 0
          })
          if (index === -1)index = typedArray.byteLength// 当index=-1时，找不到文件结束符，强制等于文件长度
          typedArray = typedArray.slice(0, index)
          if (typeof TextDecoder !== 'undefined') {
            var decoder = new TextDecoder(textCodeRule) // 中文编码是gbk
            return decoder.decode(typedArray)
          } else {
            return String.fromCharCode.apply(null, typedArray)
          }
      }
    } else {
      throw new Error('typedArray must be created by getArrFromBuffer function')
    }
  },
  getValueFromTypedArray1: function (typedArray, type = '', textCodeRule = 'gbk') {
    if (typedArray.name !== undefined) {
      if (type === 'int') return parseInt(typedArray)
      if (typeof TextDecoder !== 'undefined') {
        var decoder = new TextDecoder(textCodeRule) // 中文编码是gbk
        return decoder.decode(typedArray)
      } else {
        return String.fromCharCode.apply(null, typedArray)
      }
    } else {
      throw new Error('typedArray must be created by getArrFromBuffer function')
    }
  },
  load: function (url, callback, type = '', param = null, callBackLoadErr = null, responseKey, textCodeRule = 'gbk') {
    let xhr
    if (window.XMLHttpRequest) {
      xhr = new XMLHttpRequest()
    } else if (window.ActiveXObject) {
      xhr = new ActiveXObject() // 兼容ie的做法
    } else {
      xhr = false
    }
    if (!xhr) return
    if (url.indexOf('.xml') !== -1 || url.indexOf('.clr') !== -1) {
      url += '?' + new Date().getTime()
    }
    xhr.open('GET', url)
    if (responseKey === 'responseXML') {
      xhr.overrideMimeType('text/xml;charset=' + textCodeRule)
    } else {
      if (type !== '') xhr.responseType = type
    }

    xhr.onreadystatechange = function () {
      switch (xhr.readyState) {
        case 4:
          // 加载完成
          let temp = responseKey ? xhr[responseKey] : xhr.response
          if (xhr.status === 200) {
            if (temp) {
              if (callback && typeof callback === 'function') {
                if (param !== null) {
                  callback && callback(temp, param)
                } else {
                  callback && callback(temp)
                }
              }
            }
          } else if (xhr.status === 404) {
            callBackLoadErr && callBackLoadErr(xhr)
          }

          break
        default:
          // 0=uninitialized, 1=open, 2=sent, 3=receiving, 4=loaded.
          // console.log('状态码：',xhr.readyState);
          break
      }
    }
    xhr.send()
  },

  getBytes: function (str) {
    var bytes = []
    for (var i = 0; i < str.length; i++) {
      var charCode = str.charCodeAt(i)
      var cLen = Math.ceil(Math.log(charCode) / Math.log(256))
      for (var j = 0; j < cLen; j++) {
        bytes.push((charCode << (j * 8)) & 0xFF)
      }
    }
    return bytes
  }
}

export default {
  ...buffer
}
