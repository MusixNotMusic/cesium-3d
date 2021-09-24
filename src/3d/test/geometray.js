import  * as Cesium from '@/Cesium/Source/Cesium';
import Cgis3DEvent from '@/cgis3d/core/Event';
import * as turf from '@turf/turf'
class DrawTool {
    constructor(){
        this.entities = [];
        this.tempEntities = [];
        this.commandDict = {
            CLEAR:this.clear,
            POINT:this.drawPoint,
            LINE:this.drawLine,
            POLYGON:this.drawPolygon,
            CIRCLE:this.drawCircle,
            RECTANGLE:this.drawRectangle,
            ELLIPSE:this.drawEllipse
        };
        this.commandDictTemp = {
            LINE:this.drawTempLine,
            POLYGON:this.drawTempPolygon,
            RECTANGLE:this.drawTempRectangle,
            CIRCLE:this.drawTempCircle,
            ELLIPSE:this.drawTempEllipse
        }
        this.type = null;
        this.points = [];
    }
    command(type){
        if(type === 'CLEAR'){
            this.clear();
        }else{
            this.type = type;
            this.addEvent();
            this.startDraw();
        }
    }
    clear(){
        this.entities.forEach(entity => {
            cgis3d.viewer.entities.remove(entity);
        })
    }
    clearTempEntities(){
        this.tempEntities.forEach(entity => {
            cgis3d.viewer.entities.remove(entity);
        })
    }
    drawPoint(position){
        let entity = new Cesium.Entity({
            position:new Cesium.Cartesian3.fromDegrees(parseFloat(position.longitude), parseFloat(position.latitude)),
            point:new Cesium.PointGraphics({
                pixelSize:20,
                heightReference:20,
                color:Cesium.Color.RED,
                outlineColor:Cesium.Color.BLUE
            })
        });
        this.entities.push(entity);
        cgis3d.viewer.entities.add(entity);
        this.endDraw();
    }
    drawLine(point){
        this.clear();
        this.points.push(point);
        if(this.points.length < 2){
            return;
        }
        this.clearTempEntities();
        let line = this.createLine(this.points);
        cgis3d.viewer.entities.add(line);
        this.entities.push(line);
    }
    drawTempLine(point){
        this.clearTempEntities();
        if(this.points.length < 1){
            return;
        }
        let line = this.createLine([this.points[this.points.length -1],point]);
        cgis3d.viewer.entities.add(line);
        this.tempEntities.push(line);

    }
    createLine(points){
        let positions = [];
        points.forEach(item => {
            positions.push(new Cesium.Cartesian3.fromDegrees(parseFloat(item.longitude), parseFloat(item.latitude)));
        });
        let line = new Cesium.Entity({
            polyline:new Cesium.PolylineGraphics({
                positions : positions,
                material:Cesium.Color.RED.withAlpha(0.5),
                width:5,
            })
        });
        return line;
    }
    drawPolygon(point){
        this.clear();
        this.points.push(point);
        if(this.points.length < 3){
            this.drawTempLine(point);
            return;
        }
        this.clearTempEntities();
        let polygon = this.createPolygon(this.points);
        cgis3d.viewer.entities.add(polygon);
        this.entities.push(polygon);
    }
    drawTempPolygon(point){
        this.clearTempEntities();
        if(this.points.length <= 2){
            this.drawTempLine(point);
            return;
        }
        let points = [].concat(this.points);
        points.push(point);
        let polygon = this.createPolygon(points);
        cgis3d.viewer.entities.add(polygon);
        this.tempEntities.push(polygon);
    }

    createPolygon(points){
        points = [].concat(points);
        points.push(points[0]);
        let positions = [];
        points.forEach(item => {
            positions.push(new Cesium.Cartesian3.fromDegrees(parseFloat(item.longitude), parseFloat(item.latitude)));
        });
        let polygon = new Cesium.Entity({
            name:'多边形',
            description:"这是描述信息",
            polygon:new Cesium.PolygonGraphics({
                hierarchy : new Cesium.PolygonHierarchy(positions),
                material:Cesium.Color.RED.withAlpha(0.5),
                outline:true,
                outlineColor:Cesium.Color.BLUE,
                outlineWidth:5,
            })
        });
        return polygon;
    }
    drawCircle(point){
        this.clear();
        if(this.points.length < 1){
            this.points.push(point);
            return;
        }else{
            let points = this.createCirclePoints(point);
            if(!points)return;
            this.points = [].concat(points)
        }
        this.clearTempEntities();
        let polygon = this.createPolygon(this.points);
        cgis3d.viewer.entities.add(polygon);
        this.entities.push(polygon);
        this.endDraw();
    }
    drawTempCircle(point){
        this.clearTempEntities();
        if(this.points.length < 1){
            return;
        }else{
            let points = this.createCirclePoints(point);
            if(!points)return;
            let polygon = this.createPolygon([].concat(points));
            cgis3d.viewer.entities.add(polygon);
            this.tempEntities.push(polygon);
        }
    }
    createCirclePoints(point){
        let startPoint = this.points[0];
        let startLon = parseFloat(startPoint.longitude);
        let startLat = parseFloat(startPoint.latitude);
        let endLon = parseFloat(point.longitude);
        let endLat = parseFloat(point.latitude);
        if(startLon === endLon && startLat === endLat)return;
        let clickPoint = [endLon,endLat];
        let distanceOptions = {units: 'kilometers'};
        let distance = turf.distance( [startLon,startLat],clickPoint, distanceOptions);
        let options = {steps: 360, units: 'kilometers', properties: {foo: 'bar'}};
        let circleFeatures = turf.circle([startLon,startLat], distance, options);
        let coordinates = circleFeatures.geometry.coordinates[0];
        let points = [];
        coordinates.forEach(item => {
            points.push({longitude:item[0],latitude:item[1]});
        });
        return points;
    }
    drawRectangle(point){
        this.clear();
        if(this.points.length < 1){
            this.points.push(point);
            return;
        }else{

            let points = this.createRectanglePoints(point);
            if(!points)return;
            this.points = [].concat(points)
        }
        this.clearTempEntities();
        let polygon = this.createPolygon(this.points);
        cgis3d.viewer.entities.add(polygon);
        this.entities.push(polygon);
        this.endDraw();
    }
    drawTempRectangle(point){
        this.clearTempEntities();
        if(this.points.length < 1){
            return;
        }else{
            let points = this.createRectanglePoints(point);
            if(!points)return;
            let polygon = this.createPolygon([].concat(points));
            cgis3d.viewer.entities.add(polygon);
            this.tempEntities.push(polygon);
        }
    }
    createRectanglePoints(point){
        let startPoint = this.points[0];
        let points = [startPoint];
        let startLon = startPoint.longitude;
        let startLat = startPoint.latitude;
        let endLon = point.longitude;
        let endLat = point.latitude;
        if(startLon === endLon && startLat === endLat)return;
        points.push({longitude:endLon,latitude:startLat});
        points.push({longitude:endLon,latitude:endLat});
        points.push({longitude:startLon,latitude:endLat});
        return points;
    }
    drawEllipse(point){
        this.clear();
        if(this.points.length < 1){
            this.points.push(point);
            return;
        }else{
            let points = this.createEllipsePoints(point);
            if(!points)return;
            this.points = [].concat(points)
        }
        this.clearTempEntities();
        let polygon = this.createPolygon(this.points);
        cgis3d.viewer.entities.add(polygon);
        this.entities.push(polygon);
        this.endDraw();
    }
    drawTempEllipse(point){
        this.clearTempEntities();
        if(this.points.length < 1){
            return;
        }else{
            let points = this.createEllipsePoints(point);
            if(!points)return;
            let polygon = this.createPolygon([].concat(points));
            cgis3d.viewer.entities.add(polygon);
            this.tempEntities.push(polygon);
        }
    }
    createEllipsePoints(point){
        let startPoint = this.points[0];
        let startLon = parseFloat(startPoint.longitude);
        let startLat = parseFloat(startPoint.latitude);
        let endLon = parseFloat(point.longitude);
        let endLat = parseFloat(point.latitude);
        let center = [startLon,startLat];
        if(startLon === endLon && startLat === endLat)return;
        let endPoint = [endLon,endLat];
        let distanceOptions = {units: 'kilometers'};
        let xSemiAxis = turf.distance(center,endPoint, distanceOptions);
        let ySemiAxis = xSemiAxis - xSemiAxis * 0.2;
        let ellipse = turf.ellipse(center, xSemiAxis, ySemiAxis,{
            steps:360
        });
        let coordinates = ellipse.geometry.coordinates[0];
        let points = [];
        coordinates.forEach(item => {
            points.push({longitude:item[0],latitude:item[1]});
        });
        return points;
    }
    addEvent(){
        DrawTool.cgs3dEvent = DrawTool.cgs3dEvent || new Cgis3DEvent(cgis3d.viewer);
        DrawTool.cgs3dEvent.on(Cgis3DEvent.LEFT_CLICK,this.leftClickHandler.bind(this));
        DrawTool.cgs3dEvent.on(Cgis3DEvent.LEFT_DOUBLE_CLICK,this.leftDoubleClickHandler.bind(this));
        DrawTool.cgs3dEvent.on(Cgis3DEvent.MOUSE_MOVE,this.mouseMoveHandler.bind(this));
    }
    removeEvent(){
        DrawTool.cgs3dEvent.off(Cgis3DEvent.LEFT_CLICK,this.leftClickHandler);
        DrawTool.cgs3dEvent.off(Cgis3DEvent.LEFT_DOUBLE_CLICK,this.leftDoubleClickHandler);
        DrawTool.cgs3dEvent.off(Cgis3DEvent.MOUSE_MOVE,this.mouseMoveHandler);

    }

    leftClickHandler(movement){
        movement.endPosition = movement.endPosition || movement.position;
        const result = DrawTool.cgs3dEvent.getLocationInfo(movement);
        if(result){
            let fn = this.commandDict[this.type];
            if(fn instanceof Function){
                fn.call(this,result);
            }
        }
    }

    mouseMoveHandler(movement){
        movement.endPosition = movement.endPosition || movement.position;
        const result = DrawTool.cgs3dEvent.getLocationInfo(movement);
        if(result){
            let fn = this.commandDictTemp[this.type];
            if(fn instanceof Function){
                fn.call(this,result);
            }
        }
    }

    startDraw(){
        this.clear();
        this.points = [];
        window.document.body.style.cursor = 'crosshair'
    }

    endDraw(){
        window.document.body.style.cursor = 'default'
        this.removeEvent();
        this.clearTempEntities()
    }

    leftDoubleClickHandler(){
        this.endDraw();
    }
}

export default new DrawTool();