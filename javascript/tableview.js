class Tableview
{
    constructor(pId, pTitle, pType, pLeft, pTop,  pWidth, pHeight, pContainer)
    {
        this.title = pTitle;
        this.container = pContainer;
        this.id = pId;
        this.type = pType;
        this.selected = false;
        this.position  = {
            top: pTop,
            left: pLeft
        };
        this.dimension = {
            width: pWidth,
            height: pHeight
        };
        this.columnViews = new Map();
        this.dirty  = true;
        this.selected = false;
        this.locked = false;
    }

    get_col(id)
    {
        return this.columnViews.get(id);
    }
    add (colView)
    {
        if(colView == null) {return};
        this.columnViews.set(colView.id, colView);
    }
    lock(bool)
    {
        this.locked = !this.locked;
    }

    move(left, top)
    {
        if(!this.locked)
        {
            if(this.container) this.container.update_bounds(this);
            this.position.top = top;
            this.position.left = left;
        }
    }
}

export default Tableview;