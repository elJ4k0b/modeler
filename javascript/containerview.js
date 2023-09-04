class ContainerView
{
    constructor(pId, pTitle, pType, pX, pY,  pWidth, pHeight)
    {
        this.id = pId; 
        this.position = {
            left: pX,
            top: pY,
        }
        this.dimension = {
            width: pWidth,
            height: pHeight
        }
        this.minWidth = 0;
        this.minHeight = 0;
        this.children = new Map();
        this.title = pTitle;
        this.type = pType;
        this.selected = false;
        this.dragged = false;
    }
    add(tblview)
    {
        this.dimension.width = Math.max(this.dimension.width, tblview.position.left + tblview.dimension.width);
        this.dimension.height = Math.max(this.dimension.height, tblview.position.top + tblview.dimension.height);
        this.minHeight = this.dimension.height;
        this.minWidth = this.dimension.width;
        this.children.set(tblview.id, tblview);
    }

    move(x, y)
    {
        let deltaX = x - this.position.left;
        let deltaY = y - this.position.top;

        this.position.left = x;
        this.position.top = y;

        for(let child of this.children.values())
        {   
            child.dragged = this.dragged;
            child.move(child.position.left + deltaX, child.position.top + deltaY);
        }

    }
    resize(width, height)
    {
        if(width > this.minWidth)
        {
            this.dimension.width = width;
        }
        if(height > this.minHeight)
        {
            this.dimension.height = height;
        }    
    }
}

export default ContainerView;