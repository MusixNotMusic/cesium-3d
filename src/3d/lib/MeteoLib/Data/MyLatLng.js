function MyLatLng(longitude, latitude) {
  this.m_LoDeg = 0
  this.m_LoMin = 0
  this.m_LoSec = 0
  this.m_LaDeg = 0
  this.m_LaMin = 0
  this.m_LaSec = 0
  this.m_Longitude = 0.0
  this.m_Latitude = 0.0
  this.m_RadLo = 0.0
  this.m_RadLa = 0.0
  this.Ec = 0.0
  this.Ed = 0.0

  this.m_LoDeg = parseInt(longitude) //经度取整
  this.m_LoMin = parseInt((longitude - this.m_LoDeg) * 60) //与取整后的差放大60倍后取整
  this.m_LoSec = (longitude - this.m_LoDeg - this.m_LoMin / 60.0) * 3600 //

  this.m_LaDeg = parseInt(latitude)
  this.m_LaMin = parseInt((latitude - this.m_LaDeg) * 60)
  this.m_LaSec = (latitude - this.m_LaDeg - this.m_LaMin / 60.0) * 3600

  this.m_Longitude = longitude
  this.m_Latitude = latitude
  this.m_RadLo = (longitude * Math.PI) / 180.0
  this.m_RadLa = (latitude * Math.PI) / 180.0
  this.Ec =
    MyLatLng.Rj +
    ((MyLatLng.Rc - MyLatLng.Rj) * (90.0 - this.m_Latitude)) / 90.0
  this.Ed = this.Ec * Math.cos(this.m_RadLa)
}
MyLatLng.Rc = 6378137.0
MyLatLng.Rj = 6356725.0

export default MyLatLng
