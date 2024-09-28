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
        this.dragged = false;
    }
    lock() {
        this.locked = !this.locked;
    }
    move(left, top) {
        if (!this.locked) {
            if (this.container)
                this.container.update_bounds();
            this.position.top = top;
            this.position.left = left;
        }
    }
}
export default Tableview;
