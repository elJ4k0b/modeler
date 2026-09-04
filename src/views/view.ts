import ContainerView from "./container-view.js";
import draw from "../core/draw.js";
import LineView from "../lines/line-view.js";


type Point = {x: number, y: number}
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

    public get center(): Point {
        return {
            x: this.position.left + this.dimension.width/2,
            y: this.position.top + this.dimension.height/2
        };
    }
    
    public select(bool: boolean): void {this.selected = bool}
}

export abstract class DiagramElementView  extends View
{
    protected _dragged: boolean = false;
    protected incomingRelations: Array<LineView> = [];
    protected outgoingRelations: Array<LineView> = [];
    protected _zIndex: number = 0;

    constructor(){super()}

    public get dragged(): boolean {return this._dragged};
    public set dragged(dragging: boolean) {
        this._dragged = dragging
        if(dragging)
            this.zIndex = 1000; // Bring to front when dragged
        else
            this.zIndex = 0; // Reset z-index when not dragged
    };
    public set zIndex(z: number) {
        this._zIndex = z
    };
    public get zIndex(): number {return this._zIndex};

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
