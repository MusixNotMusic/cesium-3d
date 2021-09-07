/**
 * 天气雷达数据文件头解析，文件头部分的解析顺序严格按照C++代码而来
 * create by WX
 */
import ProductType from '@/3d/lib/Common/productType/ProductType';
import PhraseRealAddrSec from './PhraseRealAddrSec';
import PhraseRealCapabilitySec from './PhraseRealCapabilitySec';
import PhraseRealObserSec from './PhraseRealObserSec';
export default class PhraseProductHead {
  /** 解析雷达地址参数段【160】:AddressInfoModel</br> */
  _addressInfModel = null;
  /** 解析雷达性能参数段【40】:PhraseRealCapabilitySec</br> */
  _phraseRealCapabilitySec = null;

  /** 解析实时数据观察参数段【1066】:PhraseRealObserSec</br> */
  _phraseRealObserSec = null;

  /**  径向头长度【64】 */
  _radialHeadLen = 64;

  /** 所有扫描层的径向数据长度 */
  allLayerSizeofRadial = null;
  phrase (data) {
    if (data == null || data.byteLength === 0) {
      return false
    } else {
      this._addressInfModel = new PhraseRealAddrSec(data)
      this._phraseRealCapabilitySec = new PhraseRealCapabilitySec(data)
      this._phraseRealObserSec = new PhraseRealObserSec(data)
      this.allLayerSizeofRadial = null
      if (this._phraseRealObserSec.iProductNumber === ProductType.VOL_TYPE ||
        this._phraseRealObserSec.iProductNumber === ProductType.VOLSRC_TYPE ||
        this._phraseRealObserSec.iProductNumber === ProductType.RHI_TYPE ||
        this._phraseRealObserSec.iProductNumber === ProductType.THI_TYPE ||
        this._phraseRealObserSec.iProductNumber === ProductType.RPI_TYPE) {
        this.GetSizeOfRadial()
      }
      return true
    }
  }

  /** 计算体扫文件中每一层每个径向 数据的长度 */
  GetSizeOfRadial () {
    if (this.allLayerSizeofRadial === null) {
      this.allLayerSizeofRadial = []
      for (var i = 0; i < this._phraseRealObserSec.iScanCutNum; i++) {
        switch (this._phraseRealObserSec.wavForm[i]) {
          case 0:// LCS,R
            this.allLayerSizeofRadial[i] = this._radialHeadLen +
            this._phraseRealObserSec.usRefBinNumber[i]
            break
          case 1: // LCD, V,W
            this.allLayerSizeofRadial[i] = this._radialHeadLen + this._phraseRealObserSec.usDopBinNumber[i] * 2
            break
          case 2: // HCD, R, V,W
          case 4:
          case 5:
          case 6:
            this.allLayerSizeofRadial[i] = this._radialHeadLen +
            this._phraseRealObserSec.usRefBinNumber[i] +
            this._phraseRealObserSec.usDopBinNumber[i] * 2
            break
          case 7:
            this.allLayerSizeofRadial[i] = this._radialHeadLen +
            this._phraseRealObserSec.usRefBinNumber[i] * 2 +
            this._phraseRealObserSec.usDopBinNumber[i] * 2
            break
          case 8:
            this.allLayerSizeofRadial[i] = this._radialHeadLen +
            this._phraseRealObserSec.usRefBinNumber[i] * 7 +
            this._phraseRealObserSec.usDopBinNumber[i] * 2 // PDP为双字节
            break
          case 9:// R, V,W,Unz
            this.allLayerSizeofRadial[i] = this._radialHeadLen +
            this._phraseRealObserSec.usRefBinNumber[i] * 2 +
            this._phraseRealObserSec.usDopBinNumber[i] * 2
            break
          case 10:// R, V,W,Unz,HCL,ZDR,KDP,RHV,PDP
            this.allLayerSizeofRadial[i] = this._radialHeadLen +
            this._phraseRealObserSec.usRefBinNumber[i] * 8 +
            this._phraseRealObserSec.usDopBinNumber[i] * 2 // PDP为双字节
            break
          case 11:// R, V,W,LDR
            this.allLayerSizeofRadial[i] = this._radialHeadLen +
              this._phraseRealObserSec.usRefBinNumber[i] * 2 +
              this._phraseRealObserSec.usDopBinNumber[i] * 2
            break
          case 12:// R, V,W,Unz,LDR
            this.allLayerSizeofRadial[i] = this._radialHeadLen +
              this._phraseRealObserSec.usRefBinNumber[i] * 3 +
              this._phraseRealObserSec.usDopBinNumber[i] * 2
            break
          default :this.allLayerSizeofRadial[i] = 0; break
        }
      }
    }
    // return this.allLayerSizeofRadial
  }

  /** 根据层数和类型获取距离库数 */
  GetLayeriBinNum (layer, type) {
    let binNum = 0
    switch (this._phraseRealObserSec.wavForm[layer]) {
      case 0:// LCS,R
        binNum = this._phraseRealObserSec.usRefBinNumber[layer]
        break
      case 1: // LCD, V,W
        binNum = this._phraseRealObserSec.usDopBinNumber[layer]
        break
      case 2: // HCD, R, V,W
      case 4:
      case 5:
      case 6:
      case 7:
      case 8:
      case 9:
      case 10:
      case 11:
      case 12:
        if ((type === ProductType.V_TYPE) ||
          (type === ProductType.W_TYPE) ||
          (type === ProductType.VCS_TYPE) ||
          (type === ProductType.SCS_TYPE) ||
          (type === ProductType.MVCAPPI_TYPE) ||
          (type === ProductType.MWCAPPI_TYPE)) {
          binNum = this._phraseRealObserSec.usDopBinNumber[layer]
        } else {
          binNum = this._phraseRealObserSec.usRefBinNumber[layer]
        }
        break
      default : binNum = 0
      break
    }
    return binNum
  }

  /** 根据层数和类型获取距离库库长 */
  GetLayeriRefBinLen (layer, type) {
    let refBinLen = 0
    switch (this._phraseRealObserSec.wavForm[layer]) {
      case 0:// LCS,R
        refBinLen = this._phraseRealObserSec.iRefBinLen[layer]
        break
      case 1: // LCD, V,W
        refBinLen = this._phraseRealObserSec.iDopBinLen[layer]
        break
      case 2: // HCD, R, V,W
      case 4:
      case 5:
      case 6:
      case 7:
      case 8:
      case 9:
      case 10:
      case 11:
      case 12:
        if ((type === ProductType.V_TYPE) ||
        (type === ProductType.W_TYPE) ||
        (type === ProductType.VCS_TYPE) ||
        (type === ProductType.SCS_TYPE) ||
        (type === ProductType.MVCAPPI_TYPE) ||
        (type === ProductType.MWCAPPI_TYPE)) {
          refBinLen = this._phraseRealObserSec.iDopBinLen[layer]
        } else {
          refBinLen = this._phraseRealObserSec.iRefBinLen[layer]
        }
        break
      default : refBinLen = 0
        break
    }
    return refBinLen
  }

  /** 获取本文件中扫描模式包含的一次产品类型的字符串，类型之间用,隔开 */
  GetFirstProductTypeStr () {
    // 默认取this._phraseRealObserSec.wavForm[i]，所有有效层的wavForm[i]值相同
    let firstProTypeStr = this.getFirstProTypeStrByWF(this._phraseRealObserSec.wavForm[0])
    return firstProTypeStr
  }
  waveFormMax = 12 // 记录目前支持的最大waveform值
  // 根据waveform获取一次产品type字符串
  getFirstProTypeStrByWF(waveForm){
    let firstProTypeStr = ''
    switch (waveForm) {
      case 0:// LCS,R
        firstProTypeStr = ProductType.R_TYPE.toString()
        break
      case 1: // LCD, V,W
        firstProTypeStr = ProductType.V_TYPE + ',' + ProductType.W_TYPE
        break
      case 2: // HCD, R, V,W
      case 4:
      case 5:
      case 6:
        firstProTypeStr = ProductType.R_TYPE + ',' + ProductType.V_TYPE + ',' + ProductType.W_TYPE
        break
      case 7:
        firstProTypeStr = ProductType.R_TYPE + ',' + ProductType.V_TYPE + ',' + ProductType.W_TYPE + ',' + ProductType.HCL_TYPE
        break
      case 8:
        firstProTypeStr = ProductType.R_TYPE + ',' + ProductType.V_TYPE + ',' + ProductType.W_TYPE + ',' + ProductType.HCL_TYPE +
          ',' + ProductType.ZDR_TYPE + ',' + ProductType.KDP_TYPE + ',' + ProductType.RHV_TYPE + ',' + ProductType.PDP_TYPE
        break
      case 9:// R, V,W,Unz
        firstProTypeStr = ProductType.R_TYPE + ',' + ProductType.V_TYPE + ',' + ProductType.W_TYPE + ',' + ProductType.UnZ_TYPE
        break
      case 10:// R, V,W,Unz,HCL,ZDR,KDP,RHV,PDP
        firstProTypeStr = ProductType.R_TYPE + ',' + ProductType.V_TYPE + ',' + ProductType.W_TYPE + ',' + ProductType.HCL_TYPE +
          ',' + ProductType.ZDR_TYPE + ',' + ProductType.KDP_TYPE + ',' + ProductType.RHV_TYPE + ',' + ProductType.PDP_TYPE +
          ',' + ProductType.UnZ_TYPE
        break
      case 11:// R, V,W,LDR
        firstProTypeStr = ProductType.R_TYPE + ',' + ProductType.V_TYPE + ',' + ProductType.W_TYPE + ',' + ProductType.LDR_TYPE
        break
      case 12:// R, V,W,Unz,LDR
        firstProTypeStr = ProductType.R_TYPE + ',' + ProductType.V_TYPE + ',' + ProductType.W_TYPE + ',' + ProductType.UnZ_TYPE + ',' + ProductType.LDR_TYPE
        break
      default :firstProTypeStr = ''; break
    }
    return firstProTypeStr
  }
  dispose () {
    this._addressInfModel = null
    this._phraseRealCapabilitySec = null
    this._phraseRealObserSec = null
  }
}
