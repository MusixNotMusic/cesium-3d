import * as Cesium from 'cesium'

/**
 *@class
 *@memberof MeteoLib.Util
 */
function Path() {}
/**
 *
 *获取文件扩展名（后缀）
 *@param {String}fname 文件名
 */
Path.GetExtension = function (fname) {
  var start = fname.lastIndexOf('.')
  if (start >= 0) {
    return fname.substring(start, fname.length)
  }
  return ''
}

/**
 *
 *获取文件扩展名（后缀）
 *@param {String}fname 文件名
 */
Path.GetFileName = function (fname) {
  var start = fname.lastIndexOf('/')
  if (start < 0) {
    return fname
  }
  return fname.substring(start + 1, fname.length)
}
/**
 *
 *获取文件夹
 *@param {String}fname 文件名
 */
Path.GetDirectoryName = function (fname) {
  var start = fname.lastIndexOf('/')
  if (start < 0) {
    return ''
  }
  return fname.substring(0, start)
}
/**
 *
 *合并文件目录和文件名
 *@param {String}dir 文件目录
 *@param {String}fname 文件名
 *@return {String}
 */
Path.Combine = function (dir, fname) {
  return dir + fname
}
/**
 *拼接路径
 *@param {Array.<String>|Any}arguments
 *@return {String}
 */
Path.join = function () {
  var paths = []
  var srcArguments = arguments
  if (srcArguments.length == 1 && Cesium.isArray(srcArguments[0])) {
    srcArguments = srcArguments[0]
  }
  srcArguments.forEach(function (path) {
    if (path.length > 1 && path[path.length - 1] == '/') {
      path = path.substr(0, path.length - 1)
    }
    paths.push(path)
  })
  return paths.join('/')
}

/**
 *
 *@param {String} fname
 *@param {String} newExt
 */
Path.ChangeExtension = function (fname, newExt) {
  return fname.replace(Path.GetExtension(fname), newExt)
}
//    return Path;
//});
/**
 *
 * @param {String} fname
 * @return {String}
 */
Path.GetFileNameWithoutExtension = function (fname) {
  fname = Path.GetFileName(fname)
  fname = Path.ChangeExtension(fname, '')
  return fname
}

export default Path
