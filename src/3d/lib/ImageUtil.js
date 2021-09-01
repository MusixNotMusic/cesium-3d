import * as Cesium from 'cesium'

function ImageUtil() {}

ImageUtil.getPixels = function (imgUrl) {
  var defer = Cesium.when.defer()

  //return new Promise(function (resolve, reject) {
  var image = new Image()
  image.src = imgUrl
  image.onload = function () {
    var img_width = this.width
    var img_height = this.height
    var canvas = document.createElement('canvas')
    var context = canvas.getContext('2d')
    // 设置画布尺寸
    canvas.width = img_width
    canvas.height = img_height
    // 将图片按像素写入画布
    context.drawImage(this, 0, 0, img_width, img_height)

    // 读取图片像素信息
    var imageData = context.getImageData(0, 0, img_width, img_height)
    defer.resolve(imageData.data)
  }
  image.onerror = function (err) {
    defer.reject(err)
  }
  return defer
}

export default ImageUtil
