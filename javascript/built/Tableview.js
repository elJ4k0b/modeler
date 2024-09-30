import { log } from "./Log.js";
import { DiagramElementView } from "./view.js";
class Tableview extends DiagramElementView {
    constructor(pId, pTitle, pType, pLeft, pTop, pWidth, pHeight, pContainer) {
        super();
        this.title = pTitle;
        this.id = pId;
        this.typeId = pType;
        this.selected = false;
        this.container = pContainer;
        this.position = {
            top: pTop,
            left: pLeft
        };
        this.dimension = {
            width: pWidth,
            height: pHeight
        };
        this.selected = false;
        this.locked = false;
        this._dragged = false;
    }
    lock() {
        this.locked = !this.locked;
    }
    move(left, top, manual = true) {
        console.log(manual);
        log(`${this.dragged}`, "info");
        if (!manual) {
            let deltaX = left - this.position.left;
            let deltaY = top - this.position.top;
            for (let rel of this.incomingRelations)
                rel.move({ x: deltaX, y: deltaY });
            //for(let rel of this.outgoingRelations) rel.move({x: deltaX, y: deltaY});
        }
        else {
            for (let rel of this.outgoingRelations)
                rel.resetBendpoints();
            for (let rel of this.incomingRelations)
                rel.resetBendpoints();
        }
        if (!this.locked) {
            if (this.container)
                this.container.update_bounds();
            this.position.top = top;
            this.position.left = left;
        }
    }
}
export default Tableview;
