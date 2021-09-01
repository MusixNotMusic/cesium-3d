/**
 * 图片处理工具类
 *@memberof MeteoLib.Util
 *@constructor
 */
function ImageUtil() {}
/**
 *获取图片像素（r、g、b、a）
 *@param {String} imgUrl
 *@returns {Promise.<Uint8ClampedArray>}
 */
ImageUtil.getPixels = function (imgUrl, outSize) {
  if (!outSize) {
    outSize = []
  }
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
    ;(outSize[0] = this.width), (outSize[1] = this.height)
    defer.resolve(imageData.data)
  }
  image.onerror = function (err) {
    defer.reject(err)
  }
  return defer
  //});
}
ImageUtil.fromPixels = function (pixels, width, height) {
  var img_width = width
  var img_height = height
  var canvas = document.createElement('canvas')
  var context = canvas.getContext('2d')
  // 设置画布尺寸
  canvas.width = img_width
  canvas.height = img_height

  // 读取图片像素信息
  var imageData = context.getImageData(0, 0, img_width, img_height)
  for (var i = 0; i < pixels.length; i++) {
    imageData.data[i] = pixels[i]
  }
  context.putImageData(imageData, 0, 0)
  return canvas
}

/**
 *
 * @param {Object} options
 * @param {Object} options.x
 * @param {Number} options.x.count
 * @param {Number} options.x.distance
 * @param {Number} [options.x.label]
 * @param {Object} options.y
 * @param {Number} options.y.count
 * @param {Number} options.y.distance
 * @param {Number} [options.y.label]
 * @param {Object} [options.offset]
 * @param {Array.<HTMLCanvasElement|HTMLImageElement|HTMLVideoElement>|Array.<Object>} [options.baseLayers]
 * @param {Number} [options.offset.left=40]
 * @param {Number} [options.offset.top=40]
 * @param {Number} [options.offset.bottom=30]
 * @param {Number} [options.offset.right=50]
 * @param {String} [options.title='']
 * @param {Object} [options.clientSize]
 * @param {Number} [options.clientSize.width=512]
 * @param {Number} [options.clientSize.height=256]
 * @param {Number} [options.fontSize=16]
 * @param {String} [options.backColor='rgb(101,101,10)']
 * @param {HTMLCanvasElement} [options.target]
 */
ImageUtil.drawGrid = function (options) {
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
    fontSize = 16
  }
  if (!baseLayers) {
    baseLayers = []
  }
  if (!clientSize) {
    clientSize = { width: 512, height: 256 }
  }
  if (!backColor) {
    backColor = 'rgb(101,101,101)'
  }
  if (!offset) offset = {}
  offset = Object.assign(offset, {
    left: 40,
    top: 40,
    bottom: 30,
    right: 50,
    width: function () {
      return this.left + this.right
    },
    height: function () {
      return this.top + this.bottom
    },
  })

  var newCv = target ? target : document.createElement('canvas')
  newCv.width = clientSize.width + offset.width()
  newCv.height = clientSize.height + offset.height()
  var ctx = newCv.getContext('2d')

  ctx.font = fontSize + 'px arial'
  ctx.strokeStyle = 'rgba(255,255,255,1)'
  ctx.fillStyle = 'rgba(255,255,255,1)'

  if (yOptions.label) {
    offset.top += fontSize
    offset.left += ctx.measureText(yOptions.label).width / 2
  }
  if (xOptions.label) {
    offset.bottom += fontSize
    offset.right += ctx.measureText(xOptions.label).width / 2
  }
  newCv.width = clientSize.width + offset.width()
  newCv.height = clientSize.height + offset.height()
  ctx = newCv.getContext('2d')

  ctx.fillStyle = backColor
  ctx.fillRect(0, 0, newCv.width, newCv.height)

  ctx.font = fontSize + 'px Microsoft YaHei'
  ctx.strokeStyle = 'rgba(255,255,255,1)'
  ctx.fillStyle = 'rgba(255,255,255,1)'

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
    ctx.drawImage(
      layer.image,
      layer.position.x + offset.left,
      layer.position.y + offset.top,
      layer.size.width,
      layer.size.height
    )
  }

  var deltX = clientSize.width / xOptions.count
  var deltY = clientSize.height / yOptions.count
  for (var i = 0; i < yOptions.count; i++) {
    for (var j = 0; j < xOptions.count; j++) {
      ctx.strokeRect(
        j * deltX + offset.left,
        i * deltY + offset.top,
        deltX,
        deltY
      )
    }
  }

  var deltDisY = yOptions.distance / yOptions.count
  var deltDisX = xOptions.distance / xOptions.count

  var i
  var txtLen, txt, posX, poxY
  for (i = 0; i <= yOptions.count; i++) {
    txt = ((yOptions.count - i) * deltDisY).toFixed(1)
    txtLen = ctx.measureText(txt).width
    posX = offset.left - txtLen - 5
    poxY = i * deltY + fontSize / 3 + offset.top
    ctx.fillText(txt, posX, poxY)
  }
  if (yOptions.label) {
    poxY = offset.top - fontSize
    txt = yOptions.label
    txtLen = ctx.measureText(txt).width
    posX = offset.left - txtLen - 5
    ctx.fillText(txt, posX, poxY)

    //ctx.fillText(txt, i * deltX + offset.left - txtLen, clientSize.height + fontSize + 5 + offset.top)
  }

  for (i = 0; i <= xOptions.count; i++) {
    txt = (i * deltDisX).toFixed(1)
    txtLen = ctx.measureText(txt).width
    posX = i * deltX + offset.left - txtLen / 2
    posY = clientSize.height + fontSize + 5 + offset.top
    ctx.fillText(txt, posX, posY)
  }
  if (xOptions.label) {
    posX = posX + txtLen + 5
    txt = xOptions.label
    txtLen = ctx.measureText(txt).width
    posY = clientSize.height + fontSize + 5 + offset.top
    ctx.fillText(txt, posX, posY)
  }

  fontSize = 18
  ctx.font = fontSize + 'px FangSong'

  if (title) {
    var txtLen = ctx.measureText(title).width
    ctx.strokeText(title, (newCv.width - txtLen) / 2, offset.top - fontSize - 5)
  }
  return newCv
}
export default ImageUtil
