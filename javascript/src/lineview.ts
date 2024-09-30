import ContainerView from "./containerview.js";
import { View } from "./view.js";

type Point = {x: number, y: number};

export class BendPoint
{
    public x: number = 0;
    public y: number = 0;
    public id: string;
    constructor(point: Point)
    {
        this.x = point.x;
        this.y = point.y;
        this. id = (Math.random() * 10000).toString();
    }
}

class LineView extends View
{
    public override id: string;
    public override title: string;
    public override typeId: string;
    public override selected: boolean;
    public override container: ContainerView | null;

    private _bendpoints: Map<string, BendPoint>
    public startId: string;
    public endId: string;

    constructor(pId: string, pStartId: string, pEndId: string, pType: string, pTitle: string, pBendPoints: Array<Point>)
    {
        super();
        this.id = pId;
        this.title = pTitle;
        this.typeId = pType;
        this.selected = false;
        this.container = null

        this.startId = pStartId; 
        this.endId = pEndId;
        this._bendpoints = new Map();
        for(let point of pBendPoints)
        {
            let bendpoint = new BendPoint(point);
            this._bendpoints.set(bendpoint.id, bendpoint);
        }
    }

    public get bendpoints(): Array<BendPoint> {return Array.from(this._bendpoints.values())};
    public set bendpoints(points: Array<Point>){this.update(points)};

    public getBendpoint(id: string): BendPoint
    {
        return this._bendpoints.get(id) || new BendPoint({x: 0, y: 0});
    }

    public addBendpoint(bendpoint: BendPoint)
    {
        this._bendpoints.set(bendpoint.id, bendpoint);
    }

    public move(delta: {x: number, y: number})
    {
        for(let point of this.bendpoints)
        {
            point.x += delta.x;
            point.y += delta.y;
        }
    }

    public resetBendpoints()
    {
        this._bendpoints = new Map();
    }

    update(points: Array<{x: number, y: number}>)
    {
        let first = points[0];
        let last = points[1];

        this.position.left = first.x;
        this.position.top = first.y;

        this.dimension.width = Math.abs(first.x - last.x);
        this.dimension.height = Math.abs(first.y - last.y);
    }
}

export default LineView;