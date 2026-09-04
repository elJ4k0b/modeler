import { log } from "../Log.js";
import { BendPoint } from "./lineview.js";
import * as style from "../Styles.js";
export class Marker {
    constructor() { }
    ;
}
export class LineVisual {
    get EXIT_DIRECTION() { return "closest"; }
    get ENTRY_DIRECTION() { return "closest"; }
    get STROKE() { return "#343A40"; }
    get MARKER_WIDTH() { return "2.5pt"; }
    get STROKE_DASHARRAY() { return "4,12"; }
    get STROKE_LINEJOIN() { return "round"; }
    get STROKE_LINECAP() { return "round"; }
    get STROKE_WIDTH() { return "5pt"; }
    get FILL() { return "none"; }
    get MARKER() { return "string"; }
    get LINE_GAP() { return "40"; }
    get TOUCHAREA_STROKE_WIDTH() { return "60"; }
    get SELECTION_EMPHASIS_COLOR() { return "#CC6666"; }
    get BENDPOINT_FILL() { return "#CC6666"; }
    get BENDPOINT_RADIUS() { return "10pt"; }
    get BENDPOINT_STROKE_COLOR() { return "white"; }
    get BENDPOINT_STROKE_WIDTH() { return "3pt"; }
    constructor(line, opts) {
        this.allPoints = [];
        this.HTMLRepresentation = document.createElementNS("http://www.w3.org/2000/svg", "g");
        let origin = this._calculateOriginPoint(line);
        let target = this._calculateTargetPoint(line);
        let bendpoints = line.bendpoints;
        let hasBendpoints = line.bendpoints.length > 0;
        let originAlignedToTarget = Math.abs(line.originElement.center.y - line.targetElement.center.y) < 10 || Math.abs(line.originElement.center.x - line.targetElement.center.x) < 10;
        this.allPoints.push(origin);
        if (!hasBendpoints && !originAlignedToTarget) {
            let defaultBendpoints = this._calculateDefaultBendpoints(line.originElement, line.targetElement);
            for (let point of defaultBendpoints) {
                bendpoints.push(point);
                //line.addBendpoint(new BendPoint(point));
            }
        }
        this.allPoints.push(...bendpoints);
        this.allPoints.push(target);
        this.allPoints[0] = this._chopEnd(this.allPoints[0], this.allPoints[1]);
        this.allPoints[this.allPoints.length - 1] = this._chopEnd(this.allPoints[this.allPoints.length - 1], this.allPoints[this.allPoints.length - 2]);
        this.pathElement = this._createPath(line, opts === null || opts === void 0 ? void 0 : opts.dashed, opts === null || opts === void 0 ? void 0 : opts.arrowed);
        this.HTMLRepresentation.appendChild(this.pathElement);
        this.label = this._createLabel(line);
        this.HTMLRepresentation.appendChild(this.label);
        if (line.selected) {
            this.pathElement.setAttribute("stroke", this.SELECTION_EMPHASIS_COLOR);
            let pathTouchArea = this._createToucharea(this.pathElement);
            pathTouchArea.classList.add("line");
            this.HTMLRepresentation.appendChild(pathTouchArea);
            for (let bendpoint of line.bendpoints) {
                let bendpointVisual = this._createBendpointVisual(bendpoint);
                this.HTMLRepresentation.appendChild(bendpointVisual);
                let bendpointToucharea = this._createToucharea(bendpointVisual);
                bendpointToucharea.classList.add("bendpoint");
                bendpointToucharea.style.pointerEvents = "all";
                bendpointToucharea.setAttribute("line-id", line.id);
                this.HTMLRepresentation.appendChild(bendpointToucharea);
            }
        }
        else {
            let pathTouchArea = this._createToucharea(this.pathElement);
            pathTouchArea.classList.add("line");
            this.HTMLRepresentation.appendChild(pathTouchArea);
        }
        if (opts === null || opts === void 0 ? void 0 : opts.arrowed) {
            let arrowMarker = this._create_marker(line.selected);
            this.HTMLRepresentation.appendChild(arrowMarker);
        }
    }
    ;
    _calculateOriginPoint(line) {
        let originElementCenter = {
            x: line.originElement.position.left + line.originElement.dimension.width / 2,
            y: line.originElement.position.top + line.originElement.dimension.height / 2,
        };
        let firstBendpoint = line.bendpoints[0] || line.targetElement.center;
        let delta = {
            x: originElementCenter.x - firstBendpoint.x,
            y: originElementCenter.y - firstBendpoint.y,
        };
        let exitPoint = { x: 0, y: 0 };
        let exitXAxis = this.EXIT_DIRECTION == "x" || (this.EXIT_DIRECTION == "closest" && Math.abs(delta.y) < 10); //Math.abs(delta.x) > Math.abs(delta.y))
        if (exitXAxis) {
            exitPoint.y = originElementCenter.y;
            let bendpointIsRight = delta.x < 0 && Math.abs(delta.x) > 10;
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
                exitPoint.y = line.originElement.position.top;
        }
        //return this._chopEnd(exitPoint, {x:firstBendpoint.x, y: firstBendpoint.y});
        return exitPoint;
    }
    _calculateTargetPoint(line) {
        let targetElementCenter = {
            x: line.targetElement.position.left + line.targetElement.dimension.width / 2,
            y: line.targetElement.position.top + line.targetElement.dimension.height / 2,
        };
        let lastBendpoint = line.bendpoints[line.bendpoints.length - 1] || line.originElement.center;
        let delta = {
            x: lastBendpoint.x - targetElementCenter.x,
            y: lastBendpoint.y - targetElementCenter.y,
        };
        let entryPoint = { x: 0, y: 0 };
        let entryXAxis = this.ENTRY_DIRECTION == "x" || (this.ENTRY_DIRECTION == "closest" && Math.abs(delta.x) > 10); //Math.abs(delta.x) > Math.abs(delta.y)) 
        if (entryXAxis) {
            entryPoint.y = targetElementCenter.y;
            let bendpointIsLeft = delta.x < 0;
            if (bendpointIsLeft)
                entryPoint.x = line.targetElement.position.left;
            else
                entryPoint.x = line.targetElement.position.left + line.targetElement.dimension.width;
        }
        else {
            entryPoint.x = targetElementCenter.x;
            let bendpointIsAbove = delta.y < 0 && Math.abs(delta.y) > 10;
            if (bendpointIsAbove)
                entryPoint.y = line.targetElement.position.top;
            else
                entryPoint.y = line.targetElement.position.top + line.targetElement.dimension.height;
        }
        //return this._chopEnd(lastBendpoint, entryPoint);
        return entryPoint;
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
    _calculateDefaultBendpoints(originElement, targetElement) {
        return [new BendPoint({
                x: originElement.position.left + originElement.dimension.width / 2,
                y: targetElement.position.top + targetElement.dimension.height / 2
            })];
    }
    _pointArrayToPathString(points) {
        if (points.length <= 0) {
            log("Converting empty pointlist to empty string", "warning", { file: "linevisual", method: "_pointArrayToPathString" });
            return "";
        }
        let pathString = `M ${points[0].x} ${points[0].y}`;
        for (let i = 1; i < points.length; i++) {
            pathString += `L ${points[i].x} ${points[i].y}`;
        }
        return pathString;
    }
    _createToucharea(parent) {
        try {
            let toucharea = parent.cloneNode(true);
            toucharea.setAttribute("stroke", "transparent");
            toucharea.setAttribute("stroke-width", this.TOUCHAREA_STROKE_WIDTH);
            toucharea.setAttribute("fill", "transparent");
            toucharea.classList.add("toucharea");
            toucharea.style.pointerEvents = "stroke";
            toucharea.id = parent.id;
            return toucharea;
        }
        catch (error) {
            log("failed to create Toucharea", "error", { file: "linevisual.ts", method: "_createToucharea" });
            let emptyArea = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            return emptyArea;
        }
    }
    _createBendpointVisual(bendpoint) {
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
    _distance(point1, point2) {
        let distance = { x: 0, y: 0 };
        distance.x = Math.abs(point1.x - point2.x);
        distance.y = Math.abs(point1.y - point2.y);
        return Math.sqrt(Math.pow(distance.x, 2) + Math.pow(distance.y, 2));
    }
    _createLabel(line) {
        let labelContainer = document.createElementNS("http://www.w3.org/2000/svg", "text");
        labelContainer.setAttribute("dy", "-20");
        if (line.originElement.center.x > line.targetElement.center.x) {
            labelContainer.setAttribute("transform", "scale(-1,-1)");
            labelContainer.setAttribute("transform-origin", "center center");
            labelContainer.setAttribute("dy", "20");
            labelContainer.style.transformBox = "fill-box";
        }
        let label = document.createElementNS("http://www.w3.org/2000/svg", "textPath");
        label.setAttribute("href", "#" + line.id);
        label.setAttribute("text-anchor", "middle");
        label.setAttribute("startOffset", "50%");
        label.innerHTML = line.title;
        labelContainer.appendChild(label);
        return labelContainer;
    }
    _createPath(line, dashed = false, arrowed = false) {
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("stroke", this.STROKE);
        path.setAttribute("stroke-linejoin", this.STROKE_LINEJOIN);
        path.setAttribute("stroke-linecap", this.STROKE_LINECAP);
        path.setAttribute("stroke-width", this.STROKE_WIDTH);
        path.setAttribute("pointer-events", "stroke");
        path.setAttribute("fill", this.FILL);
        path.id = line.id;
        path.setAttribute("d", this._pointArrayToPathString(this.allPoints));
        if (dashed)
            path.setAttribute("stroke-dasharray", this.STROKE_DASHARRAY);
        if (arrowed)
            path.setAttribute("marker-end", "url(#arrowhead)");
        return path;
    }
    _create_marker(markerTargetIsSelected) {
        const marker = document.createElementNS("http://www.w3.org/2000/svg", "marker");
        const width = 8;
        const height = 8;
        marker.setAttribute("id", "arrowhead");
        marker.setAttribute("viewBox", "-2 -2 20 20");
        marker.setAttribute("refX", "5");
        marker.setAttribute("refY", "5");
        marker.setAttribute("markerUnits", "userSpaceOnUse");
        marker.setAttribute("markerWidth", this.TOUCHAREA_STROKE_WIDTH);
        marker.setAttribute("markerHeight", this.TOUCHAREA_STROKE_WIDTH);
        marker.setAttribute("orient", "auto");
        const arrowheadPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        arrowheadPath.setAttribute("stroke-linejoin", "round");
        arrowheadPath.setAttribute("stroke-linecap", "round");
        const strokeColor = markerTargetIsSelected ? this.SELECTION_EMPHASIS_COLOR : "black";
        arrowheadPath.setAttribute("stroke", strokeColor);
        arrowheadPath.setAttribute("fill", "none");
        arrowheadPath.setAttribute("stroke-width", style.MARKER_WIDTH);
        arrowheadPath.setAttribute("d", "M 0 0 L 5 5 L 0 10");
        marker.appendChild(arrowheadPath);
        return marker;
    }
}
export class DashedLineVisual extends LineVisual {
    get STROKE_DASHARRAY() { return "4,12"; }
}
export class DroppedLineVisual extends LineVisual {
    get ENTRY_DIRECTION() { return "y"; }
    get EXIT_DIRECTION() { return "y"; }
    constructor(line, opts) {
        super(line, opts);
    }
    _calculateDefaultBendpoints(originElement, targetElement) {
        let topElement = originElement.position.top < targetElement.position.top ? originElement : targetElement;
        let bottomElement = topElement.id == originElement.id ? targetElement : originElement;
        let bottomElementTop = bottomElement.position.top;
        let topElementBottom = topElement.position.top + topElement.dimension.height;
        let deltaY = topElementBottom - bottomElementTop;
        if (!this.isOverlapping(originElement, targetElement)) {
            return [
                new BendPoint({
                    x: originElement.center.x,
                    y: topElementBottom + Math.abs(deltaY) / 2
                }),
                new BendPoint({
                    x: targetElement.center.x,
                    y: topElementBottom + Math.abs(deltaY) / 2
                })
            ];
        }
        return [];
    }
    _calculateOriginPoint(line) {
        let originPoint = super._calculateOriginPoint(line);
        let narrowerElement = this.narrowerElement(line.originElement, line.targetElement) || line.originElement;
        if (!this.isOverlapping(line.originElement, line.targetElement))
            return originPoint;
        originPoint.x = narrowerElement.center.x;
        return originPoint;
    }
    _calculateTargetPoint(line) {
        let targetPoint = { x: 0, y: 0 };
        let narrowerElement = this.narrowerElement(line.originElement, line.targetElement) || line.targetElement;
        if (this.isOverlapping(line.originElement, line.targetElement))
            targetPoint.x = narrowerElement.center.x;
        else
            targetPoint.x = line.targetElement.center.x;
        let targetIsAbove = line.targetElement.position.top < line.originElement.position.top;
        if (targetIsAbove)
            targetPoint.y = line.targetElement.position.top + line.targetElement.dimension.height;
        else
            targetPoint.y = line.targetElement.position.top;
        return targetPoint;
    }
    isOverlapping(origin, target) {
        let narrowerElement = this.narrowerElement(origin, target) || origin;
        let widerElement = this.widerElement(origin, target) || target;
        return narrowerElement.center.x > widerElement.position.left && narrowerElement.center.x < widerElement.position.left + widerElement.dimension.width;
    }
    widerElement(element1, element2) {
        if (Math.abs(element1.dimension.width - element2.dimension.width) < 10)
            return;
        return element1.dimension.width > element2.dimension.width ? element1 : element2;
    }
    narrowerElement(element1, element2) {
        if (Math.abs(element1.dimension.width - element2.dimension.width) < 10)
            return;
        return element1.dimension.width < element2.dimension.width ? element1 : element2;
    }
}
export class StraightLineVisual extends LineVisual {
    _calculateDefaultBendpoints(originElement, targetElement) {
        return [];
    }
}
