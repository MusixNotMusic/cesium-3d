const NameSpace = {
  /** *****************公共消息*********************/
  PRODUCTLEVEL_FIRST: 0,
  COLOR: 'Color',

  REALDATAADDRESS: 'RealDataAddress',
  CUT: 'Cut',
  RULE: 'Rule',
  DEFINEQUYU: 'defineQuYu',
  CONTROL: 'Control',
  CHANGED: 'Changed',

//  ZOOM: 'Zoom', // 产品操作...
  IN: 'In', // 放大
  OUT: 'Out',	// 缩小
  RESET: 'Reset',	// 恢复初始

  DATARECEIVEMODE: 'DataReceiveMode',
  RECEIVEDATAMODE_REAL: 'RECEIVEDATAMODE_REAL',	// 接收实时数据
  RECEIVEDATAMODE_UNREAL: 'RECEIVEDATAMODE_UNREAL',	// 接收非实时数据
  RECEIVEMODE_NODATA: 'RECEIVEMODE_NODATA',		// 不接收数据

  BYMCODEINPREIOD: 'ByMCodeInPeriod',
  BYMCODENEWST: 'ByMCodeNewst',
  BYTYPENEWST: 'ByTypeNewst',
  DOUBLECLIC: 'DoubleClick',

/** 表示用户选择/非实时 */
  UNREALPRODUCT: 'UnRealProduct',

/** 表示实时接收/实时数据 */
  REALPRODUCT: 'RealProduct',

/** *****************公共定义*********************/
  MEDIATOR: 'Mediator',
  NOTIFICATION: 'NOTIFICATION',

  CONNECT: 'CONNECT',
  LOAD: 'LOAD',
/** *****************后台接口*********************/
  INSERT: 'INSERT',
  SELECT: 'SELECT',
/** *****************登陆与注销******************** */
  LOGIN: 'Login',
  LOGOUT: 'LOGOUT',
  KICK: 'KICK',
  SOCKET: 'Socket',
  CLOSE: 'CLOSE',
/** *****************模块名称******************** */
  CHAT: 'Chat',
  SINGLEVIEW: 'SINGLEVIEW', // 单视图模式
  MULTIPLVIEW: 'MULTIPLVIEW', // 多视图模式

  TASK: 'Task',
  DOPPI: 'DOPPI',
  DORHI: 'DORHI',
  DORPI: 'DORPI',
  PRODUCTAPPLY: 'ProductApply',
  ONCEAPPLYPRODUCT: 'OnceApplyProduct', // 指定时间产品
  SYSTEMLOG: 'SystemLog',

  RESIZE: 'resize',
  PVIEW: 'pView',

  CREATE_ANIMATION: 'create_animation', // 生成动画
  TOP_SCAN_PRODUCT: 'top_scan_product', // 派发绘制顶扫产品事件
  TOP_SCAN_TOOL: 'top_scan_tool', // 顶扫产品图工具栏事件派发
  PRODUCT_CHANGE: 'product_change', // 产品切换时派发
  SHOW_FRAME_SELECTION_VIEW: 'show_frame_selection_view', // 显示需要框选弹窗的产品视图
}
export default {
  ...NameSpace
}
