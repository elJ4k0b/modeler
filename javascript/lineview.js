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
        this.position = {
            top: 0,
            left: 0,
        }
        this.dimension = {
            width: 0,
            height: 0
        }
    }

    move()
    {
        
    }

    update(points)
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