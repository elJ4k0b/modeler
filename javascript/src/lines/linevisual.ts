import { diagview } from "../diagramview";
import { log } from "../Log";
import { View } from "../view";
import LineView, { BendPoint } from "./lineview";

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

export abstract class LineVisual
{
    protected readonly EXIT_DIRECTION: LineAttachmentAxis = "closest";
    protected readonly ENTRY_DIRECTION: LineAttachmentAxis = "closest";
    protected readonly STROKE: string = "#343A40";
    protected readonly STROKE_DASHARRAY: string = "";
    protected readonly STROKE_LINEJOIN: string = "round";
    protected readonly STROKE_LINECAP: string = "round";
    protected readonly STROKE_WIDTH: string = "5pt";
    protected readonly FILL: string =  "none";
    protected readonly MARKER: string = "string";
    protected readonly LINE_GAP: string = "40";
    protected allPoints: Array<Point> = [];

    public HTMLRepresentation: SVGElement;
    public label: SVGElement;

    constructor(line: LineView) 
    {
        this.HTMLRepresentation = document.createElementNS("http://www.w3.org/2000/svg", "g");

        let origin = this._calculateOriginPoint(line);
        let target = this._calculateTargetPoint(line);
        let bendpoints = line.bendpoints
        
        let hasBendpoints = line.bendpoints.length > 0;
        let originAlignedToTarget = origin.y == target.y || origin.x == target.x;

        if(!hasBendpoints && !originAlignedToTarget)
        {
            let defaultBendpoint = this._calculateDefaultBendpoint(origin, target);
            bendpoints.push(defaultBendpoint);
            line.addBendpoint(new BendPoint(defaultBendpoint));
        }

        this.HTMLRepresentation.appendChild(this.add)
    
        this.label = this._createLabel(line);

        if(line.selected)
             this.HTMLRepresentation.appendChild(this._addSelectionVisual());

    };

    private _calculateOriginPoint(line: LineView): Point
    {
        let originElementCenter = {
            x: line.originElement.position.left + line.originElement.dimension.width/2,
            y: line.originElement.position.top + line.originElement.dimension.height/2,
        };

        let firstBendpoint = line.bendpoints[0];

        let delta:Point = {
            x: originElementCenter.x - firstBendpoint.x,
            y: originElementCenter.y - firstBendpoint.y
        }

        
        let exitPoint = {x: 0, y: 0}
        let exitXAxis = this.EXIT_DIRECTION == "x" || this.EXIT_DIRECTION == "closest" && Math.abs(delta.x) > Math.abs(delta.y) 
        
        if(exitXAxis)
        {   
            exitPoint.y = originElementCenter.y

            let bendpointIsRight = delta.x < 0
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
                exitPoint.x = line.originElement.position.top            
        }

        return this._chopEnd(exitPoint, firstBendpoint);
        
    }


    private _calculateTargetPoint(line: LineView): Point
    {
        
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


    private _calculateDefaultBendpoint(origin: Point, target:Point)
    {
        return new BendPoint({x:origin.x, y: target.y});
    }
    private _addSelectionVisual()
    {

    };
    
    private _distance(point1: Point, point2: Point)
    {
        let distance:Point = {x: 0, y: 0};
        distance.x = Math.abs(point1.x - point2.x);
        distance.y = Math.abs(point1.y - point2.y);
        return Math.sqrt(Math.pow(distance.x, 2) + Math.pow(distance.y, 2));
    }

    private _createLabel(line: LineView): SVGTextPathElement
    {
        let label = document.createElementNS("http://www.w3.org/2000/svg", "textPath");
        label.setAttribute("href", "#"+line.id);
        label.setAttribute("text-anchor", "middle");
        label.setAttribute("startOffset", "50%");
        label.innerHTML = line.title;
        return label;
    }

    private _createPath()
    {
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("stroke", style.RELATION_COLOR);
    if(type.includes("-dashed"))
        path.setAttribute("stroke-dasharray", "4,12");
    path.setAttribute("stroke-linejoin", "round");
    path.setAttribute("stroke-linecap", "round");
    path.setAttribute("stroke-width", style.RELATION_WIDTH);
    path.setAttribute("pointer-events", "stroke");
    path.setAttribute("fill", "none");
    if(type.includes("-arrowed"))
        path.setAttribute("marker-end", "url(#arrowhead)");
    }
}

export class DashedLineVisual extends LineVisual
{
    protected override readonly STROKE_DASHARRAY: string = "4,12";
}

export class DroppedLineVisual extends LineVisual
{
    protected override readonly STROKE_DASHARRAY: string = "4,12";
    protected override readonly ENTRY_DIRECTION: LineAttachmentAxis = "y"; 
    protected override readonly EXIT_DIRECTION: LineAttachmentAxis = "y"; 
}