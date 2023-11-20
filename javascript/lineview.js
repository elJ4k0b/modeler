class LineView
{
    constructor(pId, pStartId, pEndId, pType, pTitle, pBendPoints)
    {
        this.id = pId;
        this.title = pTitle;
        this.startId = pStartId; 
        this.endId = pEndId;
        this.typeId = pType;
        this.bendpoints = pBendPoints;
        this.selected = false;
    }
}

export default LineView;