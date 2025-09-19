import { diagview } from "../diagramview.js";
import { log } from "../Log.js";
import Tableview from "../Tableview.js";
import { View } from "../view.js";
export class BendPoint {
    constructor(point) {
        this.x = 0;
        this.y = 0;
        this.x = point.x;
        this.y = point.y;
        this.id = (Math.random() * 10000).toString();
    }
}
class LineView extends View {
    constructor(pId, pStartId, pEndId, pType, pTitle, pBendPoints) {
        super();
        this.id = pId;
        this.title = pTitle;
        this.typeId = pType;
        this.selected = false;
        this.container = null;
        this.startId = pStartId;
        this.endId = pEndId;
        this._bendpoints = new Map();
        for (let point of pBendPoints) {
            let bendpoint = new BendPoint(point);
            this._bendpoints.set(bendpoint.id, bendpoint);
        }
    }
    get bendpoints() {
        let bendpointArray = Array.from(this._bendpoints.values());
        let origin = {
            x: this.originElement.position.left,
            y: this.originElement.position.top,
        };
        return bendpointArray.sort((a, b) => _distance(origin, a) - _distance(origin, b));
    }
    set bendpoints(points) {
        this.update(points);
        this._bendpoints = new Map();
        for (let point of points) {
            let bendpoint = new BendPoint(point);
            this._bendpoints.set(bendpoint.id, bendpoint);
        }
    }
    ;
    getBendpoint(id) {
        return this._bendpoints.get(id) || new BendPoint({ x: 0, y: 0 });
    }
    addBendpoint(bendpoint) {
        this._bendpoints.set(bendpoint.id, bendpoint);
    }
    move(delta) {
        for (let point of this.bendpoints) {
            point.x += delta.x;
            point.y += delta.y;
        }
    }
    resetBendpoints() {
        this._bendpoints = new Map();
    }
    update(points) {
        let first = points[0];
        let last = points[1];
        this.position.left = first.x;
        this.position.top = first.y;
        this.dimension.width = Math.abs(first.x - last.x);
        this.dimension.height = Math.abs(first.y - last.y);
    }
    get originElement() {
        let originElement = diagview.get_element(this.startId);
        if (!originElement) {
            log(`OriginElement of line with id ${this.id} does not exist`, "error", { file: "lineview.ts", method: "targetElement" });
            return new Tableview("", "", "", 0, 0, 0, 0, null);
        }
        return originElement;
    }
    get targetElement() {
        let targetElement = diagview.get_element(this.endId);
        if (!targetElement) {
            log(`TargetElement of line with id ${this.id} does not exist`, "error", { file: "lineview.ts", method: "targetElement" });
            return new Tableview("", "", "", 0, 0, 0, 0, null);
        }
        return targetElement;
    }
}
function _distance(point1, point2) {
    let distance = { x: 0, y: 0 };
    distance.x = Math.abs(point1.x - point2.x);
    distance.y = Math.abs(point1.y - point2.y);
    return Math.sqrt(Math.pow(distance.x, 2) + Math.pow(distance.y, 2));
}
export default LineView;
