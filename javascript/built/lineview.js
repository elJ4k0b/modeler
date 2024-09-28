import { View } from "./view.js";
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
        this.bendpoints = pBendPoints;
    }
    move() {
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
