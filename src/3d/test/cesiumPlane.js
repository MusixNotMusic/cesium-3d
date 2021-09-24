import * as Cesium from 'cesium';

export function generatorPlane() {
    var viewer = MeteoInstance.cesium.viewer;

    var dimensions = new Cesium.Cartesian3(400000.0, 400000.0, 1.0);
    var positionOnEllipsoid = Cesium.Cartesian3.fromDegrees(116.3912, 39.920);
    var translateMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(positionOnEllipsoid);
    var rotationXMatrix = Cesium.Matrix4.fromRotationTranslation(Cesium.Matrix3.fromRotationX(Cesium.Math.toRadians(-90.0)));
    var rotationYMatrix = Cesium.Matrix4.fromRotationTranslation(Cesium.Matrix3.fromRotationY(Cesium.Math.toRadians(90.0)));
    var scaleMatrix = Cesium.Matrix4.fromScale(dimensions);

    var planeZModelMatrix = new Cesium.Matrix4();
    Cesium.Matrix4.multiply(translateMatrix, scaleMatrix, planeZModelMatrix);

    var planeXModelMatrix = new Cesium.Matrix4();
    Cesium.Matrix4.multiply(translateMatrix, rotationXMatrix, planeXModelMatrix);
    Cesium.Matrix4.multiply(planeXModelMatrix, scaleMatrix, planeXModelMatrix);

    var planeYModelMatrix = new Cesium.Matrix4();
    Cesium.Matrix4.multiply(translateMatrix, rotationYMatrix, planeYModelMatrix);
    Cesium.Matrix4.multiply(planeYModelMatrix, scaleMatrix, planeYModelMatrix);

    createPlane(planeZModelMatrix, new Cesium.Color(0.0, 0.0, 1.0, 1.0)); //z --> b
    createPlane(planeXModelMatrix, new Cesium.Color(1.0, 0.0, 0.0, 1.0)); //x --> r
    createPlane(planeYModelMatrix, new Cesium.Color(0.0, 1.0, 0.0, 1.0)); //y --> g

    viewer.camera.flyToBoundingSphere(new Cesium.BoundingSphere(positionOnEllipsoid, 300000));
}


function createPlane(planeModelMatrix, color) {
    var viewer = MeteoInstance.cesium.viewer;
    var scene = viewer.scene;
    var planeGeometry = new Cesium.PlaneGeometry({
        vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT,
    });

    var planeOutlineGeometry = new Cesium.PlaneOutlineGeometry({});

    var planeGeometryInstance = new Cesium.GeometryInstance({
        geometry: planeGeometry,
        modelMatrix: planeModelMatrix,
        attributes: {
            color: Cesium.ColorGeometryInstanceAttribute.fromColor(color)
        }
    });

    scene.primitives.add(new Cesium.Primitive({
        geometryInstances: planeGeometryInstance,
        appearance: new Cesium.PerInstanceColorAppearance({
            closed: false,
            translucent: false
        })
    }));

    var planeOutlineGeometryInstance = new Cesium.GeometryInstance({
        geometry: planeOutlineGeometry,
        modelMatrix: planeModelMatrix,
        attributes: {
            color: Cesium.ColorGeometryInstanceAttribute.fromColor(new Cesium.Color(1.0, 1.0, 1.0, 1.0)),
        }
    })

    scene.primitives.add(new Cesium.Primitive({
        geometryInstances: planeOutlineGeometryInstance,
        appearance: new Cesium.PerInstanceColorAppearance({
            flat: true,
            renderState: {
                lineWidth: Math.min(2.0, scene.maximumAliasedLineWidth)
            }
        })
    }))
}
