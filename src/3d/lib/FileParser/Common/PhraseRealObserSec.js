/** 文件头部分的解析顺序严格按照C++代码而来</br>
  * 实时数据观察参数段【1066】</br>
  * create by WX
*/
import buffer from '@/3d/lib/Common/buffer';

export default class PhraseRealObserSec {
  /** 获取产品编号</br>
   * 字节位置偏移：200;</b>  No.1：产品编号【2】;</br>
   * 0:PPI1; 1:RHI; 2:立体扫描; 3.反射率; 4.速度; 5.谱宽
   */
  iProductNumber;
  /** 字节位置偏移：202;</br>  No.2：体扫扫描扫描层数【2】 */
  iScanCutNum;
  /** 字节位置偏移：204
   * 实时数据观察参数段：
   * 观测开始时间【12】 =  No.3：年（位数如）【2】 +No.4：月  【2】 + No.5：日  【2】 + No.6：时【2】 + No.7：分【2】 +No.8：秒【2】
   */
  iObsStartDate = null;
  /** 字节位置偏移：216；</br>
   * No.9：开始GPS时间  【4】
   */
  iGPSStartTime;
  /** 字节位置偏移：220;</br>
   * No.10：定标情况  【2】 ;</br>
   * 0:没有定标;1:自动定标;2:一周内人工定标;3:一月内人工定标
   */
  iCalibrate;
  /** 字节位置偏移：222;</br>
   * No.11：强度积分次数 【2】
   */
  iIntensityIntNum;
  /** 字节位置偏移：224;</br>
   * No.12：速度处理样本数 【2】
   */
  iVSample;
  /** 字节位置偏移：226;</br>
   * No.13-1：C++中的联合体（成员一：ID 号，仅对体扫产品有用 【120】 = 30×4（uint） ）
   */
  unionId = null;
  /** 字节位置偏移：226;</br>
   * No.13-2：C++中的联合体（成员二：产品的参数  【120】 = 30×4（uint） ）
   */
  unionParame = null;
  /** 字节位置偏移：346;</br>
   * No.14：观测要素  【30】  = 30×1（C++中的char类型）
   * 1:单强度； 2:单速度（单PRF）； 3:速度+谱宽（单PRF）； 4:单速度（双PRF）； 5:速度+谱宽（双PRF）；
   6:强度+速度（单PRF； 7:强度+速度（双PRF）； 8:三要素（单PRF）； 9:三要素（双PRF）；
   10：四要素（ConR+R +V+W，单PRF）；11：四要素（ConR+R+V+W，双PRF）
   */
  _cObsEssential = null;
  /** 字节位置偏移：376;</br>
   * No.15：速度退模糊  【30】
   * 0：无退模糊处理； 1：软件退模糊； 2：双PRF退模糊； 3：批式退模糊； 4：批式加软件退模糊；
   5：双PRF退模糊； 6：双PRF+软件退模糊
   */
  _cSuDuTuiMoFu = null;
  /** 字节位置偏移：406;</br>
   * No.16：各层第一种脉冲重复频率*，计数单位/10HZ  【60】  = 30×2；
   */
  _iFirstKindPRF = null;
  /** 字节位置偏移：466;</br>
   * No.17： 各层第二种脉冲重复频率*，计数单位1/10HZ 【60】  = 30×2；
   */
  _iSecondKindPRF = null;
  /** 字节位置偏移：526;</br>
   * No.18：各层脉冲宽度(1/100微秒)            【60】  = 30×2；
   */
  _iPulseWidth = null;
  /** 字节位置偏移：586;</br>
   * No.19：各层的最大可测速度；单位：厘米/秒                      【60】  = 30×2；
   */
  _iMaxObsVel = null;
  /**
   * 获取各层的反射率距离库数</br>
   * 字节位置偏移：646;</br>
   * No.20：各层的反射率距离库数，usRefBinNumber    【60】  = 30×2；
   */
  usRefBinNumber = null;
  /**
   * 获取各层采样的径向数</b>
   * 字节位置偏移：706;</b>
   * No.21：各层采样的径向数   各层径向数相同   【60】  = 30×2;
   */
  iRadialNum = null;
  /** 字节位置偏移：766;</br>
   * No.22：各层多普勒库长***，以米为单位   **  【60】  = 30×2；
   */
  iDopBinLen = null;
  /**
   * 获取库长 :</b>
   * 字节位置偏移：826;</b>
   * 实时数据观察参数段;</b>
   * No.23：各层反射率库长***，以米为单位   **  【60】  = 30×2；
   */
  iRefBinLen = null;
  /** 字节位置偏移：886;</br>
   * No.24：各层径向上的第一个库（或数据）的开始距离（以米为单位）  **  【60】  = 30×2；
   */
  _iFirstBinDis = null;
  /**
   * 各层PPI 在文件中开始的位置(字节，含文件头);</b>
   *字节位置偏移：946;</b>
   * 实时数据观察参数段;</b>
   * No.25：各层PPI 在文件中开始的位置(字节，含文件头)      **  【120】 =  30×4（uint）；
   */
  iPPIStartPos = null;
  /** 返回值单位:度
   * 获取各层采样的径向数:_iElevation[0],各层径向数相同 ; </b>
   * 字节位置偏移：1066;</b>
   * 实时数据观察参数段;</b>
   * No.26：各层的仰角，数据文件中的数值的单位是：100度  【60】 = 30×2；;</b>
   * 做PPI时: 仅在第一层填写仰角数; 做RHI时: 第一层填写方位数, 第二层填写RHI的最低仰角, 第三层填写RHI的最高仰角
   */
  iElevation = null;
  /** 字节位置偏移：1126;</br>
   * No.27：一个径向中的数据排列方式 【1】
   * 11按库排列：库中先速度后强度（两要素）; 12按库排列：库中先强度后速度（两要素）; 13按库排列：库中先速度后谱宽（两要素）
   14按库排列：库中先速度后强度再谱宽; 15按库排列：库中先强度后速度再谱宽; 21按要素排列：单强度,地物滤波( ConR )
   22按要素排列：单速度( V ); 23按要素排列：先强度后速度( ConR + V ); 24按要素排列：先速度后强度( V + ConR )
   25按要素排列：先速度后谱宽( V + W ); 26按要素排列：先速度后强度再谱宽( V + ConR + W )
   27按要素排列：先强度后速度再谱宽( ConR + V + W ); 31 346-S, 按要素排列:  ConR
   32 346-S, 按要素排列:  R; 33 346-S, 按要素排列:  ConR + R; 34 346-S, 按要素排列:  ConR + V + W
   35 346-S, 按要素排列:  R + V + W; 36 346-S, 按要素排列:  ConR + R + V + W */
  _cDataArrayMode;
  /** 字节位置偏移：1127;</br>
   * No.28：一个强度数据占用的字节数，百位数表示 【1】
   * Oxx：表示无符号位； 1xx：表示有符号位
   */
  _cRByteCount;
  /** 字节位置偏移：1128;</br>
   * No.29：一个速度数据占用的字节数，百位数表示是否有符号位  【1】
   * Oxx：表示无符号位； 1xx：表示有符号位
   */
  _cVByteCount;
  /** 字节位置偏移：1129;</br>
   * No.30：一个谱宽数据占用的字节数，百位数表示是否有符号位  【1】
   * 0:表示不无符号位； 1:表示有符号位。
   */
  _cWByteCount;
  /** 字节位置偏移：1130;</br>
   * No.31：强度：无回波的代表码  【2】
   */
  _iRNoEchoCode;
  /** 字节位置偏移：1132;</br>
   * No.32：速度：无回波的代表码  【2】
   */
  _iVNoEchoCode;
  /** 字节位置偏移：1134;</br>
   * No.33：谱宽：无回波的代表码  【2】
   */
  _iWNoEchoCode;
  /** 字节位置偏移：1136;</br>
   * No.34： 数据中的强度最小增量01000  【2】
   */
  _iRMinIncrement;
  /** 字节位置偏移：1138;</br>
   * No.35：数据中的速度最小增量*1000  【2】
   */
  _iVMinIncrement;
  /** 字节位置偏移：1140;</br>
   * No.36：数据中的谱宽最小增量*1000  【2】
   */
  _iWMinIncrement;
  /** 字节位置偏移：1142;</br>
   * No.37：强度：如果用无符号类型数表示，填写代表零的数值 【2】
   */
  _iRef0;
  /** 字节位置偏移：1144;</br>
   * No.38： 速度：如果用无符号类型数表示，填写代表零的数值 【2】
   */
  _iVel0;
  /** 字节位置偏移：1146;</br>
   * No.39：谱宽：如果用无符号类型数表示，填写代表零的数值 【2】
   */
  _iWid0;
  /**
   * 获取观测结束时间;</b>
   *字节位置偏移：1148;</b>
   * 实时数据观察参数段;</b>
   * 观测结束时间【12】= No.40：年（4位数）【2】 +No.41：月  【2】 + No.42：日  【2】 + No.43：时【2】 + No.44：分【2】 +No.45：秒【2】
   */
  iObsEndDate = null;
  /** 字节位置偏移：1160;</br>
   * No.46： GPS时间(无GPS填零)  【4】
   */
  _iGPSEndDate;
  /** 字节位置偏移：1164;</br>
   * No.47： 应写注结构(1)数组的大小。 【2】
   */
  _iStructSize;
  /** 获取扫描模式 ：（将文件中读出的uint转换成对应的 文字描述 ）
   * 字节位置偏移：1166;</br>
   * No.48：联合体（成员2-1：雷达扫描模式:  【2】）
   * 在风灵系统下：[0,255]降雨模式 [256,511] 晴空模式； 在大船项目下：具体参见文档
   */
  scanmode;
  /** 字节位置偏移：1168;</br>
   * No.48：联合体（成员2-2：spare[2 - 31], 存储体扫各层的扫描方式 【30】 = 30×1）
   * 0 lcs 模式（R）； 1 lcd 模式（V、W）； 2 hcd( RVW )； 3  ； 4 batch 模式( RVW )
   */
  wavForm = null;
  /** 字节位置偏移：1198
   * No.48：联合体（成员2-3：各层的多普勒距离库数，usDopBinNumber  【60】 = 30×2）
   */
  usDopBinNumber = null;
  /** 获取0度层高度 ：（将文件中读出的uint转换成对应的 文字描述 ）
   * 字节位置偏移：1264;</br>
   * No.48：联合体
   * _BATCH_SCAN batch;  // 【92】
    char cTmp[6];
    unsigned char ZeroHeight;// 0度层高度,0.1km加权，有效范围0~200
    unsigned char Fu20Height;// -20度层高度,0.1km加权，有效范围0~200
   */
  ZeroHeight;
  /** 获取-20度层高度 ：（将文件中读出的uint转换成对应的 文字描述 ）
   * 字节位置偏移：1265;</br>
   * No.48：联合体
   * _BATCH_SCAN batch;  // 【92】
     char cTmp[6];
     unsigned char ZeroHeight;// 0度层高度,0.1km加权，有效范围0~200
     unsigned char Fu20Height;// -20度层高度,0.1km加权，有效范围0~200
   */
  Fu20Height;
  /** 实时数据观察参数段长度 */
  realObserSecLen = 1066
  constructor (data) {
    if (data == null || data.byteLength === 0) return
    let pos = 160 + 40
    if (data.byteLength >= pos + this.realObserSecLen) {
      let temp = buffer.getArrFromBuffer(data, pos, 'Uint16', 8)
      this.iProductNumber = temp[0]
      this.iScanCutNum = temp[1]
      this.iObsStartDate = new Date()
      this.iObsStartDate.setFullYear(temp[2], temp[3] - 1, temp[4])
      this.iObsStartDate.setHours(temp[5], temp[6], temp[7], 0)
      if (this.iScanCutNum <= 30) {
        this.usRefBinNumber = buffer.getArrFromBuffer(data, pos + 446, 'Uint16', this.iScanCutNum)
        this.iRadialNum = buffer.getArrFromBuffer(data, pos + 506, 'Uint16', this.iScanCutNum)
        this.iDopBinLen = buffer.getArrFromBuffer(data, pos + 566, 'Uint16', this.iScanCutNum)
        this.iRefBinLen = buffer.getArrFromBuffer(data, pos + 626, 'Uint16', this.iScanCutNum)
        this.iPPIStartPos = buffer.getArrFromBuffer(data, pos + 746, 'Uint32', this.iScanCutNum)
        temp = buffer.getArrFromBuffer(data, pos + 866, 'Int16', this.iScanCutNum) //支持俯仰角，数据格式由Uint16 改为int16
        let i = 0
        this.iElevation = []
        for (i = 0; i < this.iScanCutNum; i++) {
          this.iElevation[i] = Number((temp[i] / 100).toFixed(2))
        }

        temp = buffer.getArrFromBuffer(data, pos + 948, 'Uint16', 6)
        this.iObsEndDate = new Date()
        this.iObsEndDate.setFullYear(temp[0], temp[1] - 1, temp[2])
        this.iObsEndDate.setHours(temp[3], temp[4], temp[5], 0)
      }
      temp = buffer.getArrFromBuffer(data, pos + 966, 'Uint16', 1)
      this.scanmode = temp[0] / 256
      this.wavForm = buffer.getArrFromBuffer(data, pos + 968, 'Int8', 30)
      this.usDopBinNumber = buffer.getArrFromBuffer(data, pos + 998, 'Uint16', this.iScanCutNum)
      temp = buffer.getArrFromBuffer(data, pos + 1064, 'Uint8', 2)
      this.ZeroHeight = temp[0]
      this.Fu20Height = temp[1]
    }
  }
}
