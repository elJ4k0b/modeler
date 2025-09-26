import { log } from "../Log.js";
import { View } from "../view.js";
import LineView, { BendPoint } from "./lineview.js";

export class Marker
{
    constructor () {};

}

type LineAttachmentAxis =  "x" | "y" | "closest"
type Point = {x: number, y: number};
interface PathStyle {
    stroke: string,
    strokeDasharray: string,
    strokeLinecap: string,
    strokeWidth: string,
    fill: string,
    marker: string,

}

export class LineVisual
{
    protected get EXIT_DIRECTION(): LineAttachmentAxis { return "closest"; }
    protected get ENTRY_DIRECTION(): LineAttachmentAxis { return "closest"; }
    protected get STROKE(): string { return "#343A40"; }
    protected get MARKER_WIDTH(): string { return "2.5pt"; }
    protected get STROKE_DASHARRAY(): string { return "4,12"; }
    protected get STROKE_LINEJOIN(): string { return "round"; }
    protected get STROKE_LINECAP(): string { return "round"; }
    protected get STROKE_WIDTH(): string { return "5pt"; }
    protected get FILL(): string { return "none"; }
    protected get MARKER(): string { return "string"; }
    protected get LINE_GAP(): string { return "40"; }
    protected get SELECTION_EMPHASIS_COLOR(): string { return "#CC6666"; }

    protected get BENDPOINT_FILL(): string { return "#CC6666"; }
    protected get BENDPOINT_RADIUS(): string { return "10pt"; }
    protected get BENDPOINT_STROKE_COLOR(): string { return "white"; }
    protected get BENDPOINT_STROKE_WIDTH(): string { return "3pt"; }
    protected allPoints: Array<Point> = [];

    public HTMLRepresentation: SVGElement;
    public pathElement: SVGElement;
    public label: SVGElement; 

    constructor(line: LineView, opts?: {arrowed: boolean, dashed: boolean}) 
    {
        this.HTMLRepresentation = document.createElementNS("http://www.w3.org/2000/svg", "g");

        let origin = this._calculateOriginPoint(line);
        let target = this._calculateTargetPoint(line);
        let bendpoints = line.bendpoints
        
        let hasBendpoints = line.bendpoints.length > 0;
        let originAlignedToTarget = line.originElement.center.y == line.targetElement.center.y || line.originElement.center.x == line.targetElement.center.x;
        
        this.allPoints.push(origin);
        
        if(!hasBendpoints && !originAlignedToTarget)
        {
            let defaultBendpoints = this._calculateDefaultBendpoints(line.originElement, line.targetElement);
            for(let point of defaultBendpoints)
            {
                bendpoints.push(point)
                //line.addBendpoint(new BendPoint(point));
            }
        }
        this.allPoints.push(...bendpoints);
        this.allPoints.push(target);

        this.allPoints[0] = this._chopEnd(this.allPoints[0], this.allPoints[1]);
        this.allPoints[this.allPoints.length-1] = this._chopEnd(this.allPoints[this.allPoints.length-1], this.allPoints[this.allPoints.length-2])

        this.pathElement = this._createPath(line, opts?.dashed, opts?.arrowed);
        this.HTMLRepresentation.appendChild(this.pathElement);
    
        this.label = this._createLabel(line);
        this.HTMLRepresentation.appendChild(this.label)

        if(line.selected)
        {
            this.pathElement.setAttribute("stroke", this.SELECTION_EMPHASIS_COLOR)

            let pathTouchArea = this._createToucharea(this.pathElement);
            pathTouchArea.classList.add("line");
            this.HTMLRepresentation.appendChild(pathTouchArea);

            for(let bendpoint of line.bendpoints)
            {
                let bendpointVisual = this._createBendpointVisual(bendpoint);
                this.HTMLRepresentation.appendChild(bendpointVisual);
                
                let bendpointToucharea = this._createToucharea(bendpointVisual);
                bendpointToucharea.classList.add("bendpoint");
                bendpointToucharea.style.pointerEvents = "all";
                bendpointToucharea.setAttribute("line-id", line.id);
                this.HTMLRepresentation.appendChild(bendpointToucharea)
            }
        }
        else {
            let pathTouchArea = this._createToucharea(this.pathElement);
            pathTouchArea.classList.add("line");
            this.HTMLRepresentation.appendChild(pathTouchArea);
        }

        if(opts?.arrowed)
        {
            let arrowMarker = this._create_marker();
            this.HTMLRepresentation.appendChild(arrowMarker);
        }

    };

    protected _calculateOriginPoint(line: LineView): Point
    { 
        let originElementCenter = {
            x: line.originElement.position.left + line.originElement.dimension.width/2,
            y: line.originElement.position.top + line.originElement.dimension.height/2,
        };

        let firstBendpoint = line.bendpoints[0] || line.targetElement.center;

        let delta:Point = {
            x: originElementCenter.x - firstBendpoint.x,
            y: originElementCenter.y - firstBendpoint.y,
        }

        
        let exitPoint = {x: 0, y: 0}
        let exitXAxis = this.EXIT_DIRECTION == "x" || (this.EXIT_DIRECTION == "closest" && Math.abs(delta.y) < 10)//Math.abs(delta.x) > Math.abs(delta.y))
        
        if(exitXAxis)
        {   
            exitPoint.y = originElementCenter.y

            let bendpointIsRight = delta.x < 0 && Math.abs(delta.x) > 10
            if(bendpointIsRight)
                exitPoint.x = line.originElement.position.left + line.originElement.dimension.width;
            else
                exitPoint.x = line.originElement.position.left
        }
        else
        {
            exitPoint.x = originElementCenter.x;
    
            let bendpointIsBelow = delta.y < 0;
            if(bendpointIsBelow)
                exitPoint.y = line.originElement.position.top + line.originElement.dimension.height;
            else
                exitPoint.y = line.originElement.position.top            
        }

        //return this._chopEnd(exitPoint, {x:firstBendpoint.x, y: firstBendpoint.y});
        return exitPoint
        
    }


    protected _calculateTargetPoint(line: LineView): Point
    {
        let targetElementCenter = {
            x: line.targetElement.position.left + line.targetElement.dimension.width/2,
            y: line.targetElement.position.top + line.targetElement.dimension.height/2,
        };

        let lastBendpoint = line.bendpoints[line.bendpoints.length-1] || line.originElement.center;

        let delta:Point = {
            x: lastBendpoint.x - targetElementCenter.x,
            y: lastBendpoint.y - targetElementCenter.y,
        }

        
        let entryPoint = {x: 0, y: 0}
        let entryXAxis = this.ENTRY_DIRECTION == "x" || (this.ENTRY_DIRECTION == "closest" && Math.abs(delta.x) > 10)//Math.abs(delta.x) > Math.abs(delta.y)) 
        
        if(entryXAxis)
        {   
            entryPoint.y = targetElementCenter.y

            let bendpointIsLeft = delta.x < 0
            if(bendpointIsLeft)
                entryPoint.x = line.targetElement.position.left;
            else
                entryPoint.x = line.targetElement.position.left +line.targetElement.dimension.width
        }
        else
        {
            entryPoint.x = targetElementCenter.x;
    
            let bendpointIsAbove = delta.y < 0 && Math.abs(delta.y) > 10;
            if(bendpointIsAbove)
                entryPoint.y = line.targetElement.position.top ;
            else
                entryPoint.y = line.targetElement.position.top + line.targetElement.dimension.height           
        }
        //return this._chopEnd(lastBendpoint, entryPoint);
        return entryPoint;
    }

    private _chopEnd(point1: Point, point2: Point): Point
    {
        let direction: Point = {x: 0, y: 0};
        direction.x = point1.x - point2.x;
        direction.y = point1.y - point2.y;

        let newEndPoint: Point = {x: 0, y: 0};
        newEndPoint.x = point2.x + direction.x - Math.sign(direction.x) * 40;
        newEndPoint.y = point2.y  + direction.y - Math.sign(direction.y) * 40;

        return newEndPoint
    }


    protected _calculateDefaultBendpoints(originElement: View, targetElement: View): Array<BendPoint>
    {
        return [new BendPoint(
            {
                x:originElement.position.left + originElement.dimension.width/2,
                y: targetElement.position.top + targetElement.dimension.height/2
            })];
    }

    private _pointArrayToPathString(points: Point[])
    {
        if(points.length <= 0)
        {
            log("Converting empty pointlist to empty string", "warning", {file: "linevisual", method: "_pointArrayToPathString"})
            return "";
        }
        let pathString = `M ${points[0].x} ${points[0].y}`;

        for(let i = 1; i < points.length; i++)
        {
            pathString += `L ${points[i].x} ${points[i].y}`
        }
        return pathString
    }
    private _createToucharea(parent: SVGElement): SVGElement
    {
        try {
            let toucharea = parent.cloneNode(true) as SVGElement;
            toucharea.setAttribute("stroke", "transparent");
            toucharea.setAttribute("stroke-width", "60");
            toucharea.setAttribute("fill", "transparent");
            toucharea.classList.add("toucharea");
            toucharea.style.pointerEvents = "stroke"
            toucharea.id = parent.id;
            return toucharea
        }
        catch(error) {
            log("failed to create Toucharea", "error", {file: "linevisual.ts", method: "_createToucharea"});
            let emptyArea = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            return emptyArea
        }
    }

    private _createBendpointVisual(bendpoint: BendPoint): SVGElement
    {
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", (bendpoint.x).toString());
        circle.setAttribute("cy", (bendpoint.y).toString());
        circle.setAttribute("r", this.BENDPOINT_RADIUS);
        circle.setAttribute("fill", this.BENDPOINT_FILL);
        circle.setAttribute("stroke", this.BENDPOINT_STROKE_COLOR);
        circle.setAttribute("stroke-width", this.BENDPOINT_STROKE_WIDTH);
        circle.setAttribute("id", bendpoint.id);
        

        return circle;
    }
    
    private _distance(point1: Point, point2: Point)
    {
        let distance:Point = {x: 0, y: 0};
        distance.x = Math.abs(point1.x - point2.x);
        distance.y = Math.abs(point1.y - point2.y);
        return Math.sqrt(Math.pow(distance.x, 2) + Math.pow(distance.y, 2));
    }

    private _createLabel(line: LineView): SVGElement
    {
        let labelContainer = document.createElementNS("http://www.w3.org/2000/svg", "text");
        labelContainer.setAttribute("dy", "-20");
        if(line.originElement.center.x > line.targetElement.center.x)
        {
            labelContainer.setAttribute("transform", "scale(-1,-1)");
            labelContainer.setAttribute("transform-origin", "center center");
            labelContainer.setAttribute("dy", "20");
            labelContainer.style.transformBox = "fill-box";
        }
        
        let label = document.createElementNS("http://www.w3.org/2000/svg", "textPath");
        label.setAttribute("href", "#"+line.id);
        label.setAttribute("text-anchor", "middle");
        label.setAttribute("startOffset", "50%");
        label.innerHTML = line.title;


        labelContainer.appendChild(label);
        return labelContainer;
    }

    private _createPath(line: LineView, dashed: boolean = false, arrowed: boolean = false): SVGPathElement
    {
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("stroke", this.STROKE);
        path.setAttribute("stroke-linejoin", this.STROKE_LINEJOIN);
        path.setAttribute("stroke-linecap", this.STROKE_LINECAP);
        path.setAttribute("stroke-width", this.STROKE_WIDTH);
        path.setAttribute("pointer-events", "stroke");
        path.setAttribute("fill", this.FILL);
        path.id = line.id;
        path.setAttribute("d", this._pointArrayToPathString(this.allPoints));
        if(dashed)
            path.setAttribute("stroke-dasharray", this.STROKE_DASHARRAY);
        if(arrowed)
            path.setAttribute("marker-end", "url(#arrowhead)");
        return path;
    }
    private _create_marker()
    {
        const marker = document.createElementNS("http://www.w3.org/2000/svg", "marker");
        const width = 8;
        const height = 8;
    
        marker.setAttribute("id", "arrowhead");
        marker.setAttribute("viewBox", "-2 -2 20 20");
        marker.setAttribute("refX", "5");
        marker.setAttribute("refY", "5");
        marker.setAttribute("markerUnits", "strokeWidth");
        marker.setAttribute("markerWidth", width.toString());
        marker.setAttribute("markerHeight", height.toString());
        marker.setAttribute("orient", "auto");
        const arrowheadPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        arrowheadPath.setAttribute("stroke-linejoin","round")
        arrowheadPath.setAttribute("stroke-linecap","round")
        arrowheadPath.setAttribute("stroke", "context-stroke");
        arrowheadPath.setAttribute("fill", "context-fill");
        arrowheadPath.setAttribute("stroke-width", this.MARKER_WIDTH);
        arrowheadPath.setAttribute("d", "M 0 0 L 5 5 L 0 10");
            
        marker.appendChild(arrowheadPath);
        return marker;
    }
}


export class DashedLineVisual extends LineVisual
{
    protected override get STROKE_DASHARRAY(): string { return "4,12";}
}

export class DroppedLineVisual extends LineVisual
{
    protected override get ENTRY_DIRECTION(): LineAttachmentAxis { return "y"; }
    protected override get EXIT_DIRECTION(): LineAttachmentAxis { return "y"; }

    constructor(line: LineView, opts: {arrowed: boolean, dashed: boolean})
    {
        super(line, opts);
    }
    protected override _calculateDefaultBendpoints(originElement: View, targetElement: View): Array<BendPoint> {

        let topElement = originElement.position.top < targetElement.position.top? originElement: targetElement;
        let bottomElement = topElement.id == originElement.id ? targetElement : originElement;
        let bottomElementTop = bottomElement.position.top;
        let topElementBottom = topElement.position.top + topElement.dimension.height;
        let deltaY = topElementBottom  - bottomElementTop 

        if(!this.isOverlapping(originElement, targetElement))
        {
            return [
                new BendPoint(
                {
                    x: originElement.center.x,
                    y: topElementBottom + Math.abs(deltaY)/2
                }),
                new BendPoint(
                    {
                        x:targetElement.center.x,
                        y: topElementBottom + Math.abs(deltaY)/2
                    })
            ]; 
        }

        return []
    } 

    protected override _calculateOriginPoint(line: LineView): Point {
        let originPoint: Point = super._calculateOriginPoint(line);
        let narrowerElement = this.narrowerElement(line.originElement, line.targetElement) || line.originElement;

        if(!this.isOverlapping(line.originElement, line.targetElement))
            return originPoint;

        originPoint.x = narrowerElement.center.x;

        return originPoint;
    }

    protected override _calculateTargetPoint(line: LineView): Point {
        let targetPoint:Point = {x: 0, y: 0};

        let narrowerElement = this.narrowerElement(line.originElement, line.targetElement) || line.targetElement;
        
        if(this.isOverlapping(line.originElement, line.targetElement))
            targetPoint.x = narrowerElement.center.x;
        else
            targetPoint.x = line.targetElement.center.x

        let targetIsAbove = line.targetElement.position.top < line.originElement.position.top;
        if(targetIsAbove)
            targetPoint.y = line.targetElement.position.top + line.targetElement.dimension.height;
        else
            targetPoint.y = line.targetElement.position.top

        return targetPoint;
    }

    private isOverlapping(origin: View, target: View):boolean
    {
        let narrowerElement = this.narrowerElement(origin, target) || origin;
        let widerElement = this.widerElement(origin, target) || target;
        return narrowerElement.center.x > widerElement.position.left && narrowerElement.center.x < widerElement.position.left + widerElement.dimension.width
    }

    private widerElement(element1: View, element2: View): View  | undefined
    {
        if(Math.abs(element1.dimension.width - element2.dimension.width) < 10) return;
        return element1.dimension.width > element2.dimension.width? element1: element2;
    }

    private narrowerElement(element1: View, element2: View): View | undefined
    {
        if(Math.abs(element1.dimension.width - element2.dimension.width) < 10) return;
        return element1.dimension.width < element2.dimension.width? element1: element2;
    }
}

export class StraightLineVisual extends LineVisual
{ 

    protected override _calculateDefaultBendpoints(originElement: View, targetElement: View): Array<BendPoint> {
        return []; 
    } 
}