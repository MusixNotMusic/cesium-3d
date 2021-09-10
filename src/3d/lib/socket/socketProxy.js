import socketConst from './socketConst'
import ProductType from '../Common/productType/ProductType'
import NameSpace from '../Common/nameSpace'
// import SysLogVo from '../sysLog/SysLogVo'
// import SysLogConst from '../sysLog/SysLogConst'
// import textEncoding from 'text-encoding' // polyfill implementation to support all the legacy encodings
// import i18n from '@/i18n/i18n'
import buffer from '../Common/buffer'
// import store from '@/store'

let packID = 0;

export default class SocketProxy {
  /** 网络IP */
  serverStr = '';
  /** 心跳包时钟  */
  activeInterval = null;
  activeTime = 3000; // 用3s，应PT要求
  recConnectInterval = null;
  recConnectTime = 10000;
  isNeedConnect = true;
  /** 经测试，socket连接成功需3秒，超时需20s */
  websocket = null;
  byteArray = null;
  dispatchCallback = null;

  constructor (ip, port, dispatchCallback) {
    this.isNeedConnect = true
    this.serverStr = ip + ':' + port
    this.dispatchCallback = dispatchCallback
    if (window.WebSocket) {
      /** Ready States */
      // ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED'].forEach(function each(state, index) {
      //   WebSocket.prototype[state] = index;
      // });
      this.connectSocket()
    } else {
      console.log('当前版本浏览器不支持webSocket!')
    }
  }

  activeFun () {
    this.activeInterval = setInterval(() => {
      this.getActivePack()
    }, this.activeTime)
  }

  connectSocket () {
    const that = this
    if (this.websocket && this.websocket.readyState === 1) return
    if (!this.isNeedConnect) return
    // socket connect start!
    this.websocket = new WebSocket('ws://' + this.serverStr)
    this.websocket.binaryType = 'arraybuffer'
    this.websocket.onopen = function (e) {
      clearInterval(that.recConnectInterval)
      // 成功连接服务器SOCKET通道
      that.activeFun()
      if (that.dispatchCallback) {
        that.dispatchCallback(socketConst.SOCKET_NOTI, {
          notiName: socketConst.SOCKET_NOTI,
          notiType: socketConst.OPEN,
          notiBody: null
        })
      } // 全局事件派发
    }
    this.websocket.onclose = function (e) {
      // "pt关闭SOCKET通道！",沒有主动关闭;
      // that.sendFirstClosedNoti(i18n.t('socket.PTCSocket'))
      if (that.isNeedConnect) that.reconnect()
    }
    this.websocket.onmessage = function (e) {
      // console.log('收到消息', e.data)
      clearInterval(that.recConnectInterval)
      // 收到的数据是否是binary
      if (e.data instanceof ArrayBuffer) {
        // let binaryPackets = e.data
        that.progress(e.data)
      } else {
        console.log('Not ArrayBuffer.')
      }
    }
    this.websocket.onerror = function (e) {
      // that.sendFirstClosedNoti(i18n.t('socket.errorSocket'))
      if (that.isNeedConnect) that.reconnect()
    }
  }

  reconnect () {
    clearInterval(this.activeInterval)
    clearInterval(this.recConnectInterval)
    localStorage.setItem('userOffLine', true)
    this.recConnectInterval = setInterval(() => {
      console.log('recConnectInterval')
      if (this.isNeedConnect) {
        this.connectSocket()
      } else {
        clearInterval(this.recConnectInterval)
      }
    }, this.recConnectTime)
  }

  // 主动关闭socket
  closeSocket () {
    this.isNeedConnect = false
    clearInterval(this.activeInterval)
    clearInterval(this.recConnectInterval)
  }

  // 允许socket重连
  enableReconnect () {
    this.isNeedConnect = true
    this.reconnect()
  }

  sendFirstClosedNoti (reason) {
  }

  /** 打包心跳包 **/
  getActivePack () {
    // 20210222 心跳包大小修改为20+20+16+4+4=64
    const arrayBuffer = new ArrayBuffer(16 + 48)
    const activePack = new DataView(arrayBuffer)
    const pos = 40
    for (let i = 0; i < 4; i++) {
      activePack.setUint32(pos + i * 4, 0)
    }
    this.sendRequestCmd(socketConst.NET_DATA_TYPE_ACTPACK, 0, 0, activePack)
  }

  /** 本函数负责统一写网络包的公共部分，并发送网络包
   * 发送请求命令:参数：type:uint,subtype:uint,status:uint, sockets:DataView</br>
   * </br>
   */
  sendRequestCmd (type, subtype, status, sockets) {
    if (!this.websocket || this.websocket.readyState !== 1) {
      this.reconnect()
      return
    }

    const packSize = sockets.byteLength
    /** 网络包头【20】:</br>
     *No.1: SOI【4】 ; No.2:DataPackSize【4】;No.3【4】;No.4:DataType【4】;No.5:PackID
     */
    sockets.setUint32(0, socketConst.NET_SOI, true)
    sockets.setUint32(4, packSize, true)
    sockets.setUint32(8, socketConst.NET_VER, true)
    switch (type) {
      case socketConst.NET_DATA_TYPE_ACTPACK:
        sockets.setUint32(12, socketConst.NET_DATA_TYPE_ACTPACK, true)
        break
      case socketConst.TYPE_LOGIN:
        sockets.setUint32(12, socketConst.NET_DATA_TYPE_UTTOPT_LOGIN, true)
        break
      case socketConst.TYPE_PRO_REQUEST:
        sockets.setUint32(12, socketConst.NET_DATA_TYPE_UTTOPT_PRO_REQUEST, true)
        break
      case socketConst.TYPE_IMMEDIATECUSTOMPRO:
      case socketConst.TYPE_IMMEDIATESTREAM:
        sockets.setUint32(12, socketConst.NET_TYPE_CS_IMCUSTOMPRO, true)
        break
      case socketConst.TYPE_CHATMESS:
        sockets.setUint32(12, socketConst.NET_DATA_TYPE_CHATMESS, true)
        break
      case socketConst.NET_DATA_WR_X100_RADARCMD:
        sockets.setUint32(12, socketConst.NET_DATA_WR_X100_RADARCMD, true)
        break
      // case UserConst.TYPE_TO_PT_INSERT:
      // case UserConst.TYPE_TO_PT_DELETE:
      // case UserConst.TYPE_TO_PT_KICK:
      //   sockets.setUint32(12, UserConst.NET_DATA_USER_MANAGER, true);
      //   break;
      case socketConst.TYPE_CONTROL:
      case socketConst.CT_CONTROL_TASKSCONTROL:
      case socketConst.CT_CONTROL_DELETETASK:
      case socketConst.CT_CONTROL_ADDTASKS:
        sockets.setUint32(12, socketConst.NET_DATA_TYPE_UTTOPT_CT_CONTROL, true)
        break
      case socketConst.PLANTASK_PLAN:
      case socketConst.PLANTASK_PLAN_DROP:
      case socketConst.PLANTASK_PLANTASK:
      case socketConst.PLANTASK_PLANTASK_DROP:
      case socketConst.PLANTASK_PLANTASKPARAM:
      case socketConst.PLANTASK_PLANTASKPARAM_DROP: sockets.setUint32(12, socketConst.NET_DATA_SS_PLANTASK, true)
        break
      case socketConst.OPENCLOSERADARST_OPEN: // 启动雷达
      case socketConst.OPENCLOSERADARST_CLOSE:// 关闭雷达
        sockets.setUint32(12, socketConst.NET_DATA_TYPE_CTTOUT_OPENCLOSERADARST, true)
        break
      case socketConst.TYPE_AUTOREGULARTIME_GET:// WEB获取设置定时时间
      case socketConst.TYPE_AUTOREGULARTIME_SET:// WEB设置定时时间
        sockets.setUint32(12, socketConst.NET_DATA_SC_AUTOREGULARTIME, true)
        break
      case socketConst.TYPE_SHUTDOWNCONTROL:// 远程关机
        sockets.setUint32(12, socketConst.TYPE_SHUTDOWNCONTROL, true)
        break
      case socketConst.TYPE_OPENCLOSERADARST_DEFAULTPAR_FL:
      case socketConst.TYPE_LOGIN_DEFAULTPAR:
        sockets.setUint32(12, socketConst.NET_DATA_TYPE_UTTOPT_DEFAULTPAR_REQUEST, true)
        break
      default:
        // 'Socket在发送不明类型的消息
    }
    // sockets.setUint32(16, 0, true) // 网络包头的序号只用来显示！目前web端写0
    sockets.setUint32(16, packID++, true) // 网络包头的序号自增
    /** 数据包部分：【3756】 */
    /** No.1:startflag【4】;No.2:ID【4】;No.3:type【4】;No.4:subtype【4】;No.5:status【4】;</br>
     *No.6:UNION_DATA data:The Data buffer;No.7:endflag【4】;结束标记 */
    sockets.setUint32(20, socketConst.START_FLAG, true)
    sockets.setUint32(24, 0xB55B, true)
    sockets.setUint32(28, type, true)
    sockets.setUint32(32, subtype, true)
    sockets.setUint32(36, status, true)
    /** 结束标志【4】 */
    sockets.setUint32(packSize - 8, 0, true)
    /** 网络包尾：PT_NET_PACKEND */
    sockets.setUint32(packSize - 4, socketConst.NET_EOI, true)
    this.websocket.send(sockets)
  }

  bufferByteArray = null
  head = 0
  sizeFlag = 0
  /** 处理 byteArray **/
  progress (byteArray) {
    this.bufferByteArray = new DataView(byteArray)
    this.head = this.bufferByteArray.getUint32(0, true)
    if (this.head === socketConst.NET_SOI) {
      this.sizeFlag = this.bufferByteArray.getUint32(4, true)
      while (this.bufferByteArray.byteLength >= this.sizeFlag && this.sizeFlag > 0 && this.head === socketConst.NET_SOI) {
        this.cutPackage(this.sizeFlag)
      }
    } else {
      this.bufferByteArray = null
      this.head = 0
      this.sizeFlag = 0
    }
  }

  /** 按照指定大小分包 **/
  cutPackage (sizeflag) {
    // let arrayBuffer = new ArrayBuffer(sizeflag)
    // let result = new DataView(arrayBuffer)
    const result = this.bufferByteArray
    const tmpbuffer = new ArrayBuffer(this.bufferByteArray.byteLength - sizeflag)
    const temparray = new DataView(tmpbuffer)
    for (let i = 0; i < this.bufferByteArray.byteLength - sizeflag; i++) {
      temparray.setUint8(i, this.bufferByteArray.getUint8(i + sizeflag))
    }
    this.bufferByteArray = 0
    if (temparray.byteLength > 0) {
      this.bufferByteArray = temparray
    }
    if (this.bufferByteArray.byteLength > socketConst.MINIMUMPACKAGESIZE) {
      this.head = this.bufferByteArray.getUint32(0, true)
      this.sizeFlag = this.bufferByteArray.getUint32(4, true)
    } else {
      this.head = 0
      this.sizeFlag = 0
    }
    this.dispatchPackage(result)
  }

  /** 将正确的包派发出去 **/
  dispatchPackage (packageData) {
    // console.log('将正确的包派发出去', packageData)
    const dataType = packageData.getUint32(12, true) // 获取数据类型，十进制
    const businessBuffer = new ArrayBuffer(packageData.byteLength - 24)
    const businessData = new DataView(businessBuffer)
    /* 将包去头去尾 */
    for (let i = 20; i < packageData.byteLength - 4; i++) {
      businessData.setUint8(i - 20, packageData.getUint8(i))// [i-20] = result[i];
    }

    if (dataType === socketConst.NET_DATA_TYPE_CTTOUT_OPENCLOSERADARST) {
      console.log('dataType === socketConst.NET_DATA_TYPE_CTTOUT_OPENCLOSERADARST ,dataType:' + '0x' + dataType.toString(16))
    }
    if (socketConst.NET_DATA_TYPE_ACTPACK !== dataType) {
      if (this.dispatchCallback) this.dispatchCallback(socketConst.SOCKET_NOTI, { notiName: socketConst.SOCKET_NOTI, notiType: dataType, notiBody: businessBuffer }) // 全局事件派发
    }
  }

  /** 发送登录验证消息 subtype==socketConst.LOGIN_OUT,表示注销当前用户；其它值表示登录，由于PT没判断 ！= socketConst.LOGIN_OUT的，故都用0 */
  loginInfIdentify (subtype, name, pass) {
    if (!name) return
    const arrayBuffer = new ArrayBuffer(116 + 48)
    const dataView = new DataView(arrayBuffer)
    const pos = 40
    let i = 0
    for (i = 0; i < name.length; i++) {
      dataView.setInt8(pos + i, buffer.getBytes(name)[i], true)
    }
    for (i = name.length; i < 32; i++) {
      dataView.setInt8(pos + i, 0, true)
    }
    for (i = 32; i < 32 + pass.length; i++) {
      dataView.setInt8(pos + i, buffer.getBytes(pass)[i - 32], true)
    }
    for (i = 32 + pass.length; i < 64; i++) {
      dataView.setInt8(pos + i, 0, true)
    }
    // i=104 userID
    for (i = 64; i < 116; i++) {
      dataView.setInt8(pos + i, 0, true)
    }
    // 20191220 增加注销用户命令，其他的保持原样
    if (subtype !== socketConst.LOGIN_OUT) {
      this.sendRequestCmd(socketConst.TYPE_LOGIN, 0, 0, dataView)
    } else {
      this.sendRequestCmd(socketConst.TYPE_LOGIN, subtype, 0, dataView)
    }
  }

  /** 接收登录验证反馈消息  loginSCallFun:登录成功回调，loginFCallFun：登录失败回调 */
  receiveLoginInfIdentify (noti, loginSCallFun, loginFCallFun) {
    if (!noti) return
    if (noti.notiType === socketConst.NET_TYPE_CS_LOGIN) {
      const arraybuffer = noti.notiBody
      let temp = buffer.getArrFromBuffer(arraybuffer, 8, 'Uint32', 2)
      const type = temp[0]
      const subtype = temp[1]
      if (type === socketConst.TYPE_LOGIN) {
        temp = buffer.getArrFromBuffer(arraybuffer, 20, 'Uint8', 32)
        const name = this.textDecoder(temp)
        temp = buffer.getArrFromBuffer(arraybuffer, 52, 'Uint8', 32)
        const pass = this.textDecoder(temp)
        temp = buffer.getArrFromBuffer(arraybuffer, 84, 'Uint8', 32)
        const ip = this.textDecoder(temp)
        temp = buffer.getArrFromBuffer(arraybuffer, 116, 'Int32', 3)
        const loginStatus = temp[0]
        const jobs = temp[1] // 用户等级（1，管理员，2普通用户）
        const userID = temp[2]
        temp = buffer.getArrFromBuffer(arraybuffer, 128, 'Uint32', 1)
        // 用户Socket
        const userSocketID = temp[0]

        const userObj = {
          userID: userID,
          name: name,
          pass: pass,
          jobs: jobs,
          ip: ip,
          userSocketID: userSocketID
        }
        if (loginStatus === socketConst.LOGIN_IN_SUCESS) {
          // 成功登陆pt；
          // sendNotification(NameSpace.LOGIN +  NameSpace.NOTIFICATION, "登陆PT成功！",NameSpace.SUCCESS);
          loginSCallFun && loginSCallFun(userObj)
        } else if (loginStatus === socketConst.LOGIN_IN_FAILED) {
          temp = buffer.getArrFromBuffer(arraybuffer, 132, 'Int32', 1)
          const loginErrorCode = temp[0]
          let loginErrorStr = ''
          let alertStr = ''
          if (loginErrorCode === socketConst.LOGIN_ERRORCODE_InfoErr) {
            // '登录失败：用户名或密码不正确'
            loginErrorStr = i18n.t('tips.loginInfoErr')
          } else if (loginErrorCode === socketConst.LOGIN_ERRORCODE_Offline) {
            // 已被迫下线，
            loginErrorStr = '【' + name + '】' + i18n.t('tips.loginElseWhere') // ApplicationSettings.currentUserVo.ip
            alertStr = loginErrorStr
          } else if (loginErrorCode === socketConst.LOGIN_ERRORCODE_UserDel) {
            loginErrorStr = '【' + name + '】' + i18n.t('tips.loginUserDel')
            alertStr = loginErrorStr
          } else if (loginErrorCode === socketConst.LOGIN_ERRORCODE_NoUser) {
            loginErrorStr = i18n.t('tips.loginNoUser') // '登录失败：用户不存在，请刷新浏览器或更换用户名重新登录'
          } else if (loginErrorCode === socketConst.LOGIN_ERRORCODE_MaxLine) {
            // '登录失败：在线人数已达到上限'
            loginErrorStr = i18n.t('tips.loginMaxLine')
            alertStr = loginErrorStr + i18n.t('tips.loginlijiCon')
          } else if (loginErrorCode === socketConst.LOGIN_ERRORCODE_UserExist) {
            // 用户已存在拒接登录
            loginErrorStr = i18n.t('tips.loginElseWhere')
          }

          loginFCallFun && loginFCallFun(userObj, alertStr, loginErrorCode, loginErrorStr)
        }
      }
    }
  }

  dispose () {
    clearInterval(this.activeInterval)
    clearInterval(this.recConnectInterval)
    this.websocket.close() // 关闭连接
    this.isNeedConnect = false
    this.websocket = null
  }

  /** 字符串编码 */
  textEncoder (str, encodeRule = 'utf8') {
    let arr = []
    if (str) {
      arr = new window.TextEncoder(encodeRule || store.state.systemInfo.textCodeRule, { NONSTANDARD_allowLegacyEncoding: true }).encode(str)
    }
    return arr
  }

  /** 字符串解码 */
  textDecoder (arr, decodeRule = 'utf8') {
    let str = ''
    if (arr) {
      const index = arr.findIndex(item => {
        return item === 0
      })
      if (index !== -1)arr = arr.slice(0, index)
      str = new window.TextDecoder(decodeRule || store.state.systemInfo.textCodeRule).decode(arr)
    }
    return str
  }

  /**
   * @Des    : 产品申请模块
   *
   * @Author : Tang Zhenming
   * @Date   : 2019/11/1
   *
   **/
  // 单个产品（实时与指定时间申请公共部分） buffer 写入，共计 296 个字节
  setProductDataView (dataView, pos, proConfVo) {
    dataView.setInt32(pos, proConfVo.type, true) // 产品类型
    pos += 4
    dataView.setInt8(pos, 1) // bStart 是否请求
    pos += 1
    dataView.setInt8(pos, 0) // bUpPic 是否上传图片
    pos += 1
    dataView.setInt8(pos, 0) // bUpData 是否上传数据
    pos += 1
    dataView.setInt8(pos, 1) // 字节占位
    pos += 1

    // 写入起始时间与结束时间
    const setTime = function (time) {
      const dateObj = new Date(time)
      dataView.setInt16(pos, dateObj.getFullYear(), true)
      pos += 2
      dataView.setInt16(pos, dateObj.getMonth(), true)
      pos += 2
      dataView.setInt16(pos, dateObj.getDay(), true)
      pos += 2
      dataView.setInt16(pos, dateObj.getDate(), true) // 日
      pos += 2
      dataView.setInt16(pos, dateObj.getHours(), true)
      pos += 2
      dataView.setInt16(pos, dateObj.getMinutes(), true)
      pos += 2
      dataView.setInt16(pos, dateObj.getSeconds(), true)
      pos += 2
      dataView.setInt16(pos, dateObj.getMilliseconds(), true)
      pos += 2
    }
    if (proConfVo.sTime === 0) {
      for (let i = 0; i < 16; i++) {
        dataView.setInt16(pos, 0, true)
        pos += 2
      }
    } else {
      setTime(proConfVo.sTime)
      setTime(proConfVo.eTime)
    }

    // 产品名
    let nameStr = 'pt';
    // if (i18n.locale === i18n.lanZH) { // 中英文
    //   nameStr = proConfVo.cname
    // } else {
    //   nameStr = proConfVo.ename
    // }
    const encodeName = this.textEncoder(nameStr)

    for (let i = 0; i < encodeName.length; i++) {
      dataView.setInt8(pos, encodeName[i])
      pos += 1
    }

    for (let i = encodeName.length; i < socketConst.MAX_FILE_LEN; i++) { // 字节补齐
      dataView.setInt8(pos, 0)
      pos += 1
    }

    // 产品参数
    if (proConfVo.type === ProductType.USP_TYPE) { // 用户可选降水
      console.log(proConfVo.params)
      proConfVo.params.forEach((item, index) => {
        // 时间戳使用 Uint 存
        if (index < 2) dataView.setUint32(pos, item, true)
        else dataView.setFloat32(pos, item, true)
        pos += 4
      })
    } else {
      proConfVo.params.forEach(item => {
        dataView.setFloat32(pos, item, true)
        pos += 4
      })
    }

    for (let i = proConfVo.params.length; i < 32; i++) { // 最多 32 个参数，剩余补位
      dataView.setFloat32(pos, 0, true)
      pos += 4
    }

    // 添加备用字节
    for (let i = 0; i < socketConst.MAX_FILE_LEN; i++) {
      dataView.setInt8(pos, 0)
      pos += 1
    }

    return [pos, nameStr]
  }

  // 实时产品申请
  sendProductToPT (productList) {
    const arrayBuffer = new ArrayBuffer(296 * productList.length + 4 + 48)
    const dataView = new DataView(arrayBuffer)
    let pos = 40 // 初始字节偏移量，写入网络包头，40 个字节；网络包尾还有 8 个字节，40 + 8 = 48 ，包尾在函数 sendRequestCmd 中写入

    dataView.setInt32(pos, productList.length, true) // 申请产品个数
    pos += 4

    let nameStr
    for (let i = 0; i < productList.length; i++) {
      const proConfVo = productList[i]
      const arr = this.setProductDataView(dataView, pos, proConfVo)
      pos = arr[0]
      nameStr = arr[1]
    }

    this.sendRequestCmd(socketConst.TYPE_PRO_REQUEST, 0, 0, dataView)
  }

  // 指定时间产品申请
  sendOnTimeProductToPT (proConfVo, userId) {
    const arrayBuffer = new ArrayBuffer(296 + 48 + 8 + socketConst.MAXCUSTOMPROVOLPATH)
    const dataView = new DataView(arrayBuffer)
    let pos = 40

    dataView.setUint32(pos, userId, true) // 当前用户的ID
    pos += 4

    dataView.setUint32(pos, 0, true) // 当前的Socket编号
    pos += 4

    // 体扫文件的查询由PT完成，因此本字段只需补齐
    for (let i = 0; i < socketConst.MAXCUSTOMPROVOLPATH; i++) {
      dataView.setInt8(pos, 0)
      pos += 1
    }

    const nameStr = this.setProductDataView(dataView, pos, proConfVo)[1]

    // this.dispatchCallback(NameSpace.INSERT + NameSpace.SYSTEMLOG, new SysLogVo(SysLogConst.LOG_TYPE_SOCKET, i18n.t('apply.applySpTLable') + '【' + nameStr + '】', true, true, true))
    console.log('sendOnTimeProductToPT ==>', proConfVo)
    if (proConfVo.level !== 3) this.sendRequestCmd(socketConst.TYPE_IMMEDIATECUSTOMPRO, 0, 0, dataView)
    else this.sendRequestCmd(socketConst.TYPE_IMMEDIATESTREAM, 0, 0, dataView)
  }

  /**
   * @Des    : 聊天室模块
   * clientMsgArr: 发送给 C++ 的字符串，经过编码后生成的数组
   * @Author : Tang Zhenming
   * @Date   : 2019/11/1
   *
   **/
  sendMsgToPT (clientMsgArr) {
    const arrayBuffer = new ArrayBuffer(socketConst.MAX_CHATMESSAGE_LEN + 48)
    const dataView = new DataView(arrayBuffer)
    let pos = 40

    for (let i = 0; i < clientMsgArr.length; i++) {
      dataView.setUint8(pos, clientMsgArr[i])
      pos += 1
    }

    this.sendRequestCmd(socketConst.TYPE_CHATMESS, socketConst.NET_DATA_TYPE_CHATMESS, 0, dataView)
  }

  /**
   * @Des    : 雷达控制模块：终端遥控关机
   * 风灵系统，暂时注释，已完成
   * @Date   : 2019/11/20
   *
   **/
  sendShutDownToPT () {
    const arrayBuffer = new ArrayBuffer(48 + 4)
    const dataView = new DataView(arrayBuffer)
    const pos = 40

    dataView.setInt32(pos, socketConst.TYPE_SHUTDOWN, true)

    this.sendRequestCmd(socketConst.TYPE_SHUTDOWNCONTROL, 0, 0, dataView)
  }

  /**
   * @Des    : 雷达控制模块：雷达扫描控制
   * action: 1 雷达任务运行 0 雷达任务停止
   * @Author : Tang Zhenming
   * @Date   : 2019/11/16
   *
   **/
  sendRadarStateToPT (action) {
    const arrayBuffer = new ArrayBuffer(48)
    const dataView = new DataView(arrayBuffer)

    this.sendRequestCmd(socketConst.CT_CONTROL_TASKSCONTROL, 0, action, dataView)
  }

  /**
   * @Des    : 雷达控制模块：雷达控制模式
   *
   * @Author : Tang Zhenming
   * @Date   : 2019/11/20
   *
   **/
  sendCtrlModeToPT () {
    const arrayBuffer = new ArrayBuffer(48)
    const dataView = new DataView(arrayBuffer)

    this.sendRequestCmd(socketConst.TYPE_CONTROL, socketConst.CON_MODE, 0, dataView)
  }

  /**
   * @Des    : 雷达控制模块：任务列表，删除任务
   * pCmdAddress: c++ 返回任务列表中的删除标识
   * @Author : Tang Zhenming
   * @Date   : 2019/11/21
   *
   **/
  sendDelTaskToPT (pCmdAddress) {
    const arrayBuffer = new ArrayBuffer(48 + 8)
    const dataView = new DataView(arrayBuffer)
    let pos = 40

    dataView.setInt32(pos, pCmdAddress, true)
    pos += 4

    dataView.setInt32(pos, 0, true)

    this.sendRequestCmd(socketConst.CT_CONTROL_DELETETASK, 0, 0, dataView)
  }

  /**
   * @Des    : 雷达控制模块：添加任务
   * @Author : Tang Zhenming
   * @Date   : 2019/11/20
   **/
  // 获取方案列表
  getSchemeListFromPT () {
    const arrayBuffer = new ArrayBuffer(40 + 8)
    const dataView = new DataView(arrayBuffer)
    // this.sendRequestCmd(socketConst.PLANTASK_PLAN, socketConst.PLANTASK_SELECT, 0, dataView)
    // C++ 下拉
    this.sendRequestCmd(socketConst.PLANTASK_PLAN_DROP, socketConst.PLANTASK_SELECT, 0, dataView)
  }

  // 方案执行
  excuteSchemeByPT (schemeNameArr) {
    const arrayBuffer = new ArrayBuffer(40 + 8 + 4 + socketConst.PLANTASKNAMELEN + socketConst.PLANTASKNAMELEN)
    const dataView = new DataView(arrayBuffer)
    let pos = 40

    dataView.setInt32(pos, 1, true) // 方案个数
    pos += 4

    for (let i = 0; i < socketConst.PLANTASKNAMELEN; i++) {
      dataView.setUint8(pos, 0)
      pos += 1
    }

    for (let i = 0; i < schemeNameArr.length; i++) {
      dataView.setUint8(pos, schemeNameArr[i])
      pos += 1
    }
    for (let i = schemeNameArr.length; i < socketConst.PLANTASKNAMELEN; i++) {
      dataView.setUint8(pos, 0)
      pos += 1
    }

    // this.sendRequestCmd(socketConst.PLANTASK_PLAN, socketConst.PLANTASK_RUN, 0, dataView)
    // C++ 下拉
    this.sendRequestCmd(socketConst.PLANTASK_PLAN_DROP, socketConst.PLANTASK_RUN, 0, dataView)
  }

  // 方案任务列表
  getTaskListFromPT (schemeNameArr) {
    const arrayBuffer = new ArrayBuffer(40 + 8 + socketConst.PLANTASKNAMELEN)
    const dataView = new DataView(arrayBuffer)
    let pos = 40

    for (let i = 0; i < schemeNameArr.length; i++) {
      dataView.setUint8(pos, schemeNameArr[i])
      pos += 1
    }
    for (let i = schemeNameArr.length; i < socketConst.PLANTASKNAMELEN; i++) {
      dataView.setUint8(pos, 0)
      pos += 1
    }

    // this.sendRequestCmd(socketConst.PLANTASK_PLANTASK, socketConst.PLANTASK_SELECT, 0, dataView)
    // C++ 下拉
    this.sendRequestCmd(socketConst.PLANTASK_PLANTASK_DROP, socketConst.PLANTASK_SELECT, 0, dataView)
  }

  // 任务参数列表
  getParamListFromPT (schemeNameArr, taskNameArr, isDrop) {
    const arrayBuffer = new ArrayBuffer(40 + 8 + socketConst.PLANTASKNAMELEN + socketConst.PLANTASKNAMELEN)
    const dataView = new DataView(arrayBuffer)
    let pos = 40

    for (let i = 0; i < schemeNameArr.length; i++) {
      dataView.setUint8(pos, schemeNameArr[i])
      pos += 1
    }
    for (let i = schemeNameArr.length; i < socketConst.PLANTASKNAMELEN; i++) {
      dataView.setUint8(pos, 0)
      pos += 1
    }

    for (let i = 0; i < taskNameArr.length; i++) {
      dataView.setUint8(pos, taskNameArr[i])
      pos += 1
    }
    for (let i = taskNameArr.length; i < socketConst.PLANTASKNAMELEN; i++) {
      dataView.setUint8(pos, 0)
      pos += 1
    }

    if (isDrop) this.sendRequestCmd(socketConst.PLANTASK_PLANTASKPARAM_DROP, socketConst.PLANTASK_SELECT, 0, dataView) // C++ 下拉
    else this.sendRequestCmd(socketConst.PLANTASK_PLANTASKPARAM, socketConst.PLANTASK_SELECT, 0, dataView)
  }
  // 任务执行
  // excuteTaksByPT (schemeNameArr, taskNameArr) {
  //   console.log(schemeNameArr, taskNameArr)
  //   let arrayBuffer = new ArrayBuffer(40 + 8 + socketConst.PLANTASKNAMELEN + socketConst.PLANTASKNAMELEN)
  //   let dataView = new DataView(arrayBuffer)
  //   let pos = 40
  //
  //   for (let i = 0; i < schemeNameArr.length; i++) {
  //     dataView.setUint8(pos, schemeNameArr[i])
  //     pos += 1
  //   }
  //   for (let i = schemeNameArr.length; i < socketConst.PLANTASKNAMELEN; i++) {
  //     dataView.setUint8(pos, 0)
  //     pos += 1
  //   }
  //
  //   for (let i = 0; i < taskNameArr.length; i++) {
  //     dataView.setUint8(pos, taskNameArr[i])
  //     pos += 1
  //   }
  //   for (let i = taskNameArr.length; i < socketConst.PLANTASKNAMELEN; i++) {
  //     dataView.setUint8(pos, 0)
  //     pos += 1
  //   }
  //
  //   console.log(123)
  //   this.sendRequestCmd(socketConst.PLANTASK_PLANTASK, socketConst.PLANTASK_RUN, 0, dataView)
  // }

  // PPI RHI 参数设置
  sendPpiRhiToPT (schemeData, type) {
    schemeData = JSON.parse(JSON.stringify(schemeData))
    const arrayBuffer = new ArrayBuffer(48 + socketConst.PLANTASKNAMELEN * 4 + 48 + 84 * schemeData.attributes.ScanLayer)
    const dataView = new DataView(arrayBuffer)
    let pos = 40
    console.log('发送的数据包：', schemeData, dataView.byteLength)

    // 方案名称
    let cPlanName = schemeData.attributes.cPlanName
    cPlanName = this.textEncoder(cPlanName)
    for (let i = 0; i < cPlanName.length; i++) {
      dataView.setUint8(pos, cPlanName[i])
      pos += 1
    }
    for (let i = cPlanName.length; i < socketConst.PLANTASKNAMELEN; i++) {
      dataView.setUint8(pos, 0)
      pos += 1
    }

    // 任务属性
    // 任务属性——任务名称
    let cTaskName = schemeData.attributes.cTaskName
    cTaskName = this.textEncoder(cTaskName)
    for (let i = 0; i < cTaskName.length; i++) {
      dataView.setUint8(pos, cTaskName[i])
      pos += 1
    }
    for (let i = cTaskName.length; i < socketConst.PLANTASKNAMELEN; i++) {
      dataView.setUint8(pos, 0)
      pos += 1
    }
    // 任务属性——扫描类型
    dataView.setInt32(pos, schemeData.attributes.ScanMode, true)
    pos += 4
    // 任务属性——任务类型
    dataView.setInt32(pos, socketConst.TaskTypeConst_RIGHTNOW, true)
    pos += 4
    // 任务属性——开始时间（暂时填0，JS set 64 有版本要求）
    for (let i = 0; i < 8; i++) {
      dataView.setInt8(pos, 0)
      pos += 1
    }
    // 任务属性——运行次数
    dataView.setInt32(pos, 1, true)
    pos += 4
    // 任务属性——周期间隔
    dataView.setInt32(pos, 0, true)
    pos += 4

    // 任务参数
    // 任务参数——方案名称
    for (let i = 0; i < cPlanName.length; i++) {
      dataView.setUint8(pos, cPlanName[i])
      pos += 1
    }
    for (let i = cPlanName.length; i < socketConst.PLANTASKNAMELEN; i++) {
      dataView.setUint8(pos, 0)
      pos += 1
    }
    // 任务参数——任务名称
    for (let i = 0; i < cTaskName.length; i++) {
      dataView.setUint8(pos, cTaskName[i])
      pos += 1
    }
    for (let i = cTaskName.length; i < socketConst.PLANTASKNAMELEN; i++) {
      dataView.setUint8(pos, 0)
      pos += 1
    }
    // 任务参数——扫描模式
    dataView.setInt32(pos, schemeData.attributes.ScanMode, true)
    pos += 4
    // 任务参数——doneedstart doneedend
    for (let i = 0; i < 16; i++) {
      dataView.setInt8(pos, 0)
      pos += 1
    }
    // 任务参数——扫描层数
    dataView.setUint32(pos, schemeData.attributes.ScanLayer, true)
    pos += 4

    // 任务参数——参数  单个长度: 84   数据包长度需要*ScanLayer
    dataView.setInt8(pos, schemeData.params.AntType)
    pos += 1
    dataView.setInt8(pos, schemeData.params.ProMode_0)
    pos += 1
    dataView.setInt8(pos, schemeData.params.ProMode_1)
    pos += 1
    dataView.setInt8(pos, schemeData.params.ProMode_2)
    pos += 1

    dataView.setFloat32(pos, schemeData.params.AzAngleOne, true)
    pos += 4
    dataView.setFloat32(pos, schemeData.params.AzAngleTwo, true)
    pos += 4
    dataView.setFloat32(pos, schemeData.params.ElAngleOne, true)
    pos += 4
    dataView.setFloat32(pos, schemeData.params.ElAngleTwo, true)
    pos += 4
    dataView.setFloat32(pos, schemeData.params.AzRate, true)
    pos += 4
    dataView.setFloat32(pos, schemeData.params.ElRate, true)
    pos += 4

    // pw0
    dataView.setFloat32(pos, schemeData.params.Prf_0, true)
    pos += 4
    dataView.setFloat32(pos, schemeData.params.FreRatio1_0, true)
    pos += 4
    dataView.setFloat32(pos, schemeData.params.FreRatio2_0, true)
    pos += 4

    // char24
    for (let i = 0; i < 24; i++) {
      dataView.setInt8(pos, 1)
      pos += 1
    }

    // pw0
    dataView.setInt16(pos, schemeData.params.AccCnt1_0, true)
    pos += 2
    dataView.setInt16(pos, schemeData.params.AccCnt2_0, true)
    pos += 2
    dataView.setInt16(pos, schemeData.params.AccCnt3_0, true)
    pos += 2

    // char8
    for (let i = 0; i < 8; i++) {
      dataView.setInt8(pos, 2)
      pos += 1
    }

    dataView.setInt16(pos, schemeData.params.CoheAc, true)
    pos += 2
    dataView.setInt16(pos, schemeData.params.SpecAcc, true)
    pos += 2

    dataView.setInt16(pos, schemeData.params.TxMode, true)
    // if (type === 'ppirhi') this.sendRequestCmd(socketConst.PLANTASK_PLANTASK, socketConst.PLANTASK_PPIRHI, 0, dataView) // ppi rhi
    // if (type === 'update') this.sendRequestCmd(socketConst.PLANTASK_PLANTASK, socketConst.PLANTASK_UPDATE, 0, dataView) // 参数修改
    // C++ 下拉
    if (type === 'ppirhi') this.sendRequestCmd(socketConst.PLANTASK_PLANTASK_DROP, socketConst.PLANTASK_PPIRHI, 0, dataView) // ppi rhi
    if (type === 'update') this.sendRequestCmd(socketConst.PLANTASK_PLANTASK_DROP, socketConst.PLANTASK_UPDATE, 0, dataView) // 参数修改
  }

  /**
   * @Des    : 雷达控制模块：WR-X100
   * @Author : Tang Zhenming
   * @Date   : 2019/12/22
   *
   **/
  sendWrX100ToPT (val) {
    // console.log(val)
    const arrayBuffer = new ArrayBuffer(48 + 7)
    const dataView = new DataView(arrayBuffer)
    let pos = 40

    dataView.setInt16(pos, 7, true) // 命令头长度
    pos += 2
    dataView.setInt16(pos, 0, true) // 序列码
    pos += 2
    dataView.setInt16(pos, val, true) // 命令码
    pos += 2
    dataView.setInt8(pos, 0, true)

    this.sendRequestCmd(socketConst.NET_DATA_WR_X100_RADARCMD, 0, 0, dataView)
  }

  /**
   * 初始化系统完成后通知websocket服务
   * @param type
   */
  sendInitSystem () {
    const arrayBuffer = new ArrayBuffer(48)
    const dataView = new DataView(arrayBuffer)
    this.sendRequestCmd(socketConst.TYPE_LOGIN_DEFAULTPAR, 0, 0, dataView)
  }
}
