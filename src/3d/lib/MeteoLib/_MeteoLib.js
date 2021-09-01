import * as Cesium from 'cesium'
// Renders
import BasicGeometry from './Render/BasicGeometry'
import FramebufferTexture from './Render/FramebufferTexture'
import GeometryUtils from './Render/GeometryUtils'
import GridDataColorMap from './Render/GridDataColorMap'
import LOD from './Render/LOD'
import MaterialUtils from './Render/MaterialUtils'
import Mesh from './Render/Mesh'
import MeshUtils from './Render/MeshUtils'
import MeshMaterial from './Render/MeshMaterial'
import MeshPhongMaterial from './Render/MeshPhongMaterial'
import MeshVisualizer from './Render/MeshVisualizer'
import PlaneBufferGeometry from './Render/PlaneBufferGeometry'
import RadarMaterial from './Render/RadarMaterial'
import RendererUtils from './Render/RendererUtils'
import Rotation from './Render/Rotation'
import ShaderUtils from './Render/ShaderUtils'
import ShaderChunk from './Render/Shaders/ShaderChunk'

// Data
import CoordinateHelper from './Data/CoordinateHelper'
import MyLatLng from './Data/MyLatLng'

// Util
import CSG from './Util/CSG'
import Path from './Util/Path'
import ImageUtil from './Util/ImageUtil'
import defineProperty from './Util/defineProperty'

export const MeteoLib = {
  Render: {
    BasicGeometry,
    FramebufferTexture,
    GeometryUtils,
    GridDataColorMap,
    LOD,
    MaterialUtils,
    Mesh,
    MeshUtils,
    MeshMaterial,
    MeshPhongMaterial,
    MeshVisualizer,
    PlaneBufferGeometry,
    RadarMaterial,
    RendererUtils,
    Rotation,
    ShaderUtils,
    ShaderChunk,
  },
  Data: {
    CoordinateHelper,
    MyLatLng,
  },
  Util: {
    CSG,
    Path,
    ImageUtil,
    defineProperty,
  },
}
