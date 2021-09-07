  /** 文件头部分的解析顺序严格按照C++代码而来</br>
   * 天气雷达数据文件头 雷达性能参数段【40】
   * create by WX
   */
import buffer from '@/3d/lib/Common/buffer';
export default class PhraseRealCapabilitySec {
  /**
   * 获取垂直波束宽度，
   *字节位置偏移：162;</b> 实时数据，雷达性能参数段;</b> No.2：垂直波束宽度 ，单位取1/100度    【2】 */
  iVBeamwidth;
  /**
   * 获取水平波束宽度，
   *字节位置偏移：164;</b> 实时数据，雷达性能参数段;</b> No.3：水平波束宽度，单位取1/100度    【2】 */
  iHBeamwidth;
  /**  雷达性能参数段长度 */
  realCapabilitySecLen = 40
  constructor (data) {
    if (data == null || data.byteLength === 0) return
    if (data.byteLength >= 160 + this.realCapabilitySecLen) {
      let temp = buffer.getArrFromBuffer(data, 160 + 2, 'Uint16', 2)
      this.iVBeamwidth = temp[0]/100
      this.iHBeamwidth = temp[1]/100
    }
	}
}
