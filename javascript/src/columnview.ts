import ContainerView from "./containerview.js";
import { View } from "./view.js";

class ColumnView extends View
{
    public override id: string;
    public override position: {left: number, top: number};
    public override container: ContainerView | null;
    public title: string;
    public typeId: string;

    constructor(pId: string, pX: number, pY: number, pTitle: string, pType: string)
    {
        super();
        this.id = pId; 
        this.position = {
            left: pX,
            top: pY,
        }
        this.title = pTitle;
        this.typeId = pType;
        this.selected = false;
        this.container = null
    }
}

export default ColumnView;