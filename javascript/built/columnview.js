import { View } from "./view.js";
class ColumnView extends View {
    constructor(pId, pX, pY, pTitle, pType) {
        super();
        this.id = pId;
        this.position = {
            left: pX,
            top: pY,
        };
        this.title = pTitle;
        this.typeId = pType;
        this.selected = false;
        this.container = null;
    }
}
export default ColumnView;
