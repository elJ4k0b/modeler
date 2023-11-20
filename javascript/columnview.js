class ColumnView
{
    constructor(pId, pX, pY, pTitle, pType)
    {
        this.id = pId; 
        this.position = {
            left: pX,
            top: pY,
        }
        this.title = pTitle;
        this.typeId = pType;
        this.selected = false;
    }
}

export default ColumnView;