import { View } from "./view.js";
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
    get bendpoints() { return Array.from(this._bendpoints.values()); }
    ;
    set bendpoints(points) { this.update(points); }
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
}
export default LineView;
