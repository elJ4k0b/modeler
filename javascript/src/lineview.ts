import ContainerView from "./containerview.js";
import { View } from "./view.js";

class LineView extends View
{
    public override id: string;
    public override title: string;
    public override typeId: string;
    public override selected: boolean;
    public override container: ContainerView | null;

    public bendpoints: Array<{x: number, y: number}>
    public startId: string;
    public endId: string;

    constructor(pId: string, pStartId: string, pEndId: string, pType: string, pTitle: string, pBendPoints: Array<{x: number, y: number}>)
    {
        super();
        this.id = pId;
        this.title = pTitle;
        this.typeId = pType;
        this.selected = false;
        this.container = null

        this.startId = pStartId; 
        this.endId = pEndId;
        this.bendpoints = pBendPoints;
    }

    move()
    {
        
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