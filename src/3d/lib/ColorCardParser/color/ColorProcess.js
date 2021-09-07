/**
 * 色标文件处理
 * 20200827 增加色标变换处理
 */
import buffer from '../../Common/buffer';
import ProductType from '@/3d/lib/Common/productType/ProductType';
// import productConfig from '../product/common/productConfig'

import { getKCheiStrFromVal, getCloudCoverText, getHCLStrFromVal, getSEIStrFromVal, getCloudShape, getCHCLText } from './ColorDescribe'

export default class ColorProcess {
  // ***************************** 色标文件头（_CLRFILEHEAD）***************************** //
  /**
   * 色标文件头 </b> No.1：控制回波绘制方式 ，1渐进色，0、2色块</b> 字节位置偏移：0;</b>  【2】short int:3
   */
  _EchoShowType = 0
  /**
   * 色标文件头 </b> No.1：控制色标绘制方式 ，1渐进色，0、2色块</b> 字节位置偏移：0;</b>  【2】short int:3
   * @type {number}
   * @private
   */
  _BlockShowType = 0
  /**
   * 色标文件头 </b> No.1：控制色标显示方式 ，0:大的值在下，1:大值在上</b> 字节位置偏移：0;</b>  【2】short int:2
   * @type {number}
   * @private
   */
  _viewType = 0 // 区别于下面的_spa
  /** 色标文件头 </b> No.1：</b> 字节位置偏移：0;</b>  【2】short int:8 */
  _spaVer = 0;// 区别于下面的_spa
  /**
   * 色标文件头 </b> No.2：颜色文件对应的产品名称  </b> 字节位置偏移：2;</b>  【50】char 50*1
   * @type {string}
   * @private
   */
  _szNameHead = ''
  /**
   * 色标文件头 </b> No.3：对应的产品编号 </b> 字节位置偏移：52;</b>  【2】short int
   * @type {string}
   * @private
   */
  _sID = ''
  /**
   * 色标文件头 </b> No.4：颜色域的个数 </b> 字节位置偏移：54;</b>  【2】short int
   * @type {number}
   * @private
   */
  _sFieldCnt = 0
  /**
   * 色标文件头 </b> No.5：总共有的颜色色块数目 </b> 字节位置偏移：56;</b>  【4】 int
   * @type {number}
   * @private
   */
  _iColorCnt = 0
  // ***************************** 颜色域信息描述（_CLRFILEFIELD）***************************** //
  /**
   * 颜色域信息 </b> No.1：显示的颜色的块数</b> 字节位置偏移：60;</b>  【2】unsigned short
   * @type {number}
   * @private
   */
  _sCount = 0
  /**
   * 颜色域信息 </b> No.2-1：小数点的显示位数； </b> 字节位置偏移：62;</b>  【2】unsigned short iPreCnt:3
   * @type {number}
   * @private
   */
  _iPreCnt = 0
  /**
   * 颜色域信息 </b> No.2-2： ； </b> 字节位置偏移：62;</b>  【2】unsigned short spa:13
   * @type {number}
   * @private
   */
  _spa = 0
  /**
   * 颜色域信息 </b> No.3：颜色域第一颜色数据在列表中的序号； </b> 字节位置偏移：64;</b>  【4】unsigned int
   * @type {number}
   * @private
   */
  _iIndex = 0
  /**
   * 颜色域信息 </b> No.4：Field's Name产品名称</b> 字节位置偏移：68;</b>  【40】char 40*1
   * @type {string}
   * @private
   */
  _szNameField = ''
  /**
   * 颜色域信息 </b> No.5：单位</b> 字节位置偏移：108;</b>  【12】char 12*1
   * @type {string}
   * @private
   */
  _szUnit = ''
  /**
   * 颜色域信息 </b> No.6：the normal min value </b> 字节位置偏移：120;</b>  【4】float
   * @type {number}
   * @private
   */
  _min = 0
  /**
   * 颜色域信息 </b> No.7：the normal max value </b> 字节位置偏移：124;</b>  【4】float
   * @type {number}
   * @private
   */
  _max = 0
  /**
   * 颜色域信息 </b> No.8：the normalization min value </b> 字节位置偏移：128;</b>  【4】unsigned int
   * @type {number}
   * @private
   */
  _iMin = 0
  /**
   * 颜色域信息 </b> No.9：the normalization max value </b> 字节位置偏移：132;</b>  【4】unsigned int
   * @type {number}
   * @private
   */
  _iMax = 0
  /**
   * 颜色域信息 </b> No.10：  </b> 字节位置偏移：136;</b>  【4】unsigned int
   * @type {number}
   * @private
   */
  _type = 0
  _MAX_CLR_NUM=256
  /**
   * 解析详细信息
   * @type {null}
   */
  phraseClrFileArr = null
  /**
   * 颜色数组，大小为MAX_CLR_NUM，供绘图使用
   * @type {null}
   */
  colorArray = null
  /**
   * 颜色数组，大小为MAX_CLR_NUM，供绘色标使用
   * @type {null}
   */
  colorArrayDrawClr = null
  /**
   * 保存色标文件名称
   * @type {string}
   */
  clrFName = ''
  /** 每色域映射真值[1/255份代表的真值]，
   * fValPer = (this._max - this._min) / (this._iMax - this._iMin)
   * 公式N(色域索引) = Kv(真值) + b中的k===1/fValPer，b=_this.iMin-k*this._min=this._iMin-this._min*(this._iMax - this._iMin)/(this._max - this._min)
   * @type {Number}
   * */
  fValPer = 0
  /**
   * fValPer = (this._max - this._min) / (this._iMax - this._iMin)
   * 公式N(色域索引) = Kv(真值) + b中的k===1/fValPer，b=_this.iMin-k*this._min=this._iMin-this._min*(this._iMax - this._iMin)/(this._max - this._min)
   * @type {Number}
   * */
  b = 0
  // eslint-disable-next-line no-useless-constructor
  constructor () {
  }

  /**
   * 加载色标文件
   * @param fileName 色标文件名
   * @param type 类型
   * @param callback 回调
   * @param baseURL 色标路径前缀 Clr/
   */
  init (fileName, baseURL, callback) {
    if (!fileName) return
    buffer.load(baseURL + fileName, resp => {
      this.PhraseColorFile(resp, fileName)
      if (callback && typeof callback === 'function') {
        callback()
      }
    }, 'arraybuffer')
  }

  initPromise (fileName, baseURL) {
     return new Promise((resolve, reject) => {
        if (!fileName) reject(new Error('fileName is Empty'));
        buffer.load(baseURL + fileName, resp => {
          this.PhraseColorFile(resp, fileName)
          resolve(this)
        }, 'arraybuffer')
     })
  }



  /**
   * 将R,G,B转换成flex中的整形表示方式</b>
   * C++中的R是最低位，B是最高位
   * flex中的R是最高位，B是最低位
   * @param red
   * @param green
   * @param blue
   * @return {*}
   */
  calRGB (red, green, blue) {
    red = Math.floor(red)
    green = Math.floor(green)
    blue = Math.floor(blue)
    // 必须用括号，有优先级
    const rgb = (red << 16) + (green << 8) + blue
    return rgb
  }

  /**
   * 将R,G,B转换成WEB中的16进制表示方式
   * C++中的R是最低位，B是最高位
   * flex中的R是最高位，B是最低位
   * @param red
   * @param green
   * @param blue
   * @return {string}
   */
  calRGBStr16 (red, green, blue) {
    // 必须用括号，有优先级
    const rgb = this.calRGB(red, green, blue)
    let rgbStr = rgb.toString(16)
    // red 为0的时候转换的字符串不对
    if (rgbStr.length < 6)rgbStr = this.buqiString(rgbStr, 6)
    return '#' + rgbStr
  }

  /**
   * 首先根据C++中的颜色定义规则将输入的颜色值（uint）拆分成红色,绿色和蓝色,将R,G,B用数组返回
   * #define GetRValue(rgb) (LOBYTE(rgb)) #define GetGValue(rgb) (LOBYTE(((WORD)(rgb)) >> 8)) #define GetBValue(rgb) (LOBYTE((rgb)>>16))
   * C++中的R是最低位，B是最高位
   * flex中的R是最高位，B是最低位
   * @param color
   * @return {number[]}
   */
  combinationToRGB (color) {
    const blue = (color >> 16) & 0xff
    const green = (color >> 8) & 0xff
    const red = color & 0xff
    return [red, green, blue]
  }

  /**
   * 解析成色块
   */
  analyblockColor () {
    // 颜色数组
    let colorArray = null
    if (this.phraseClrFileArr) {
      // 颜色数组，大小为MAX_CLR_NUM，供绘图使用
      colorArray = []

      // 填充头:
      let endBlock
      let startBlock = 0
      // 填充中间的
      for (let j = 0, len = this.phraseClrFileArr.length; j < len; j++) {
        endBlock = this.phraseClrFileArr[j].end
        for (let k = startBlock; k < endBlock; k++) {
          colorArray[k] = this.phraseClrFileArr[j].rgbStr_16
        }
        startBlock = endBlock
      }
      // 填充尾部
      startBlock = this.phraseClrFileArr[this.phraseClrFileArr.length - 1].end
      for (let m = startBlock; m < this._MAX_CLR_NUM; m++) {
        colorArray[m] = this.phraseClrFileArr[this.phraseClrFileArr.length - 1].rgbStr_16
      }
      if (this._sID === ProductType.V_TYPE || this._sID === ProductType.W_TYPE) { // 速度谱宽第一块为模糊色
        colorArray[1] = this.calRGBStr16(123, 0, 123)
      }
    }
    return colorArray
  }

  /**
   * 解析成渐进色,20171018解析新格式
   * @return {any[]}
   */
  analyGradualColorNew () {
    const _colorArray = []
    // 填充头:数组前2个元素默认强制为黑色（无论色标文件中有没有黑色）。
    const iBase = this._iIndex
    // _pColor->pField[index].iIndex
    let startBlock = 0
    let endBlock = 2
    let step = endBlock - startBlock
    for (let i = startBlock; i < endBlock; i++) {
      _colorArray.push(this.calRGBStr16(0, 0, 0))
    }

    let r1 = 0
    let r2 = 0
    let g1 = 0
    let g2 = 0
    let b1 = 0
    let b2 = 0
    let dR
    let dG
    let dB
    // 从第3个元素开始直到第256个元素。
    // startBlock = endBlock // 发现bug 注释掉 2019-09-26
    let rgbArr = null
    for (let j = 0; j < this.phraseClrFileArr.length; j++) {
      endBlock = this.phraseClrFileArr[j].end
      if (j === 0) {
        step = (endBlock - startBlock) / 2.0
      } else {
        step = (endBlock - (endBlock - this.phraseClrFileArr[j - 1].end) / 2.0 - startBlock)
      }

      if (step < 1) step = 1
      step = Math.floor(step)

      rgbArr = this.combinationToRGB(this.phraseClrFileArr[j].rgb)
      r2 = rgbArr[0]
      g2 = rgbArr[1]
      b2 = rgbArr[2]

      dR = (r2 - r1) / step
      dG = (g2 - g1) / step
      dB = (b2 - b1) / step

      let k = 0
      for (let n = startBlock; n < startBlock + step; n++) {
        /* _colorArray[n] = calRGB(r1 + dR*k, g1 + dG*k, b1 + dB*k); */
        // C++中的RGB排序跟WEB中的不一样
        _colorArray[n] = this.calRGBStr16(b1 + dB * k, g1 + dG * k, r1 + dR * k)
        k++
      }
      r1 = r2
      g1 = g2
      b1 = b2
      startBlock = startBlock + step
    }
    // 填充尾部
    for (let m = startBlock; m < this._MAX_CLR_NUM; m++) {
      _colorArray[m] = this.phraseClrFileArr[iBase + this.phraseClrFileArr.length - 1].rgbStr_16
    }
    if (this._sID === ProductType.V_TYPE || this._sID === ProductType.W_TYPE) { // 速度谱宽第一块为模糊色
      _colorArray[1] = this.calRGBStr16(123, 0, 123)
    }
    return _colorArray
  }

  /**
   * 解析色标文件内容，初始化
   * @param filedataArrayBuffer
   * @param fileName
   * @constructor
   */
  PhraseColorFile (filedataArrayBuffer, fileName) {
    this.clrFName = fileName
    // ***************************** 色标文件头（_CLRFILEHEAD）*****************************//
    if (filedataArrayBuffer == null || filedataArrayBuffer.byteLength === 0) return
    const sVer = buffer.getArrFromBuffer(filedataArrayBuffer, 0, 'Uint16', 1)
    this._EchoShowType = sVer & 7
    this._BlockShowType = sVer >> 3 & 7
    this._viewType = sVer >> 6 & 3
    this._spaVer = sVer >> 8 & 255

    let arrTemp = buffer.getArrFromBuffer(filedataArrayBuffer, 2, 'Uint8', 50) // 注意：4字节对齐
    this._szNameHead = ''
    for (let i = 0, len = arrTemp.length; i < len; i++) {
      if (arrTemp[i] !== 0) {
        this._szNameHead += String.fromCharCode(arrTemp[i])
      } else {
        break
      }
    }
    arrTemp = buffer.getArrFromBuffer(filedataArrayBuffer, 52, 'Uint16', 2)
    this._sID = arrTemp[0]
    this._sFieldCnt = arrTemp[1]
    arrTemp = buffer.getArrFromBuffer(filedataArrayBuffer, 56, 'Uint32', 1)
    this._iColorCnt = arrTemp[0]
    // ***************************** 颜色域信息描述（_CLRFILEFIELD）*****************************//
    arrTemp = buffer.getArrFromBuffer(filedataArrayBuffer, 60, 'Uint16', 2)
    this._sCount = arrTemp[0]
    this._iPreCnt = arrTemp[1] & 0x07
    this._spa = arrTemp[1] >> 3 & 8191
    arrTemp = buffer.getArrFromBuffer(filedataArrayBuffer, 64, 'Uint32', 1)
    this._iIndex = arrTemp[0]
    arrTemp = buffer.getArrFromBuffer(filedataArrayBuffer, 68, 'Uint8', 40)
    this._szNameField = ''
    for (let i = 0, len = arrTemp.length; i < len; i++) {
      if (arrTemp[i] !== 0) {
        this._szNameField += String.fromCharCode(arrTemp[i])
      } else {
        break
      }
    }
    this._szUnit = buffer.textDecoder(buffer.getArrFromBuffer(filedataArrayBuffer, 108, 'Uint8', 12))
    arrTemp = buffer.getArrFromBuffer(filedataArrayBuffer, 120, 'Float32', 2)
    this._min = arrTemp[0]
    this._max = arrTemp[1]
    arrTemp = buffer.getArrFromBuffer(filedataArrayBuffer, 128, 'Uint32', 3)
    this._iMin = arrTemp[0]
    this._iMax = arrTemp[1]
    this._type = arrTemp[2]

    /** 解析详细信息**/
    this.phraseClrFileArr = []
    // C++中的RGB和Flex中的有差别，需要转换
    let rgbC
    arrTemp = buffer.getArrFromBuffer(filedataArrayBuffer, 140, 'Uint32', this._iColorCnt * 3)
    let cArrTemp = null
    this.fValPer = (this._max - this._min) / (this._iMax - this._iMin)
    this.b = this._iMin - this._min / this.fValPer
    for (let i = 0; i < this._iColorCnt; i++) {
      this.phraseClrFileArr[i] = {}
      this.phraseClrFileArr[i].index = arrTemp[i * 3]
      this.phraseClrFileArr[i].end = arrTemp[i * 3 + 1]
      rgbC = arrTemp[i * 3 + 2]
      cArrTemp = this.combinationToRGB(rgbC)
      // 存整数形式表示的颜色
      this.phraseClrFileArr[i].rgb = this.calRGB(cArrTemp[0], cArrTemp[1], cArrTemp[2])
      // 存16进制的颜色，web标准
      this.phraseClrFileArr[i].rgbStr_16 = this.calRGBStr16(cArrTemp[0], cArrTemp[1], cArrTemp[2])
      // -------------------------新增属性，方便使用
      this.phraseClrFileArr[i].min = i > 0 ? this.phraseClrFileArr[i - 1].end : this._iMin
      this.phraseClrFileArr[i].max = this.phraseClrFileArr[i].end
      // 防止部分异常色标越界
      let tempV = this.phraseClrFileArr[i].end
      if (tempV > this._iMax) {
        tempV = this._iMax
      }
      this.phraseClrFileArr[i].label = (this.getClrVal(tempV)).toFixed(this._iPreCnt)
      this.phraseClrFileArr[i].labelVal = Number(this.phraseClrFileArr[i].label) // 保存为数值型
      // ----------------------------------------------------
    }
    // 初始化色标相关数组
    this.initClrArr()
  }

  /**
   * 初始化色标相关数组
   */
  initClrArr () {
    if (this._BlockShowType === 1) {
      // 渐进色
      this.colorArrayDrawClr = this.analyGradualColorNew()
      // 20180129 新增
      if (this._sID === ProductType.V_TYPE) { // 速度单独处理0m/s附近颜色
        this.colorArrayDrawClr[127] = this.colorArrayDrawClr[128]
        this.colorArrayDrawClr[129] = this.colorArrayDrawClr[130] // 白色
      }
    } else if (this._BlockShowType === 0 || this._BlockShowType === 2) {
      // 色块
      this.colorArrayDrawClr = this.analyblockColor()
    }

    // 回波
    if (this._EchoShowType === 1) { // 渐进色
      this.colorArray = this.analyGradualColorNew()
      // 20180129 新增
      if (this._sID === ProductType.V_TYPE) { // 速度单独处理0m/s附近颜色
        this.colorArray[127] = this.colorArray[128]
        this.colorArray[129] = this.colorArray[130] // 白色
      }
    } else if (this._EchoShowType === 0 || this._EchoShowType === 2) {
      // 色块
      this.colorArray = this.analyblockColor()
    }
  }

  /**
   * 位数补齐<br>源字符串、目标长度<br>souString:必须是字符串格式
   * @param souString
   * @param len
   * @return {*}
   */
  buqiString (souString, len) {
    const lenNeed = len - souString.length
    for (let i = 0; i < lenNeed; i++) {
      if (souString.length < len) {
        souString = '0' + souString
      } else {
        break
      }
    }
    return souString
  }

  /**
   * 获取色域值 N=kV+b
   */
  getClrN (V) {
    let N = null// 无效值
    if (V > this._max)V = this._max
    if (V >= this._min && V <= this._max) {
      N = (V) * (1 / this.fValPer) + this.b
    }
    return N
  }

  /**
   * 获取真值 V=(N-b)/k
   */
  getClrVal (N) {
    let value = null// 无效值
    if (N >= this._iMin && N <= this._iMax) {
      value = (N - this.b) * this.fValPer
    }
    return value
  }

  /**
   *
   * @param cavans
   * @param paddingObj
   * @param isH
   * @param isClearCavans 是否清空画布并重置样式
   */
  initColorCavans (cavans, paddingObj, isH, isClearCavans) {
    const cavansObj = {}
    // 设置色标面板的边距。
    if (isH) {
      cavansObj.pLeft = 10
      cavansObj.pRight = 10
      cavansObj.pTop = 0
      cavansObj.pBottom = 20
    } else {
      cavansObj.pLeft = 2
      cavansObj.pRight = 2
      cavansObj.pTop = 0
      cavansObj.pBottom = 10
    }
    if (paddingObj) {
      cavansObj.pLeft = paddingObj.pLeft
      cavansObj.pRight = paddingObj.pRight
      cavansObj.pTop = paddingObj.pTop
      cavansObj.pBottom = paddingObj.pBottom
    }
    cavansObj.pClrTop = cavansObj.pTop + 20 // 开始绘制色标的位置=cavansObj.pTop+25
    if (isClearCavans) {
      // 1、清空画布
      const context = cavans.getContext('2d')
      const clearW = cavans.width - cavansObj.pLeft - cavansObj.pRight
      const clearH = cavans.height - cavansObj.pTop - cavansObj.pBottom
      context.clearRect(cavansObj.pLeft, cavansObj.pTop, clearW, clearH)
      context.globalAlpha = 1
      context.lineWidth = 1
      context.font = 'normal 12px serif'
      cavansObj.context = context
    }

    if (cavans.width === 0 || cavans.height === 0) return null
    cavansObj.width = cavans.width
    cavansObj.height = cavans.height
    return cavansObj
  }

  /**
   * 绘制text，参数：context，text，textBaseline：对齐方式，fillStyle，位置x，y
   * @param context
   * @param text
   * @param textBaseline
   * @param fillStyle
   * @param x
   * @param y
   */
  drawTextToContext (context, text, textBaseline, fillStyle, x, y) {
    if (text != null && text !== '') {
      context.textBaseline = textBaseline
      context.fillStyle = fillStyle
      context.fillText(text, x, y)
    }
  }

  /**
   * 绘制线，参数：context，strokeStyle，startX,startX,终点位置:endX,endY
   * @param context
   * @param strokeStyle
   * @param startX
   * @param startY
   * @param endX
   * @param endY
   */
  drawStrokeLine (context, strokeStyle, startX, startY, endX, endY) {
    context.beginPath()
    context.strokeStyle = strokeStyle
    context.moveTo(startX, startY)
    context.lineTo(endX, endY)
    context.stroke()
    context.closePath()
  }

  /**
   * 绘制色标画布相关
   * @param cavans
   * @param isH true表示水平方向绘制
   * @param isSToB：1表示从小到大，0：表示从大到小；-1：表示根据色标文件中的_viewType而定，既isSToB = ！_viewType
   * @param keduLineColor
   * @param keduValColor
   * @param disClrSize 表示色域带的宽度（高度）
   * @param paddingObj paddingObj:可以为null,paddingObj.pLeft, paddingObj.pRight,paddingObj.pTop, paddingObj.pBottom
   */
  drawColorCavans (cavans, isH, isSToB, keduLineColor, keduValColor, disClrSize, paddingObj) {
    const cavansObj = this.initColorCavans(cavans, paddingObj, isH, true)
    if (!cavansObj || !this.phraseClrFileArr) return
    if (isSToB === -1) {
      isSToB = !this._viewType
    }
    if (this._BlockShowType === 1) {
      // 渐近色
      if (isH) {
        // 水平方向绘制
        this.drawCavansGradualHori(isSToB, cavansObj, keduLineColor, keduValColor, disClrSize)
      } else {
        // 竖直方向绘制

        this.drawCavansGradualVerti(isSToB, cavansObj, keduLineColor, keduValColor, disClrSize)
      }
    } else {
      // 色块
      if (isH) {
        // 水平方向绘制
        this.drawCavansBlockHori(isSToB, cavansObj, keduLineColor, keduValColor, disClrSize)
      } else {
        // 竖直方向绘制
        this.drawCavansBlockVerti(isSToB, cavansObj, keduLineColor, keduValColor, disClrSize)
      }
    }
  }

  /**
   * 竖直方向绘制,（从上往下
   * @param isSToB 从小到大的顺序绘制（正序)
   * @param cavansObj
   * @param keduLineColor
   * @param keduValColor
   * @param disClrSize
   */
  drawCavansBlockVerti (isSToB, cavansObj, keduLineColor, keduValColor, disClrSize) {
    if (!cavansObj) return

    const keduSize = 5
    let colorWidth
    if (disClrSize <= 0) {
      if (cavansObj.width > 40) {
        if (this._iPreCnt === 0) {
          colorWidth = cavansObj.width - 25 - cavansObj.pRight - cavansObj.pLeft - keduSize
        } else if (this._iPreCnt === 1) {
          colorWidth = cavansObj.width - 35 - cavansObj.pRight - cavansObj.pLeft - keduSize
        } else {
          colorWidth = cavansObj.width - 45 - cavansObj.pRight - cavansObj.pLeft - keduSize
        }
      } else {
        return
      }
    } else {
      colorWidth = disClrSize
    }
    let textXs = 0
    let textYs = 0
    let lineXs = 0
    let lineYs = 0
    let lineXe = 0
    let lineYe = 0
    let text = ''

    // 画单位
    this.drawTextToContext(cavansObj.context, this._szUnit, 'top', keduValColor, cavansObj.pLeft, cavansObj.pTop)
    // 绘制色标颜色的总高度（高度最大值）
    let drawMaxHei = 0
    // 画色块。
    let colorBlockHeight
    if (this._sID === ProductType.V_TYPE || this._sID === ProductType.W_TYPE) {
      colorBlockHeight = (cavansObj.height - cavansObj.pClrTop - cavansObj.pBottom) / (this.phraseClrFileArr.length) // 设置可用区域高度,要画模糊色
      colorBlockHeight = Math.floor(colorBlockHeight)
      drawMaxHei = colorBlockHeight * this.phraseClrFileArr.length + cavansObj.pClrTop
    } else {
      colorBlockHeight = (cavansObj.height - cavansObj.pClrTop - cavansObj.pBottom) / (this.phraseClrFileArr.length - 1) // 设置可用区域高度
      colorBlockHeight = Math.floor(colorBlockHeight)
      drawMaxHei = colorBlockHeight * (this.phraseClrFileArr.length - 1) + cavansObj.pClrTop
    }
    // 加色标文件名判断，兼容之前的色标文件,KA雷达产品色标均以HCL为基础，编码冲突，故摒弃_SID 20210112
    // const clrFHCL = productConfig.getClrFileNameByType(ProductType.HCL_TYPE)
    // const clrFSEI = productConfig.getClrFileNameByType(ProductType.SEI_TYPE)
    // const clrFKCHei = productConfig.getClrFileNameByType(ProductType.KCHei_TYPE)
    // const clrFKCNum = productConfig.getClrFileNameByType(ProductType.KCNum_TYPE)
    // const clrFKCCL = productConfig.getClrFileNameByType(ProductType.KCCL_TYPE)
    // const clrFKCHCL = productConfig.getClrFileNameByType(ProductType.KCHCL_TYPE)

    const clrFHCL = ''
    const clrFSEI = ''
    const clrFKCHei = ''
    const clrFKCNum = ''
    const clrFKCCL = ''
    const clrFKCHCL = ''
    let linePosY
    for (let i = 0; i < this.phraseClrFileArr.length; i++) {
      text = ''
      // 画色标刻度。

      if (isSToB) {
        linePosY = i * colorBlockHeight + cavansObj.pClrTop
      } else {
        if (this._sID === ProductType.V_TYPE || this._sID === ProductType.W_TYPE) {
          linePosY = drawMaxHei - (i + 1) * colorBlockHeight
        } else {
          linePosY = drawMaxHei - i * colorBlockHeight
        }
      }

      // 不画第一块，第一个用来当作背景色的颜色。
      if (i > 0) {
        cavansObj.context.fillStyle = this.colorArrayDrawClr[this.phraseClrFileArr[i - 1].end]

        if (isSToB) {
          cavansObj.context.fillRect(cavansObj.pLeft, linePosY - colorBlockHeight, colorWidth, colorBlockHeight)
          this.phraseClrFileArr[i].rect = { x: cavansObj.pLeft, y: linePosY - colorBlockHeight, width: colorWidth, height: colorBlockHeight }
        } else {
          cavansObj.context.fillRect(cavansObj.pLeft, linePosY, colorWidth, colorBlockHeight)
          this.phraseClrFileArr[i].rect = { x: cavansObj.pLeft, y: linePosY, width: colorWidth, height: colorBlockHeight }
        }
      }

      if ((clrFHCL && this.clrFName.indexOf(clrFHCL) !== -1) || (clrFSEI && this.clrFName.indexOf(clrFSEI) !== -1) ||
         (clrFKCHei && this.clrFName.indexOf(clrFKCHei) !== -1) || (clrFKCCL && this.clrFName.indexOf(clrFKCCL) !== -1) ||
         (clrFKCHCL && this.clrFName.indexOf(clrFKCHCL) !== -1) || (clrFKCNum && this.clrFName.indexOf(clrFKCNum) !== -1)) {
        if (i > 0) {
          if (isSToB) {
            lineYs = linePosY - colorBlockHeight * 0.5
            lineYe = linePosY - colorBlockHeight * 0.5
            textYs = linePosY - colorBlockHeight * 0.5
          } else {
            lineYs = linePosY + colorBlockHeight * 0.5
            lineYe = linePosY + colorBlockHeight * 0.5
            textYs = linePosY + colorBlockHeight * 0.5
          }
          if (clrFHCL && this.clrFName.indexOf(clrFHCL) !== -1) {
            text = getHCLStrFromVal(this.phraseClrFileArr[i].labelVal - 1)
          } else if (clrFSEI && this.clrFName.indexOf(clrFSEI) !== -1) {
            text = getSEIStrFromVal(this.phraseClrFileArr[i].labelVal - 1)
          } else if (clrFKCHei && this.clrFName.indexOf(clrFKCHei) !== -1) {
            text = getKCheiStrFromVal(this.phraseClrFileArr[i].labelVal - 1)
          } else if (clrFKCNum && this.clrFName.indexOf(clrFKCNum) !== -1) {
            text = getCloudCoverText(this.phraseClrFileArr[i].labelVal)
          } else if (clrFKCCL && this.clrFName.indexOf(clrFKCCL) !== -1) {
            text = getCloudShape(this.phraseClrFileArr[i].labelVal - 1)
          } else if (clrFKCHCL && this.clrFName.indexOf(clrFKCHCL) !== -1) {
            text = getCHCLText(this.phraseClrFileArr[i].labelVal - 1)
          }
        }
      } else {
        lineYs = linePosY
        lineYe = linePosY
        text = this.phraseClrFileArr[i].label
        textYs = linePosY
      }
      if (text !== '') {
        if (text.indexOf('-') === -1)text = ' ' + text
        lineXs = cavansObj.pLeft + colorWidth
        lineXe = cavansObj.pLeft + colorWidth + keduSize
        this.drawStrokeLine(cavansObj.context, keduLineColor, lineXs, lineYs + 0.5, lineXe, lineYe + 0.5)
        textXs = cavansObj.pLeft + colorWidth + keduSize + 2

        this.drawTextToContext(cavansObj.context, text, 'middle', keduValColor, textXs, textYs)
      }
    }
    if (this._sID === ProductType.V_TYPE || this._sID === ProductType.W_TYPE) {
      linePosY = drawMaxHei - colorBlockHeight
      const rgb = this.colorArrayDrawClr[1]
      cavansObj.context.fillStyle = rgb
      cavansObj.context.fillRect(cavansObj.pLeft, linePosY, colorWidth, colorBlockHeight)
      text = '  RF'
      this.drawTextToContext(cavansObj.context, text, 'top', keduValColor, cavansObj.pLeft + colorWidth, linePosY + colorBlockHeight / 2)
    }
  }

  /**
   * 绘制色块 水平方向绘制,值从小到大画（从左往右）
   * @param isSToB
   * @param cavansObj
   * @param keduLineColor
   * @param keduValColor
   * @param disClrSize
   */
  drawCavansBlockHori (isSToB, cavansObj, keduLineColor, keduValColor, disClrSize) {
    if (!cavansObj) return
    const keduSize = 5
    let colorHei
    if (disClrSize <= 0) {
      if (cavansObj.height >= 80) {
        colorHei = 30
      } else if (cavansObj.height > 30) {
        colorHei = 10
      } else {
        return
      }
    } else {
      colorHei = disClrSize
    }
    let textYs = 0
    let lineXs = 0
    let lineYs = 0
    let lineYe = 0
    let text = ''

    // 画单位
    this.drawTextToContext(cavansObj.context, this._szUnit, 'top', keduValColor, cavansObj.pLeft, cavansObj.pTop)
    // 绘制色标颜色的总宽度（宽度最大值）
    let drawMaxW = 0
    // 画色块。
    let cBlockWidth
    if (this._sID === ProductType.V_TYPE || this._sID === ProductType.W_TYPE) {
      cBlockWidth = (cavansObj.width - cavansObj.pLeft - cavansObj.pRight) / (this.phraseClrFileArr.length) // 设置可用区域高度,要画模糊色
      cBlockWidth = Math.floor(cBlockWidth)
      drawMaxW = cBlockWidth * this.phraseClrFileArr.length + cavansObj.pLeft
    } else {
      cBlockWidth = (cavansObj.width - cavansObj.pLeft - cavansObj.pRight) / (this.phraseClrFileArr.length - 1) // 设置可用区域高度
      cBlockWidth = Math.floor(cBlockWidth)
      drawMaxW = cBlockWidth * (this.phraseClrFileArr.length - 1) + cavansObj.pLeft
    }
    // 加色标文件名判断，兼容之前的色标文件,KA雷达产品色标均以HCL为基础，编码冲突，故摒弃_SID 20210112
    // const clrFHCL = productConfig.getClrFileNameByType(ProductType.HCL_TYPE)
    // const clrFSEI = productConfig.getClrFileNameByType(ProductType.SEI_TYPE)
    // const clrFKCHei = productConfig.getClrFileNameByType(ProductType.KCHei_TYPE)
    // const clrFKCNum = productConfig.getClrFileNameByType(ProductType.KCNum_TYPE)
    // const clrFKCCL = productConfig.getClrFileNameByType(ProductType.KCCL_TYPE)
    // const clrFKCHCL = productConfig.getClrFileNameByType(ProductType.KCHCL_TYPE)

    const clrFHCL = ''
    const clrFSEI = ''
    const clrFKCHei = ''
    const clrFKCNum = ''
    const clrFKCCL = ''
    const clrFKCHCL = ''
    let linePosX
    for (let i = 0; i < this.phraseClrFileArr.length; i++) {
      text = ''
      // 画色标刻度。

      if (isSToB) {
        linePosX = i * cBlockWidth + cavansObj.pLeft
      } else {
        if (this._sID === ProductType.V_TYPE || this._sID === ProductType.W_TYPE) {
          linePosX = drawMaxW - (i + 1) * cBlockWidth
        } else {
          linePosX = drawMaxW - i * cBlockWidth
        }
      }
      // 不画第一块，第一个用来当作背景色的颜色。
      if (i > 0) {
        cavansObj.context.fillStyle = this.phraseClrFileArr[i].rgbStr_16

        if (isSToB) {
          cavansObj.context.fillRect(linePosX - cBlockWidth, cavansObj.pClrTop, cBlockWidth, colorHei)
          this.phraseClrFileArr[i].rect = { x: linePosX - cBlockWidth, y: cavansObj.pClrTop, width: cBlockWidth, height: colorHei }
        } else {
          cavansObj.context.fillRect(linePosX, cavansObj.pClrTop, cBlockWidth, colorHei)
          this.phraseClrFileArr[i].rect = { x: linePosX, y: cavansObj.pClrTop, width: cBlockWidth, height: colorHei }
        }
      }

      if ((clrFHCL && this.clrFName.indexOf(clrFHCL) !== -1) || (clrFSEI && this.clrFName.indexOf(clrFSEI) !== -1) ||
        (clrFKCHei && this.clrFName.indexOf(clrFKCHei) !== -1) || (clrFKCCL && this.clrFName.indexOf(clrFKCCL) !== -1) ||
        (clrFKCHCL && this.clrFName.indexOf(clrFKCHCL) !== -1) || (clrFKCNum && this.clrFName.indexOf(clrFKCNum) !== -1)) {
        if (i > 0) {
          if (isSToB) {
            lineXs = linePosX - cBlockWidth * 0.5
          } else {
            lineXs = linePosX + cBlockWidth * 0.5
          }
          if (clrFHCL && this.clrFName.indexOf(clrFHCL) !== -1) {
            text = getHCLStrFromVal(this.phraseClrFileArr[i].labelVal - 1)
          } else if (clrFSEI && this.clrFName.indexOf(clrFSEI) !== -1) {
            text = getSEIStrFromVal(this.phraseClrFileArr[i].labelVal - 1)
          } else if ((clrFKCHei && this.clrFName.indexOf(clrFKCHei) !== -1)) {
            text = getKCheiStrFromVal(this.phraseClrFileArr[i].labelVal - 1)
          } else if ((clrFKCNum && this.clrFName.indexOf(clrFKCNum) !== -1)) {
            text = getCloudCoverText(this.phraseClrFileArr[i].labelVal)
          } else if ((clrFKCCL && this.clrFName.indexOf(clrFKCCL) !== -1)) {
            text = getCloudShape(this.phraseClrFileArr[i].labelVal - 1)
          } else if ((clrFKCHCL && this.clrFName.indexOf(clrFKCHCL) !== -1)) {
            text = getCHCLText(this.phraseClrFileArr[i].labelVal - 1)
          }
        }
      } else {
        lineXs = linePosX
        text = this.phraseClrFileArr[i].label
      }

      if (text !== '') {
        lineYs = cavansObj.pClrTop + colorHei
        lineYe = lineYs + keduSize
        this.drawStrokeLine(cavansObj.context, keduLineColor, lineXs + 0.5, lineYs, lineXs + 0.5, lineYe)
        textYs = lineYe
        this.drawTextToContext(cavansObj.context, text, 'top', keduValColor, lineXs - 8, textYs)
      }
    }
    // 画模糊色 速度谱宽第一块为模糊色
    if (this._sID === ProductType.V_TYPE || this._sID === ProductType.W_TYPE) {
      linePosX = drawMaxW - cBlockWidth
      const rgb = this.colorArrayDrawClr[1]
      cavansObj.context.fillStyle = rgb
      cavansObj.context.fillRect(linePosX, cavansObj.pClrTop, cBlockWidth, colorHei)
      text = '  RF'
      this.drawTextToContext(cavansObj.context, text, 'top', keduValColor, linePosX + cBlockWidth / 2, cavansObj.pClrTop + colorHei + keduSize)
    }
  }

  /**
   * 绘制渐进色 竖直方向绘制,（从上往下），isSToB：true从小到大的顺序绘制（正序）
   * @param isSToB
   * @param cavansObj
   * @param keduLineColor
   * @param keduValColor
   * @param disClrSize
   */
  drawCavansGradualVerti (isSToB, cavansObj, keduLineColor, keduValColor, disClrSize) {
    if (!cavansObj) return

    const keduSize = 5
    let colorWidth
    if (disClrSize <= 0) {
      if (cavansObj.width > 40) {
        if (this._iPreCnt === 0) {
          colorWidth = cavansObj.width - 25 - cavansObj.pRight - cavansObj.pLeft - keduSize
        } else if (this._iPreCnt === 1) {
          colorWidth = cavansObj.width - 35 - cavansObj.pRight - cavansObj.pLeft - keduSize
        } else {
          colorWidth = cavansObj.width - 45 - cavansObj.pRight - cavansObj.pLeft - keduSize
        }
      } else {
        return
      }
    } else {
      colorWidth = disClrSize
    }

    let textXs = 0
    let textYs = 0
    let lineXs = 0
    let lineYs = 0
    let lineXe = 0
    let lineYe = 0
    let text = ''

    // 画单位
    this.drawTextToContext(cavansObj.context, this._szUnit, 'top', keduValColor, cavansObj.pLeft, cavansObj.pTop)
    // 绘制色标颜色的总高度（高度最大值）
    let drawMaxHei = 0
    // 渐进色中暂不考虑速度、谱宽的模糊
    let colorBlockHeight
    colorBlockHeight = (cavansObj.height - cavansObj.pClrTop - cavansObj.pBottom) / (this.phraseClrFileArr.length - 1) // 设置可用区域高度,要画模糊色
    colorBlockHeight = Math.floor(colorBlockHeight)
    drawMaxHei = colorBlockHeight * (this.phraseClrFileArr.length - 1) + cavansObj.pClrTop

    let linePosY
    for (let i = 0; i < this.phraseClrFileArr.length; i++) {
      text = ''
      // 画色标刻度。
      if (isSToB) {
        linePosY = i * colorBlockHeight + cavansObj.pClrTop
      } else {
        linePosY = drawMaxHei - i * colorBlockHeight
      }
      // 递归每个单位高度，绘制线
      if (i > 0) {
        // 渐进色中暂不考虑速度、谱宽的模糊
        // 递归每个单位高度，绘制线
        const startBlock = this.phraseClrFileArr[i - 1].end
        const endBlock = this.phraseClrFileArr[i].end
        const iInv = endBlock - startBlock
        const fDet = iInv / colorBlockHeight
        let iColorVal = 0

        for (let j = 0; j < colorBlockHeight; j++) {
          iColorVal = this.colorArrayDrawClr[parseInt(startBlock + fDet * j)]
          cavansObj.context.strokeStyle = iColorVal
          if (isSToB) {
            this.drawStrokeLine(cavansObj.context, iColorVal, cavansObj.pLeft, linePosY + j - colorBlockHeight, cavansObj.pLeft + colorWidth, linePosY + j - colorBlockHeight)
          } else {
            this.drawStrokeLine(cavansObj.context, iColorVal, cavansObj.pLeft, linePosY + (colorBlockHeight - j), cavansObj.pLeft + colorWidth, linePosY + (colorBlockHeight - j))
          }
        }
      }

      lineYs = linePosY
      lineYe = linePosY
      text = this.phraseClrFileArr[i].label
      textYs = linePosY

      if (text !== '') {
        if (text.indexOf('-') === -1)text = ' ' + text
        lineXs = cavansObj.pLeft + colorWidth
        lineXe = cavansObj.pLeft + colorWidth + keduSize
        this.drawStrokeLine(cavansObj.context, keduLineColor, lineXs, lineYs + 0.5, lineXe, lineYe + 0.5)

        textXs = cavansObj.pLeft + colorWidth + keduSize + 2
        this.drawTextToContext(cavansObj.context, text, 'middle', keduValColor, textXs, textYs)
      }
    }
  }

  /**
   * 绘制色块
   * 水平方向绘制,值从小到大画（从左往右）
   * @param isSToB
   * @param cavansObj
   * @param keduLineColor
   * @param keduValColor
   * @param disClrSize
   */
  drawCavansGradualHori (isSToB, cavansObj, keduLineColor, keduValColor, disClrSize) {
    if (!cavansObj) return

    const keduSize = 5
    let colorHei
    if (disClrSize <= 0) {
      if (cavansObj.height >= 80) {
        colorHei = 30
      } else if (cavansObj.height > 30) {
        colorHei = 10
      } else {
        return
      }
    } else {
      colorHei = disClrSize
    }

    let textYs = 0
    let lineXs = 0
    let lineYs = 0
    let lineYe = 0
    let text = ''

    // 画单位
    this.drawTextToContext(cavansObj.context, this._szUnit, 'top', keduValColor, cavansObj.pLeft, cavansObj.pTop)
    // 绘制色标颜色的总宽度（宽度最大值）
    let drawMaxW = 0
    // 画色块。
    let cBlockWidth
    cBlockWidth = (cavansObj.width - cavansObj.pLeft - cavansObj.pRight) / (this.phraseClrFileArr.length - 1) // 设置可用区域高度
    cBlockWidth = Math.floor(cBlockWidth)
    drawMaxW = cBlockWidth * (this.phraseClrFileArr.length - 1) + cavansObj.pLeft
    let linePosX
    for (let i = 0; i < this.phraseClrFileArr.length; i++) {
      text = ''
      // 画色标刻度。
      if (isSToB) {
        linePosX = i * cBlockWidth + cavansObj.pLeft
      } else {
        if (this._sID === ProductType.V_TYPE || this._sID === ProductType.W_TYPE) {
          linePosX = drawMaxW - (i + 1) * cBlockWidth
        } else {
          linePosX = drawMaxW - i * cBlockWidth
        }
      }
      // 不画第一块，第一个用来当作背景色的颜色。
      // 递归每个单位高度，绘制线
      if (i > 0) {
        // 渐进色中暂不考虑速度、谱宽的模糊
        // 递归每个单位高度，绘制线
        const startBlock = this.phraseClrFileArr[i - 1].end
        const endBlock = this.phraseClrFileArr[i].end
        const iInv = endBlock - startBlock
        const fDet = iInv / cBlockWidth
        let iColorVal = 0

        for (let j = 0; j < cBlockWidth; j++) {
          iColorVal = this.colorArrayDrawClr[parseInt(startBlock + fDet * j)]
          if (isSToB) {
            this.drawStrokeLine(cavansObj.context, iColorVal, linePosX - cBlockWidth + j, cavansObj.pClrTop, linePosX - cBlockWidth + j, cavansObj.pClrTop + colorHei)
          } else {
            this.drawStrokeLine(cavansObj.context, iColorVal, linePosX + (cBlockWidth - j), cavansObj.pClrTop, linePosX + (cBlockWidth - j), cavansObj.pClrTop + colorHei)
          }
        }
      }

      lineXs = linePosX
      text = this.phraseClrFileArr[i].label

      if (text !== '') {
        lineYs = cavansObj.pClrTop + colorHei
        lineYe = lineYs + keduSize
        this.drawStrokeLine(cavansObj.context, keduLineColor, lineXs + 0.5, lineYs, lineXs + 0.5, lineYe)
        textYs = lineYe
        this.drawTextToContext(cavansObj.context, text, 'top', keduValColor, lineXs - 8, textYs)
      }
    }
  }

  /**
   * 获取色标画布指定位置的信息
   * @param cavans
   * @param isH true表示水平方向绘制
   * @param isSToB：1表示从小到大，0：表示从大到小；-1：表示根据色标文件中的_viewType而定，既isSToB = ！_viewType
   * @param disClrSize 表示色域带的宽度（高度）
   * @param paddingObj paddingObj:可以为null,paddingObj.pLeft, paddingObj.pRight,paddingObj.pTop, paddingObj.pBottom
   * @param pos {x:,y:}
   */
  getInfo (cavans, isH, isSToB, disClrSize, paddingObj, pos) {
    const cavansObj = this.initColorCavans(cavans, paddingObj, isH, false)
    if (!cavansObj || !this.phraseClrFileArr) return

    if (isSToB === -1) {
      isSToB = !this._viewType
    }
    let obj = null
    if (this._BlockShowType === 1) {
      // 渐近色
      if (isH) {
        // 水平方向绘制
        // 待实现
      } else {
        // 竖直方向绘制
        // 待实现
      }
    } else {
      // 色块\
      let rect
      let minX
      let minY
      let maxX
      let maxY
      for (let i = 0; i < this.phraseClrFileArr.length; i++) {
        // 不画第一块，第一个用来当作背景色的颜色。
        if (i > 0 && i < this.phraseClrFileArr.length) {
          rect = this.phraseClrFileArr[i].rect
          if (rect) {
            minX = rect.x < rect.x + rect.width ? rect.x : rect.x + rect.width
            maxX = rect.x > rect.x + rect.width ? rect.x : rect.x + rect.width
            minY = rect.y < rect.y + rect.height ? rect.x : rect.y + rect.height
            maxY = rect.y > rect.y + rect.width ? rect.x : rect.y + rect.height
            if (pos.x > minX && pos.x <= maxX && pos.y > minY && pos.y <= maxY) {
              obj = this.phraseClrFileArr[i]
              obj.userClr = this.colorArrayDrawClr[obj.min] // 用户上次操作色
              break
            }
          }
        }
      }
    }
    return obj
  }

  /** 整体恢复预定颜色
   *  只适应于同为色块或同为渐进色20200827
   * */
  resetClr () {
    if (!this.phraseClrFileArr || !this.colorArray || !this.colorArrayDrawClr) return
    // 初始化色标相关数组
    this.initClrArr()
  }

  /** @param isSToB: true表示从小到大
   *  @param isMergeUp: true 表示向上合并（视图上的向上）
   *  只适应于同为色块或同为渐进色20200827
   * */
  mergeClr (isSToB, isMergeUp, evtInfo) {
    if (!evtInfo || !this.colorArray) return
    let minIndex = 0
    let maxIndex = 0
    if (isSToB === -1) {
      isSToB = !this._viewType
    }

    if (isSToB === isMergeUp) {
      minIndex = this._iMin // 0
      maxIndex = evtInfo.max
    } else {
      minIndex = evtInfo.min
      maxIndex = this.colorArray.length
    }

    for (let i = minIndex; i < maxIndex; i++) {
      this.colorArray.splice(i, 1, evtInfo.userClr) // 用splice(i, 1, temp.rgbStr_16)更改才能出发watch监听器的colorProcess
      this.colorArrayDrawClr.splice(i, 1, evtInfo.userClr)
    }
    // 单独处理模糊色
    if (!isMergeUp) {
      if (this._sID === ProductType.V_TYPE || this._sID === ProductType.W_TYPE) {
        this.colorArray.splice(1, 1, evtInfo.userClr)
        this.colorArrayDrawClr.splice(1, 1, evtInfo.userClr)
      }
    }
    return { minIndex: minIndex, maxIndex: maxIndex } // 方便查找信息
  }

  /** 整体灰度处理
   * @param
   *  只适应于同为色块或同为渐进色20200827
   * */
  grayClr () {
    if (!this.phraseClrFileArr || !this.colorArray || !this.colorArrayDrawClr) return

    let temp = null
    let minIndex = 0
    let maxIndex = 0
    let grayClr16 = ''
    let clrN = 0
    for (let i = 0; i < this.phraseClrFileArr.length; i++) {
      if (this.phraseClrFileArr[i]) {
        temp = this.phraseClrFileArr[i]
        clrN = this.getClrN(temp.labelVal)
        grayClr16 = this.calRGBStr16(clrN, clrN, clrN)
        // console.log('grayClr16', i, clrN, grayClr16)
        minIndex = temp.min
        maxIndex = temp.max
        for (let i = minIndex; i < maxIndex; i++) {
          this.colorArray.splice(i, 1, grayClr16) // 用splice(i, 1, temp.rgbStr_16)更改才能出发watch监听器的colorProcess
          this.colorArrayDrawClr.splice(i, 1, grayClr16)
        }
      }
    }
    // 单独处理模糊色
    if (this._sID === ProductType.V_TYPE || this._sID === ProductType.W_TYPE) {
      grayClr16 = this.calRGBStr16(123, 123, 123)
      this.colorArray.splice(1, 1, grayClr16)
      this.colorArrayDrawClr.splice(1, 1, grayClr16)
    }
  }

  /** @param isSToB: true表示从小到大
   *  @param filterType: 表示过滤类型，-1：向下过滤。0：单色过滤，1：向上过滤 （向上是视图上视觉的向上）
   *  @param filterToClr: 将目标过滤的替换色,16进制表示
   *  只适应于同为色块或同为渐进色20200827
   * */
  filterClr (isSToB, filterType, filterToClr, evtInfo) {
    if (!evtInfo || !this.colorArray) return
    let minIndex = 0
    let maxIndex = 0
    if (isSToB === -1) {
      isSToB = !this._viewType
    }
    if (filterType === 0) {
      minIndex = evtInfo.min
      maxIndex = evtInfo.max
    } else if (filterType === 1 || filterType === -1) {
      let isFilter = false
      if (filterType === 1) {
        isFilter = true
      }
      if (isSToB === isFilter) {
        minIndex = this._iMin // 0
        maxIndex = evtInfo.max
      } else {
        minIndex = evtInfo.min
        maxIndex = this.colorArray.length
      }
    } else {

    }

    for (let i = minIndex; i < maxIndex; i++) {
      this.colorArray.splice(i, 1, filterToClr) // 用splice(i, 1, temp.rgbStr_16)更改才能出发watch监听器的colorProcess
      this.colorArrayDrawClr.splice(i, 1, filterToClr)
    }
    // 单独处理模糊色
    if (filterType === -1) {
      if (this._sID === ProductType.V_TYPE || this._sID === ProductType.W_TYPE) {
        this.colorArray.splice(1, 1, filterToClr)
        this.colorArrayDrawClr.splice(1, 1, filterToClr)
      }
    }
    return { minIndex: minIndex, maxIndex: maxIndex } // 方便查找信息
  }
}
