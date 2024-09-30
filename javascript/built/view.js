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
        this._dragged = false;
        this.incomingRelations = [];
        this.outgoingRelations = [];
    }
    get dragged() { return this._dragged; }
    ;
    set dragged(dragging) { this._dragged = dragging; }
    ;
    addRelation(relation, direction) {
        let array = direction == "incoming" ? this.incomingRelations : this.outgoingRelations;
        array.push(relation);
    }
    removeRelation(relation) {
        let outgoingRelIndex = this.outgoingRelations.findIndex(line => relation.id == line.id);
        if (outgoingRelIndex)
            this.outgoingRelations.splice(outgoingRelIndex, 1);
        let incomingRelIndex = this.outgoingRelations.findIndex(line => relation.id == line.id);
        if (incomingRelIndex)
            this.incomingRelations.splice(incomingRelIndex, 1);
    }
}
