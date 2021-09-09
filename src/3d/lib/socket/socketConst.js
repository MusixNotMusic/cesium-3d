const socketConst = {
  SOCKET_NOTI: 'socket_noti',
  CLOSE: 'close',
  OPEN: 'open',
  /**
   * 使用此IOCP通信的网络包的前4个字节为网络包头，往后相邻的4个字节为网络包的大小
   */
  PACKET_SIZE: 131000,
  /**
   *网络包头的大小(4个字节的标识符)
   */
  NET_HEAD_SIZE: 4,
  /**
   *需要8个字节才能知道这个包的大小
   */
  MINIMUMPACKAGESIZE: 8,
  /**
   *最大128k
   */
  MAXIMUMPACKAGESIZE: 131072,
  MAXIMUMSEQUENSENUMBER: 1000000,

  MAX_GEN_ERRORINF_LEN: 1000,
  /**
   *同时开始的读取操作的个数
   */
  PENDING_READS_NUMBER: 4,
  /**
   *可以关闭socket时PendingNumber的数量(加上一个ZeroRead,确保没有写操作时关闭socket)
   */
  CLSOE_SOCKET_PENDING_NUMBER: 5,

  /** 字节位置偏移：0<br>
   *包头No.1: 网络包头SOI【4】
   */
  NET_SOI: 0xa55a4321,
  /** 字节位置偏移：8<br>
   * 包头No.3:通信协议版本号
   */
  NET_VER: 1,
  /**
   *网络包尾巴
   */
  NET_EOI: 0x5aa51234,
  /** 字节位置偏移：12<br>
   * 网络包头No.4:DataType【4】类型： 心跳包类型
   * */
  NET_DATA_TYPE_ACTPACK: 0x5551aaa1,
  /** 字节位置偏移：12<br>
   * 网络包头No.4:DataType【4】类型：拒绝连接信息包类型
   **/
  NET_DATA_TYPE_MESPACK: 0x5551aaa2,
  /** 字节位置偏移：12<br>
   * 网络包头No.4:DataType【4】类型：S到C扫描层列表
   **/
  NET_DATA_TYPE_ANGLE_LIST: 0x8c090000,
  /** 字节位置偏移：28(含包头20)<br>
   *数据包No.3:type：S到C扫描层列表
   **/
  TYPE_ANGLE_LIST: 0x8c090001,
  /** 字节位置偏移：28(含包头20)<br>
   *数据包No.3:type：S到C扫描层列表(多波束列表)
   **/
  TYPE_ANGLE_LIST_BEAM: 0x8c0900a0,
  /** 字节位置偏移：12<br>
   * 网络包头No.4:DataType【4】类型：菜单的网络包
   **/
  NET_DATA_SC_WEBMENU: 0x88080000,
  /** 字节位置偏移：28(含包头20)<br>
   *数据包No.3:type：菜单的网络包
   **/
  TYPE_WEBMENU: 0x88080001,
  /** 字节位置偏移：12<br>
   * 网络包头No.4:DataType【4】类型：服务端到客户端的状态包类型
   **/
  NET_TYPE_SC_STATE: 0x8c010000,
  /** 字节位置偏移：12<br>
   * 网络包头No.4:DataType【4】类型：服务端到客户端的用户登录的状态包类型
   **/
  NET_TYPE_SC_USERSTATE: 0x8c050000,
  /** 字节位置偏移：28(含包头20)<br>
   *数据包No.3:type：【4】用户的状态
   **/
  TYPE_USERSTATE: 0x8c050001,

  /** 字节位置偏移：12<br>
   * 网络包头No.4:DataType【4】类型：登录类型<br>
   **/
  NET_TYPE_CS_LOGIN: 0xc8030000,

  /** 字节位置偏移：12<br>
   * 网络包头No.4:DataType【4】类型：PT到UT,扫描参数同步类型<br>
   **/
  NET_DATA_TYPE_PTTOUT_PARSYS: 0x5551a200,

  /** 字节位置偏移：12<br>
   * 网络包头No.4:DataType【4】类型：PT到UT,产品请求反馈类型
   **/
  NET_DATA_TYPE_PTTOUT_PRO_REQUEST: 0x5551a400,
  /** 字节位置偏移：12<br>
   * 网络包头No.4:DataType【4】类型：PT到UT,产品生成
   **/
  NET_DATA_TYPE_PTTOUT_GEN_RESULT: 0x5551a600,
  /** 字节位置偏移：28(含包头20)<br>
   *数据包No.3:type：【4】PT向UT发送的消息
   **/
  TYPE_MSG: 9,

  /** 字节位置偏移：12<br>
   * 网络包头No.4:DataType【4】类型：PT到UT,产品生成提示信息
   **/
  NET_DATA_TYPE_PTTOUT_MSG: 0x5551a700,
  /** 字节位置偏移：12<br>
   * 网络包头No.4:DataType【4】类型：PT到UT,PT磁盘空间满信息
   **/
  NET_DATA_TYPE_PTTOUT_PT_DISKFULL: 0x5551a800,
  /** 字节位置偏移：12<br>
   * 网络包头No.4:DataType【4】类型：UT到PT,登录信息
   **/
  NET_DATA_TYPE_UTTOPT_LOGIN: 0x5551a900,
  /** 字节位置偏移：12<br>
   * 网络包头No.4:DataType【4】类型:T到PT,产品请求信息
   **/
  NET_DATA_TYPE_UTTOPT_PRO_REQUEST: 0x5551b100,

  /** 字节位置偏移：20(含包头20)<br>
   * 数据包No.1:startflag:【4】开始标志位
   **/
  START_FLAG: 0xB2,
  /** 字节位置偏移：28(含包头20)<br>
   *数据包No.3:type：【4】UT用户登录PT命令
   **/
  TYPE_LOGIN: 8,
  /** 字节位置偏移：28(含包头20)<br>
   *数据包No.3:type：【4】产品请求类型
   **/
  TYPE_PRO_REQUEST: 6,
  /** 字节位置偏移：28(含包头20)<br>
   *数据包No.3:type：【4】产品生成的结果
   **/
  TYPE_PRODUCT_GEN_RESULT: 3,
  /** 字节位置偏移：32(含包头20)<br>
   * 数据包No.4:subtype：【4】产品生成成功
   **/
  PRO_GEN_SUCESS: 1,
  /** 字节位置偏移：32(含包头20)<br>
   * 数据包No.4:subtype：【4】产品生成失败
   **/
  PRO_GEN_FAILED: 2,
  /** 字节位置偏移：32(含包头20)<br>
   * 数据包No.4:subtype：【4】PT磁盘满报警
   **/
  TYPE_PT_DISKFULL: 20,
  NET_DATA_TYPE_PTTOUT_PT_DISKFUL: 0x5551a800, // PT到UT,PT磁盘空间满信息
  /** 字节位置偏移：32(含包头20)<br>
   * 数据包No.4:subtype：【4】登陆
   **/
  LOGIN_IN: 1,
  /** 字节位置偏移：32(含包头20)<br>
   * 数据包No.5:subtype：【4】 用户注销
   **/
  LOGIN_OUT: 2,
  /** 字节位置偏移：104(含包头20)<br>
   * 数据包No.6:tagLogin中的LoginStatus：【4】登录成功
   **/
  LOGIN_IN_SUCESS: 1,
  /** 字节位置偏移：104(含包头20)<br>
   * 数据包No.6:tagLogin中的LoginStatus：【4】登录失败
   **/
  LOGIN_IN_FAILED: 2,
  /** 字节位置偏移：112(含包头20)<br>
   * 数据包No.6:tagLogin中的ErrorCode：【4】登录失败</br>
   ErrorCode :  1:用户密码错误 **/
  LOGIN_ERRORCODE_InfoErr: 1,
  /** 字节位置偏移：112(含包头20)<br>
   * 数据包No.6:tagLogin中的ErrorCode：【4】登录失败</br>
   ErrorCode :  2:用户被迫下线 **/
  LOGIN_ERRORCODE_Offline: 2, // 用户被迫下线
  /** 字节位置偏移：112(含包头20)<br>
   * 数据包No.6:tagLogin中的ErrorCode：【4】登录失败</br>
   ErrorCode :  3:用户被删除 **/
  LOGIN_ERRORCODE_UserDel: 3, // 用户被删除
  /** 字节位置偏移：112(含包头20)<br>
   * 数据包No.6:tagLogin中的ErrorCode：【4】登录失败</br>
   ErrorCode :  4:用户不存在 **/
  LOGIN_ERRORCODE_NoUser: 4, // 用户不存在
  /** 字节位置偏移：112(含包头20)<br>
   * 数据包No.6:tagLogin中的ErrorCode：【4】登录失败</br>
   ErrorCode :  5:达到最大人数 **/
  LOGIN_ERRORCODE_MaxLine: 5,	// 用户不存在
  LOGIN_ERRORCODE_UserExist: 6, // 用户已存在拒接登录
  /** 字节位置偏移：32(含包头20)<br>
   * 数据包No.4:subtype：【4】pt传递过来的初始化命令
   **/
  PRO_REQUEST_INIT: 1,
  /** 字节位置偏移：32(含包头20)<br>
   * 数据包No.4:subtype：【4】pt传递过来的申请产品成功的命令
   **/
  PRO_REQUEST_FINISH: 2,
  /** 数据部分头部长度：20<br>**/
  DATA_HeadLength: 20,
  /** 数据部分尾部长度：24<br>**/
  DATA_TailLength: 4,
  /**
   *socket 的连接间隔
   */
  CONNECTINTEVAL: 5000,
  /** 字节位置偏移：12<br>
   * 网络包头No.4:DataType【4】类型：WEB发送立即的二次产品申请
   **/
  NET_TYPE_CS_IMCUSTOMPRO: 0xc8080000,
  /** 字节位置偏移：28(含包头20)<br>
   *数据包No.3:type：【4】WEB发送立即的二次产品申请
   **/
  TYPE_IMMEDIATECUSTOMPRO: 0xc8080001,
  /** 字节位置偏移：28(含包头20)<br>
   *数据包No.3:type：【4】WEB发送立即的二次产品申请--流产品申请
   **/
  TYPE_IMMEDIATESTREAM: 0xc8080002,
  /**
   *体扫文件路径最大长度
   */
  MAXCUSTOMPROVOLPATH: 256,
  /**
   *文件名最大长度
   */
  MAX_FILE_LEN: 64,
  /**
   *UT到PT,PT到UT聊天信息内容的长度
   */
  MAX_CHATMESSAGE_LEN: 256,
  /**
   * UT到PT,PT到UT聊天信息内容的类型
   */
  NET_DATA_TYPE_CHATMESS: 0x88060000,
  /**
   * UT到PT,PT到UT聊天信息内容的子类型
   */
  TYPE_CHATMESS: 0x88060001,

  /**
   * @Date   : 2019/11/16
   * @Des    : TaskConst
   *
   **/
  NET_TYPE_SC_TASKST: 0x8c020000, // 服务端到客户端的任务状态信息包

  NET_DATA_TYPE_UTTOPT_CT_CONTROL: 0x5551b200, // UT到PT,CT控制

  // 雷达控制：任务列表
  TaskTypeConst_NULLTASK: 0, // 任务类型：空任务
  TaskTypeConst_INLINE: 1, // 任务类型：排队任务
  TaskTypeConst_TIMING: 2, // 任务类型：定时任务
  TaskTypeConst_RIGHTNOW: 3, // 任务类型：立即任务
  CT_CONTROL_DELETETASK: 0x5551b202, // 删除任务

  TYPE_SHUTDOWN: 0xA5965A69, // 关机固定编码

  TYPE_CONTROL: 1, // 雷达控制模式
  CON_MODE: 7, // 切换CT为遥控

  CT_CONTROL_TASKSCONTROL: 0x5551b205, // 雷达扫描控制任务能否运行
  RADAR_TASK_RUN: 1, // 运行
  RADAR_TASK_STOP: 0, // 停止

  // 雷达控制：添加任务
  NET_DATA_SS_PLANTASK: 0x880a0000, // WEB向CT发送的方案和任务的请求和CT的返回
  PLANTASK_PLAN: 0x880a0001, // 方案列表
  PLANTASK_PLANTASK: 0x880a0002, // 方案下的任务列表
  PLANTASK_PLANTASKPARAM: 0x880a0003, // 方案下的任务的参数
  PLANTASK_PLAN_DROP: 0x880a0004, // 方案列表（下拉）
  PLANTASK_PLANTASK_DROP: 0x880a0005, // 方案下的任务列表（下拉）
  PLANTASK_PLANTASKPARAM_DROP: 0x880a0006, // 方案下的任务的参数（下拉）
  PLANTASK_RUN: 0x880a0015, // 执行方案
  PLANTASK_SELECT: 0x880a0014, // 方案列表查询
  PLANTASK_INSERT: 0x880a0011, // 方案增加
  PLANTASK_DELETE: 0x880a0012, // 方案删除
  PLANTASK_UPDATE: 0x880a0013, // 方案修改
  PLANTASKNAMELEN: 32, // 任务名称最大长度
  MAX_SCAN_LAYER: 30, // 最大扫描参数的个数
  PLANTASK_PPIRHI: 0x880a0017, // PPI和RHI的扫描切换
  NET_DATA_WR_X100_RADARCMD: 0x8C8C000F, // WR_X100  23所项目 雷达控制命令

  // : : :  暂未使用
  CT_CONTROL_ADDTASKS: 0x5551b201, // 添加任务
  NET_DATA_TYPE_UTTOPT_DEFAULTPAR_REQUEST: 0x5551a901, // //UT到PT,默认参数（用户列表、默认请求产品等）请求
  TYPE_LOGIN_DEFAULTPAR: 801, // UT用户登录PT后默认参数
  TYPE_OPENCLOSERADARST_DEFAULTPAR_FL: 802, // WEB通过UT获取NET_DATA_TYPE_CTTOUT_OPENCLOSERADARST
  NET_DATA_TYPE_SENDSTREAM: 0x8d100000, // 流传输数据数据网络包类型

  /** 字节位置偏移：12<br>
   * 网络包头No.4:DataType【4】类型:启动和关闭雷达控制状态和命令（UT到CT）
   **/
  NET_DATA_TYPE_CTTOUT_OPENCLOSERADARST: 0x5551b800,
  /** 字节位置偏移：28(含包头20)<br>
   *数据包No.3:type：【4】启动雷达
   **/
  OPENCLOSERADARST_OPEN: 0x5551b801,
  /** 字节位置偏移：28(含包头20)<br>
   *数据包No.3:type：【4】关闭雷达
   **/
  OPENCLOSERADARST_CLOSE: 0x5551b802,
  /** 字节位置偏移：28(含包头20)<br>
   *数据包No.3:type：【4】
   **/
  OPENCLOSERADARST_REST: 0x5551b803,
  /** 正在加电 **/
  OPENPRO_POWER_ON_POWERING: 0, // 正在加电
  /** 加电失败，重新加电 **/
  OPENPRO_POWER_ON_POWERING_RE: 1, // 加电失败，重新加电
  /** 加电成功 **/
  OPENPRO_POWER_ON_SUCESS: 2, // 加电成功
  /** 加电失败 **/
  OPENPRO_POWER_ON_FAIL: 3, // 加电失败
  /** 加电成功，正在预热 **/
  OPENPRO_POWER_ON_SUCESS_HEADING: 4, // 加电成功，正在预热
  /** 正在standby **/
  CLOSEPRO_CLOSE_STATUS_STANDBYING: 0, // 正在standby
  /** 等待关闭低压 **/
  CLOSEPRO_CLOSE_ST_WAIT_CLOS_LOW_VOL: 1, // 等待关闭低压
  /** 正在关闭低压 **/
  CLOSEPRO_CLOSE_ST_CLOSING_LOW_VOL: 2, // 正在关闭低压
  /** 正在断电 **/
  CLOSEPRO_CLOSE_ST_CLOSING_POWERING: 3, // 正在断电

  /** 雷达关机状态 **/
  OPERNORCLOSE_STATUS: 0, // 雷达关机状态
  /** 雷达开机状态 **/
  OPERNOROPEN_STATUS: 1, // 雷达开机状态

  NET_DATA_SC_AUTOREGULARTIME: 0x8C8C8E00,

  TYPE_AUTOREGULARTIME_GET: 0x8C8C8E01, // WEB获取定时时间
  /** 雷达开机状态 **/
  TYPE_AUTOREGULARTIME_SET: 0x8C8C8E02, // WEB设置定时时间
  /** 远程控制关闭电脑类型  终端遥控关机**/
  TYPE_SHUTDOWNCONTROL: 0x8C8C8F00
}
export default {
  ...socketConst
}
