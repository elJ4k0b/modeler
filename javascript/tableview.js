class Tableview
{
    constructor(pId, pTitle, pLeft, pTop,  pWidth, pHeight)
    {
        this.title = pTitle;
        this.id = pId;
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
            this.position.top = top;
            this.position.left = left;
        }
    }
}