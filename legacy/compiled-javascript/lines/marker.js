import { BendPoint } from "./lineview";
export class Marker {
    constructor() { }
    ;
}
export class LineVisual {
    constructor(line) {
        this.EXIT_DIRECTION = "closest";
        this.ENTRY_DIRECTION = "closest";
        this.STROKE = "#343A40";
        this.STROKE_DASHARRAY = "";
        this.STROKE_LINEJOIN = "round";
        this.STROKE_LINECAP = "round";
        this.STROKE_WIDTH = "5pt";
        this.FILL = "none";
        this.MARKER = "string";
        this.LINE_GAP = "40";
        this.allPoints = [];
        this.HTMLRepresentation = document.createElementNS("http://www.w3.org/2000/svg", "g");
        let origin = this._calculateOriginPoint(line);
        let target = this._calculateTargetPoint(line);
        let bendpoints = line.bendpoints;
        let hasBendpoints = line.bendpoints.length > 0;
        let originAlignedToTarget = origin.y == target.y || origin.x == target.x;
        if (!hasBendpoints && !originAlignedToTarget) {
            let defaultBendpoint = this._calculateDefaultBendpoint(origin, target);
            bendpoints.push(defaultBendpoint);
            line.addBendpoint(new BendPoint(defaultBendpoint));
        }
        this.HTMLRepresentation.appendChild(this.add);
        this.label = this._createLabel(line);
        if (line.selected)
            this.HTMLRepresentation.appendChild(this._addSelectionVisual());
    }
    ;
    _calculateOriginPoint(line) {
        let originElementCenter = {
            x: line.originElement.position.left + line.originElement.dimension.width / 2,
            y: line.originElement.position.top + line.originElement.dimension.height / 2,
        };
        let firstBendpoint = line.bendpoints[0];
        let delta = {
            x: originElementCenter.x - firstBendpoint.x,
            y: originElementCenter.y - firstBendpoint.y
        };
        let exitPoint = { x: 0, y: 0 };
        let exitXAxis = this.EXIT_DIRECTION == "x" || this.EXIT_DIRECTION == "closest" && Math.abs(delta.x) > Math.abs(delta.y);
        if (exitXAxis) {
            exitPoint.y = originElementCenter.y;
            let bendpointIsRight = delta.x < 0;
            if (bendpointIsRight)
                exitPoint.x = line.originElement.position.left + line.originElement.dimension.width;
            else
                exitPoint.x = line.originElement.position.left;
        }
        else {
            exitPoint.x = originElementCenter.x;
            let bendpointIsBelow = delta.y < 0;
            if (bendpointIsBelow)
                exitPoint.y = line.originElement.position.top + line.originElement.dimension.height;
            else
                exitPoint.x = line.originElement.position.top;
        }
        return this._chopEnd(exitPoint, firstBendpoint);
    }
    _calculateTargetPoint(line) {
    }
    _chopEnd(point1, point2) {
        let direction = { x: 0, y: 0 };
        direction.x = point1.x - point2.x;
        direction.y = point1.y - point2.y;
        let newEndPoint = { x: 0, y: 0 };
        newEndPoint.x = point2.x + direction.x - Math.sign(direction.x) * 40;
        newEndPoint.y = point2.y + direction.y - Math.sign(direction.y) * 40;
        return newEndPoint;
    }
    _calculateDefaultBendpoint(origin, target) {
        return new BendPoint({ x: origin.x, y: target.y });
    }
    _addSelectionVisual() {
    }
    ;
    _distance(point1, point2) {
        let distance = { x: 0, y: 0 };
        distance.x = Math.abs(point1.x - point2.x);
        distance.y = Math.abs(point1.y - point2.y);
        return Math.sqrt(Math.pow(distance.x, 2) + Math.pow(distance.y, 2));
    }
    _createLabel(line) {
        let label = document.createElementNS("http://www.w3.org/2000/svg", "textPath");
        label.setAttribute("href", "#" + line.id);
        label.setAttribute("text-anchor", "middle");
        label.setAttribute("startOffset", "50%");
        label.innerHTML = line.title;
        return label;
    }
    _createPath() {
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("stroke", style.RELATION_COLOR);
        if (type.includes("-dashed"))
            path.setAttribute("stroke-dasharray", "4,12");
        path.setAttribute("stroke-linejoin", "round");
        path.setAttribute("stroke-linecap", "round");
        path.setAttribute("stroke-width", style.RELATION_WIDTH);
        path.setAttribute("pointer-events", "stroke");
        path.setAttribute("fill", "none");
        if (type.includes("-arrowed"))
            path.setAttribute("marker-end", "url(#arrowhead)");
    }
}
export class DashedLineVisual extends LineVisual {
    constructor() {
        super(...arguments);
        this.STROKE_DASHARRAY = "4,12";
    }
}
export class DroppedLineVisual extends LineVisual {
    constructor() {
        super(...arguments);
        this.STROKE_DASHARRAY = "4,12";
        this.ENTRY_DIRECTION = "y";
        this.EXIT_DIRECTION = "y";
    }
}
