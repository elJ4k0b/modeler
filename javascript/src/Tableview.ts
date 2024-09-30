import ContainerView from "./containerview.js";
import { log } from "./Log.js";
import { DiagramElementView } from "./view.js";

class Tableview extends DiagramElementView
{
    public override id: string;
    public override title: string;
    public override typeId: string;
    public override position: { top: number; left: number; };
    public override dimension: { width: number; height: number; };
    public override container: ContainerView | null;
    public locked: boolean;

    constructor(pId: string, pTitle: string, pType: string, pLeft: number, pTop: number,  pWidth: number, pHeight: number, pContainer: ContainerView | null)
    {
        super();
        this.title = pTitle;
        this.id = pId;
        this.typeId = pType;
        this.selected = false;
        this.container = pContainer;
        this.position  = {
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

    lock()
    {
        this.locked = !this.locked;
    }

    public override move(left: number, top: number, manual: boolean = true)
    {
        console.log(manual);
        log(`${this.dragged}`, "info");
        if(!manual)
        {
            let deltaX = left - this.position.left;
            let deltaY = top - this.position.top;
            for(let rel of this.incomingRelations) rel.move({x: deltaX, y: deltaY});
            //for(let rel of this.outgoingRelations) rel.move({x: deltaX, y: deltaY});
        }
        else
        {
            for(let rel of this.outgoingRelations) rel.resetBendpoints();
            for(let rel of this.incomingRelations) rel.resetBendpoints();
        }

        if(!this.locked)
        {
            if(this.container) this.container.update_bounds();
            this.position.top = top;
            this.position.left = left;
        }

    }
}

export default Tableview;