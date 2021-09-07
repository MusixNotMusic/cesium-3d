/**
 * 定义产品类型
 */
const ProductType = {
  /**
   * 方位扫描</br>PPI原始数据:0</br>极坐标系
   */
  PPI_TYPE: 0,
  /**
   * 俯仰扫描</br>距离高度显示:1</br>直角坐标系
   */
  RHI_TYPE: 1,
  /**
   * 体积扫描</br>体扫数据:2</br>极坐标系
   */
  VOL_TYPE: 2,

  /**
   * 基本反射率:3</br>极坐标系
   */
  R_TYPE: 3,
  /**
   * 基本速度:4</br>极坐标系
   */
  V_TYPE: 4,
  /**
   * 基本谱宽:5</br>极坐标系
   */
  W_TYPE: 5,
  /**
   * 回波顶高:6</br>极坐标系
   */
  ET_TYPE: 6,
  /**
   * 回波底高:7</br>极坐标系
   */
  EB_TYPE: 7,
  /**
   * 等高平面位置显示:8</br>极坐标系
   */
  CAPPI_TYPE: 8,
  /**
   * 反射率垂直切割:9</br>直角坐标系
   */
  RCS_TYPE: 9,
  /**
   * 最大回波强度:10</br>极坐标系
   */
  MAXREF_TYPE: 10,
  /**
   * MAX:11</br>极坐标系
   */
  MAX_TYPE: 11,
  /**
   * 用户可选降水USP:12</br>极坐标系
   */
  USP_TYPE: 12,
  /**
   * CATCH:13</br>极坐标系 区域降水总量
   */
  CATCH_TYPE: 13,
  /**
   * 中尺度气旋识别:14</br>极坐标系
   */
  M_TYPE: 14,
  /**
   * 龙卷涡旋识别：15</br>极坐标系
   */
  TVS_TYPE: 15,
  /**
   * 风场反演：16</br>极坐标系
   */
  IVAP_TYPE: 16,
  /**
   * 多层发射率CAPPI:17</br>极坐标系
   */
  MZCAPPI_TYPE: 17,
  // 粒子水平切割
  CAPPIHCL_TYPE: 18,
  /**
   * 阵风识别：19</br>极坐标系
   */
  GFD_TYPE: 19,
  /**
   * 回波顶高等值线:21</br>极坐标系
   */
  ETC_TYPE: 21,
  /**
   * 回波底高等直线:22</br>极坐标系
   */
  EBC_TYPE: 22,
  /**
   * 垂直最大回波等值线:23</br>极坐标系
   */
  CRC_TYPE: 23,
  /**
   * 速度方位显示:24</br>极坐标系
   */
  VAD_TYPE: 24,
  /**
   * 垂直累积液态水含量:25</br>直角坐标系
   */
  VIL_TYPE: 25,
  /**
   * 分层组合反射率平均值:26</br>直角坐标系
   */
  LRA_TYPE: 26,
  /**
   * 分层组合反射率最大值:27</br>直角坐标系
   */
  LRM_TYPE: 27,
  /**
   * 速度垂直切割:28</br>直角坐标系
   */
  VCS_TYPE: 28,
  /**
   * 谱宽率垂直切割:29</br>直角坐标系
   */
  SCS_TYPE: 29,
  /**
   * THI:30</br>直角坐标系
   */
  THI_TYPE: 30,
  /**
   * RPI:31</br>直角坐标系
   */
  RPI_TYPE: 31,
  /**
   * 垂直风廓线:32</br>直角坐标系
   */
  VWP_TYPE: 32,
  /**
   * 分层组合湍流平均值:33</br>直角坐标系
   */
  LTA_TYPE: 33,
  /**
   * 分层组合湍流最大值:34</br>直角坐标系
   */
  LTM_TYPE: 34,
  /**
   * 强天气概率:35</br>直角坐标系
   */
  SWP_TYPE: 35,
  /**
   * 1小时降雨量:36</br>直角坐标系
   */
  OHP_TYPE: 36,
  /**
   * 3小时降雨量:37</br>直角坐标系
   */
  THP_TYPE: 37,
  /**
   * 风暴总降水量:38</br>直角坐标系
   */
  STP_TYPE: 38,
  /**
   * 雨强:39</br>直角坐标系
   */
  RZ_TYPE: 39,
  /**
   * 冰雹趋势预测:40</br>直角坐标系
   */
  HPF_TYPE: 40,
  /**
   * 组合切变:42</br>极坐标系
   */
  CS_TYPE: 42,
  /**
   * 方位涡度:43</br>极坐标系
   */
  ARD_TYPE: 43,
  /**
   * 速度径向散度:44</br>极坐标系
   */
  RVD_TYPE: 44,
  /**
   * 风暴结构:48</br>极坐标系
   */
  SS_TYPE: 48,
  /**
   * 风暴追踪信息:49
   */
  STI_TYPE: 49,
  /**
   * 暴雨回波识别:50</br>极坐标系
   */
  SEI_TYPE: 50,
  /**
   * 下击暴流识别:51</br>极坐标系
   */
  DDPD_TYPE: 51,
  /**
   * 未滤波反射率:52</br>直角坐标系
   */
  UnZ_TYPE: 52,
  /**
   * N小时降雨量:54</br>极坐标系
   */
  NHP_TYPE: 54,
  /**
   * 冰雹指数:55</br>极坐标系
   */
  HI_TYPE: 55,
  /**
   * 差分反射率因子:56</br>极坐标系
   */
  ZDR_TYPE: 56,
  /**
   * 差分相位:57</br>极坐标系
   */
  PDP_TYPE: 57,
  /**
   * :58</br>极坐标系
   */
  KDP_TYPE: 58,
  /**
   * 零延迟相关系数:59</br>极坐标系
   */
  RHV_TYPE: 59,
  /**
   * 速度多层CAPPI:62</br>极坐标系
   */
  MVCAPPI_TYPE: 62,
  /**
   * 谱宽多层CAPPI:63</br>极坐标系
   */
  MWCAPPI_TYPE: 63,
  /**
   * 粒子多层CAPPI:64</br>极坐标系
   */
  MHCLCAPPI_TYPE: 64,
  /**
   * 粒子:65</br>极坐标系
   */
  HCL_TYPE: 65,
  /**
   * 粒子垂直切割:66</br>直角坐标系
   */
  HCLCS_TYPE: 66,
  /**
   * 组合切变等值线
   */
  CSC_TYPE: 69,
  /**
   * 组合切变等值线
   */
  VSP_TYPE: 70,
  /**
   * 线性退极化比:71</br>直角坐标系
   */
  LDR_TYPE: 71,
  /**
   * 最强回波高度:72</br>直角坐标系
   */
  MRH_TYPE: 72,
  /**
   * 强天气分析(反射率):75</br>直角坐标系
   */
  SWR_TYPE: 75,
  /**
   * 强天气分析(速度):76</br>直角坐标系
   */
  SWV_TYPE: 76,
  /**
   * 强天气分析(谱宽):77</br>直角坐标系
   */
  SWW_TYPE: 77,
  /**
   * 强天气分析(切变):78</br>直角坐标系
   */
  SWS_TYPE: 78,
  /**
   * 风暴相对平均径向速度  极坐标
   */
  SRM_TYPE: 79,
  /**
   * 风切变:80</br>
   */
  WS_TYPE: 80,
  /**
   * 弱回波区:81
   */
  WER_TYPE: 81,
  /**
   * 地表降水量强度:82</br>直角坐标系
   */
  SRI_TYPE: 82,

  // 速度水平切割
  CAPPIVEL_TYPE: 83,

  // 谱宽水平切割
  CAPPIWID_TYPE: 84,

  // 差分反射率水平切割
  CAPPIZDR_TYPE: 85,

  // 差分相移因子水平切割
  CAPPIKDP_TYPE: 86,

  // 零延迟相关系数水平切割
  CAPPIRHV_TYPE: 87,

  // 差分相位水平切割
  CAPPIPDP_TYPE: 88,

  // 差分反射率垂直切割
  HCSZDR_TYPE: 89,

  // 差分相移因子垂直切割
  HCSKDP_TYPE: 90,

  // 零延迟相关系数垂直切割
  HCSRHV_TYPE: 91,

  // 差分相位垂直切割
  HCSPDP_TYPE: 92,

  // 差分反射率多层CAPPI
  MCAPPIZDR_TYPE: 93,

  // 差分相移因子多层CAPPI
  MCAPPIKDP_TYPE: 94,

  // 零延迟相关系多层CAPPI
  MCAPPIRHV_TYPE: 95,

  // 差分相位多层CAPPI
  MCAPPIPDP_TYPE: 96,
  /**
   * 人工增雨
   */
  PE_TYPE: 132,
  /**
   * 人工防雹
   */
  HS_TYPE: 133,
  /**
   * 大风识别
   */
  VW_TYPE: 134,
  /**
   * 暴雨识别
   */
  RS_TYPE: 135,
  /**
   * 融化层识别
   */
  ML_TYPE: 136,
  /**
   * 雾能见度
   */
  FOG_TYPE: 137,

  /**
   * 体积扫描</br>体扫原始数据:2</br>极坐标系
   */
  VOLSRC_TYPE: 200,

  /** 反射率 */
  KZ_TYPE: 1001,
  /** 速度 */
  KV_TYPE: 1002,
  /** 谱宽 */
  KW_TYPE: 1003,
  /** 信噪比 */
  KSNR_TYPE: 1004,
  /** 线性退极化比 */
  KLDR_TYPE: 1005,
  /** 差分反射率因子 */
  KZDR_TYPE: 1006,
  /** 差分相位 */
  KPDP_TYPE: 1007,
  /** 差分相移因子 */
  KKDP_TYPE: 1008,
  /** 零延迟相关系数 */
  KRHV_TYPE: 1009,
  /** 基本粒子、双偏振相态分类 */
  KHCL_TYPE: 1010,
/** 功率谱 */
  KFFT_TYPE: 1011,
  /** 云量 */
  KCNum_TYPE: 1012,
  /** 云顶高底高 */
  KCHei_TYPE: 1013,
  /** 反射率衰减订正 */
  KZc_TYPE: 1014,
  /** 垂直液态含水量 */
  KVIL_TYPE: 1015,
  /** 零度层亮带 */
  KBB_TYPE: 1016,
  /** 大气折射率常数 */
  KCN2_TYPE: 1017,
  /** 云粒子相态识别 */
  KCHCL_TYPE: 1018,
  /** 最小威力图 */
  KWL_TYPE: 1019,
  /** 有效粒子半径 */
  KRe_TYPE: 1020,
  /** 云粒子谱分布 */
  KYLZ_TYPE: 1021,
  /** 云中上升气流速度 */
  KVAV_TYPE: 1022,
  /** 云分类 */
  KCCL_TYPE: 1023,
  /** 云冰含量 */
  KIWC_TYPE: 1024
}
export default ProductType
