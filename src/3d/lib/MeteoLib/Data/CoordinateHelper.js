import MyLatLng from './MyLatLng'
function CoordinateHelper() {}
var EARTH_RADIUS = 6378137 //赤道半径(单位m)
CoordinateHelper.EARTH_RADIUS = EARTH_RADIUS
/**
 * 度转化为弧度(rad)
 * */
function Deg2rad(degree) {
  return (degree * Math.PI) / 180.0
}

CoordinateHelper.Deg2rad = Deg2rad

/// <summary>
/// 弧度转化为度
/// </summary>
/// <param name="d"></param>
/// <returns></returns>
function Rad2deg(rad) {
  return (rad / Math.PI) * 180.0
}
CoordinateHelper.Rad2deg = Rad2deg

/**
 * 基于余弦定理求两经纬度距离
 * @param lon1 第一点的精度
 * @param lat1 第一点的纬度
 * @param lon2 第二点的精度
 * @param lat3 第二点的纬度
 * @return 返回的距离，单位km
 * */
function LatitudeLongitudeDist(lon1, lat1, lon2, lat2) {
  var radLat1 = Deg2rad(lat1)
  var radLat2 = Deg2rad(lat2)

  var radLon1 = Deg2rad(lon1)
  var radLon2 = Deg2rad(lon2)

  if (radLat1 < 0) radLat1 = Math.PI / 2 + Math.abs(radLat1) // south
  if (radLat1 > 0) radLat1 = Math.PI / 2 - Math.abs(radLat1) // north
  if (radLon1 < 0) radLon1 = Math.PI * 2 - Math.abs(radLon1) // west
  if (radLat2 < 0) radLat2 = Math.PI / 2 + Math.abs(radLat2) // south
  if (radLat2 > 0) radLat2 = Math.PI / 2 - Math.abs(radLat2) // north
  if (radLon2 < 0) radLon2 = Math.PI * 2 - Math.abs(radLon2) // west
  var x1 = EARTH_RADIUS * Math.cos(radLon1) * Math.sin(radLat1)
  var y1 = EARTH_RADIUS * Math.sin(radLon1) * Math.sin(radLat1)
  var z1 = EARTH_RADIUS * Math.cos(radLat1)

  var x2 = EARTH_RADIUS * Math.cos(radLon2) * Math.sin(radLat2)
  var y2 = EARTH_RADIUS * Math.sin(radLon2) * Math.sin(radLat2)
  var z2 = EARTH_RADIUS * Math.cos(radLat2)

  var d = Math.Sqrt(
    (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2) + (z1 - z2) * (z1 - z2)
  )
  //余弦定理求夹角
  var theta = Math.Acos(
    (EARTH_RADIUS * EARTH_RADIUS + EARTH_RADIUS * EARTH_RADIUS - d * d) /
      (2 * EARTH_RADIUS * EARTH_RADIUS)
  )
  var dist = theta * EARTH_RADIUS
  return dist
}
CoordinateHelper.LatitudeLongitudeDist = LatitudeLongitudeDist

/// <summary>
/// 计算某点周围某段距离对应的四点的经纬度
/// </summary>
/// <param name="lng">经度</param>
/// <param name="lat">纬度</param>
/// <param name="distance">距离</param>
function SquarePoint(lng, lat, distance) {
  var dlng =
    2 *
    Math.Asin(Math.sin(distance / (2 * EARTH_RADIUS)) / Math.cos(Deg2rad(lat)))
  var dlat = Rad2deg(distance / EARTH_RADIUS)

  var leftTop = lat + dlat
  var leftBottom = lat - dlat
  var rightTop = lng + dlng
  var rightBottom = lng - dlng
}
CoordinateHelper.SquarePoint = SquarePoint

/// <summary>
/// 获取夹角
/// </summary>
/// <param name="A"></param>
/// <param name="B"></param>
/// <returns></returns>
function GetAngle(A, B) {
  var dx = (B.m_RadLo - A.m_RadLo) * A.Ed
  var dy = (B.m_RadLa - A.m_RadLa) * A.Ec
  var angle = 0.0
  angle = (Math.Atan(Math.abs(dx / dy)) * 180.0) / Math.PI
  var dLo = B.m_Longitude - A.m_Longitude
  var dLa = B.m_Latitude - A.m_Latitude
  if (dLo > 0 && dLa <= 0) {
    angle = 90.0 - angle + 90
  } else if (dLo <= 0 && dLa < 0) {
    angle = angle + 180.0
  } else if (dLo < 0 && dLa >= 0) {
    angle = 90.0 - angle + 270
  }
  return angle
}
CoordinateHelper.GetAngle = GetAngle

/**
 * 求B点经纬度
 * @param A 已知点的经纬度，
 * @param distance   AB两地的距离  单位km
 * @param angle  AB连线与正北方向的夹角（0~360）
 * @return  B点的经纬度
 */
function getMyLatLng(A, distance, angle) {
  var dx = distance * 1000 * Math.sin(Deg2rad(angle))
  var dy = distance * 1000 * Math.cos(Deg2rad(angle))

  var bjd = ((dx / A.Ed + A.m_RadLo) * 180.0) / Math.PI
  var bwd = ((dy / A.Ec + A.m_RadLa) * 180.0) / Math.PI
  return new MyLatLng(bjd, bwd)
}

CoordinateHelper.getMyLatLng = getMyLatLng

export default CoordinateHelper
