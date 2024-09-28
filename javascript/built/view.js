export class View {
    constructor() {
        this.selected = false;
        this.highlighted = false;
        this.position = { top: 0, left: 0 };
        this.dimension = { width: 0, height: 0 };
    }
}
export class DiagramElementView extends View {
    constructor() {
        super();
        this.dragged = false;
    }
}
