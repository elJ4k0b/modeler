class LineView
{
    constructor(pId, pStartId, pEndId, pType, pTitle)
    {
        this.id = pId;
        this.title = pTitle;
        this.startId = pStartId; 
        this.endId = pEndId;
        this.type = pType;
        this.selected = false;
    }
}

export default LineView;