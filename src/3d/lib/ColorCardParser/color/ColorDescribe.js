
/** 根据颜色的数值获取HCL色标对应的文字描述 */
function getHCLStrFromVal (val) {
  // STRHCLOUT {"非气象","小雨","大雨","大雨滴","干雪","湿雪","冰晶","小冰雹","大冰雹","雨夹雹"}
  let reStr = ''// 无效数据;
  switch (val) {
    case 2:
      reStr = '非气象'
      break
    case 3:
      reStr = '小雨'
      break
    case 4:
      reStr = '中雨'
      break
    case 5:
      reStr = '大雨'
      break
    case 6:
      reStr = '干雪'
      break
    case 7:
      reStr = '湿雪'
      break
    case 8:
      reStr = '冰晶'
      break
    case 9:
      reStr = '小冰雹'
      break
    case 10:
      reStr = '大冰雹'
      break
    case 11:
      reStr = '雨夹雹'
      break
    default:
      reStr = '-ND-'// 无效数据;
  }
  return reStr
}

/**
   * 根据颜色的数值获取SEI色标对应的文字描述
   * @param val
   * @returns {string}
   */
function getSEIStrFromVal (val) {
  let reStr = ''// 无效数据;
  switch (val) {
    case 0:
      reStr = '小雨'
      break
    case 1:
      reStr = '中雨'
      break
    case 2:
      reStr = '大雨'
      break
    case 3:
      reStr = '暴雨'
      break
    case 4:
      reStr = '大暴雨'
      break
    case 5:
      reStr = '特大暴雨'
      break
    default:
      reStr = ''// 无效数据;
      break
  }
  return reStr
}

/** 根据颜色的数值获取云顶高底高(KA)色标对应的文字描述 */
function getKCheiStrFromVal (val) {
  let reStr = ''// 无效数据;
  switch (val) {
    case 2:
      reStr = '底高'
      break
    case 3:
      reStr = '填充'
      break
    case 4:
      reStr = '顶高'
      break
    default:
      reStr = ''// 无效数据;
      break
  }
  return reStr
}

function getCloudCoverText (val) {
  let reStr = '' //  无效数据;
  switch (val) {
    case 2:
      reStr = '低层云'
      break
    case 3:
      reStr = '中层云'
      break
    case 4:
      reStr = '高层云'
      break
    case 5:
      reStr = '总云量'
      break
    default:
      reStr = '' // 无效数据;
      break
  }
  return reStr
}

function getCloudShape (val) {
  switch (val) {
    case 0:
      return '-ND-'
    case 1:
      return '-ND-'
    case 2:
      return '降雨'
    case 3:
      return '积云'
    case 4:
      return '积雨云'
    case 5:
      return '雨层云'
    case 6:
      return '高层云'
    case 7:
      return '卷云'
    default:
      return '未识别'
  }
}

function getCHCLText (val) {
  switch (val) {
    case 2:
      return '冷云'
    case 3:
      return '暖云'
    case 4:
      return '降水'
    default:
      return '-ND-'
  }
}

export { getKCheiStrFromVal, getCloudCoverText, getHCLStrFromVal, getSEIStrFromVal, getCloudShape, getCHCLText }
