import ContainerView from "./containerview.js";
import LineView from "./lineview.js";

export abstract class View
{
    public abstract id: string;
    public abstract title: string;
    public abstract typeId: string;
    public abstract container: ContainerView | null;
    public selected: boolean = false;
    public highlighted: boolean = false;
    public position: {top: number, left: number} = {top: 0, left: 0}
    public dimension: {width: number, height: number} = {width: 0, height: 0}

    constructor() {}
}

export abstract class DiagramElementView  extends View
{
    protected _dragged: boolean = false;
    protected incomingRelations: Array<LineView> = [];
    protected outgoingRelations: Array<LineView> = [];

    constructor(){super()}

    public get dragged(): boolean {return this._dragged};
    public set dragged(dragging: boolean) {this._dragged = dragging};

    public addRelation(relation: LineView, direction: "incoming" | "outgoing")
    {
        let array = direction == "incoming" ? this.incomingRelations : this.outgoingRelations;
        array.push(relation)
    }

    public removeRelation(relation: LineView)
    {
        let outgoingRelIndex = this.outgoingRelations.findIndex(line => relation.id == line.id)
        if(outgoingRelIndex)
            this.outgoingRelations.splice(outgoingRelIndex, 1);
        let incomingRelIndex = this.outgoingRelations.findIndex(line => relation.id == line.id)
        if(incomingRelIndex)
            this.incomingRelations.splice(incomingRelIndex, 1);
    }

    public abstract move (x: number, y: number, manual?: boolean): void;
}