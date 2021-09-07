/** 文件头部分的解析顺序严格按照C++代码而来</br>
 * 天气雷达数据文件头 解析雷达地址参数段【160】
 * create by WX
 */
import buffer from '@/3d/lib/Common/buffer';
export default class PhraseRealAddrSec {
  /** 获取文件头长度【1266】</b>
   * 字节位置偏移：0;</br> 地址参数段;</br> No.1：文件头长度            【2】; </b>
   */
  fileHeadLen ;
  /** 字节位置偏移：2;</b>地址参数段;</b>No.2：雷达型号 【20】; </br>
   *union{
   char RadarType[20];    //!< 雷达型号  【20】
   char Nation[20];    //!< 国名  【20】
   };
   **/
  RadarType ;
  /** 字节位置偏移：22;</b>地址参数段;</b>No.3：省名 【20】; </br> */
  Province ;
  /** 字节位置偏移：42;</b>地址参数段;</b>No.4：站点名称，区名 【20】; </br> */
  Station ;
  /** 字节位置偏移：62;</b>地址参数段;</b>No.5：站点编号，区站名【20】; </b>
   * union{
   char StationNo[20]; //!< 站点编号  【20】 历史版本：区站名
   char SectionSta[20]; //!< 区站名  【20】
   };
   **/
  SectionSta ;
  /** 字节位置偏移：82;</b>地址参数段;</b>No.6：文件格式版本号[4 - 7]存放数据来源【20】; </b>
   * union{
   unsigned char FileVer;//文件版本，见顶端联合体定义
   char Type[20];	 //!< 文件格式版本号 [4 - 7]存放数据来源 【20】
   };
   *  */
  Type = null;
  /** 字节位置偏移：102;</br> 地址参数段;</br> No.7：union_1_1(C++),雷达扫描名称 【20】    历史版本：Longitude[20] 格式E15度32'12"; </br>
   * 	union{
   struct{
   char ScanModeName[20];  //!<  雷达扫描名称 【20】    FILE_VER_XFL使用
   char Reserve2[20];   //!< 保留 【20】    历史版本：Latitude[20] 格式N35度30'15"
   };
   struct{
   char Longitude[20];  //!< 格式E15度32'12"  【20】
   char Latitude[20];   //!< 格式N35度30'15"  【20】
   };
   };
   * */
  ScanModeName
  /** 字节位置偏移：122;</b>地址参数段;</b>No.8：union_1_2(C++);保留 【20】    历史版本：Latitude[20] 格式N35度30'15";</br>
   * 	union{
   struct{
   char ScanModeName[20];  //!<  雷达扫描名称 【20】    FILE_VER_XFL使用
   char Reserve2[20];   //!< 保留 【20】    历史版本：Latitude[20] 格式N35度30'15"
   };
   struct{
   char Longitude[20];  //!< 格式E15度32'12"  【20】
   char Latitude[20];   //!< 格式N35度30'15"  【20】
   };
   };
   * */
  Reserve2 = null;
  /** 字节位置偏移：102;</br> 地址参数段;</br> No.7：union_2_1(C++);格式E15度'12" 【20】; </br>
   * * 	union{
   struct{
   char ScanModeName[20];  //!<  雷达扫描名称 【20】    FILE_VER_XFL使用
   char Reserve2[20];   //!< 保留 【20】    历史版本：Latitude[20] 格式N35度30'15"
   };
   struct{
   char Longitude[20];  //!< 格式E15度32'12"  【20】
   char Latitude[20];   //!< 格式N35度30'15"  【20】
   };
   };
   * */
  Longitude = null;
  /** 字节位置偏移：122;</b>地址参数段;</b>No.8：union_2_2(C++);格式N35度'15" 【20】; </br>
   * * 	union{
   struct{
   char ScanModeName[20];  //!<  雷达扫描名称 【20】    FILE_VER_XFL使用
   char Reserve2[20];   //!< 保留 【20】    历史版本：Latitude[20] 格式N35度30'15"
   };
   struct{
   char Longitude[20];  //!< 格式E15度32'12"  【20】
   char Latitude[20];   //!< 格式N35度30'15"  【20】
   };
   };
   * */
  Latitude = null;
  /** 字节位置偏移：142;</b>地址参数段;</b>No.9：天线所在径度的数值表示，单位取1／100度(东经为整，西径为负)【4】; </br> */
  LongitudeV ;
  /** 字节位置偏移：146;</b>地址参数段;</b>No.10：天线所在纬度的数值表示，单位取1／100度(北纬为正，南纬为负)【4】; </br> */
  LatitudeV ;
  /** 字节位置偏移：150;</b>地址参数段;</b>No.11：天线所在的海拔高度，以mm为单位  【4】; </br> */
  Height ;
  /** 字节位置偏移：154;</b>地址参数段;</b>No.12：测站四周地物最大仰角，百分之一度为单位 【2】; </br> */
  Elevation ;
  /** 字节位置偏移：156;</b>地址参数段;</b>No.13：测站的最佳观测仰角，百分之一度为单位 【2】; </br> */
  Elevation1 ;
  /** 字节位置偏移：158;</b>地址参数段;</b>No.14：站点编号 【2】; </br> */
  Category ;
  /**  雷达地址参数段长度 */
  realAddrSecLen = 160
  /** 文件头部分的解析顺序严格按照C++代码而来</br> data:ByteArray */
  constructor (data) {
    if (data == null || data.byteLength === 0) return
    if (data.byteLength >= this.realAddrSecLen) {
      let temp = buffer.getArrFromBuffer(data, 0, 'Uint16', 1)
      this.fileHeadLen = temp[0] // 1266
      this.RadarType = this.textDecoder(buffer.getArrFromBuffer(data, 2, 'Int8', 20))
      this.Province = this.textDecoder(buffer.getArrFromBuffer(data, 22, 'Int8', 20))
      this.Station = this.textDecoder(buffer.getArrFromBuffer(data, 42, 'Int8', 20))
      this.SectionSta = this.textDecoder(buffer.getArrFromBuffer(data, 62, 'Int8', 20))
      this.Type = buffer.getArrFromBuffer(data, 82, 'Int8', 20)
      switch (this.Type[0]) {
        case 1:
          this.ScanModeName = this.textDecoder(buffer.getArrFromBuffer(data, 102, 'Int8', 20))
          break
        default:
          this.ScanModeName = '--' // "未知";
          break
      }
      this.Reserve2 = buffer.getArrFromBuffer(data, 122, 'Int8', 20)
      temp = buffer.getArrFromBuffer(data, 142, 'Int32', 3)
      this.LongitudeV = temp[0]
      this.LatitudeV = temp[1]
      this.Height = temp[2]
      temp = buffer.getArrFromBuffer(data, 154, 'Int16', 3)
      this.Elevation = temp[0]
      this.Elevation1 = temp[1]
      this.Category = temp[2]
    }
  }
  /** 字符串编码 * */
  textEncoder (str) {
    let arr = []
    if (str) {
      arr = new window.TextEncoder('gb2312', {NONSTANDARD_allowLegacyEncoding: true}).encode(str)
    }
    return arr
  }
  /** 字符串解码
   * 产品文件里的编码均采用gb2312规则 */
  textDecoder (arr) {
    let str = ''
    if (arr) {
      let index = arr.findIndex(item => {
        return item === 0
      })
      if (index !== -1)arr = arr.slice(0, index)
      str = new window.TextDecoder('gb2312').decode(arr)
    }
    return str
  }
}
