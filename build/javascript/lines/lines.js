import { log } from "../core/log.js";
import { typeMap } from "../core/types.js";
import * as style from "../core/styles.js";
import { BendPoint } from "./line-view.js";
let arrow_types = {
    "line": "line",
    "line-dashed": "line-dashed",
    "line-arrowed": "line-arrowed",
    "line-straight": "line-straight",
    "line-dashed-arrowed": "line-dashed-arrowed",
    "line-dropped-arrowed": "line-dropped-arrowed",
    "line-straight-arrowed": "line-straight-arrowed",
};
export function create_start_marker() {
    const marker = document.createElementNS("http://www.w3.org/2000/svg", "marker");
    const width = 8;
    const height = 8;
    marker.setAttribute("id", "start");
    marker.setAttribute("viewBox", "-2 -2 20 20");
    marker.setAttribute("refX", width.toString());
    marker.setAttribute("refY", height.toString());
    marker.setAttribute("markerUnits", "strokeWidth");
    marker.setAttribute("markerWidth", width.toString());
    marker.setAttribute("markerHeight", height.toString());
    marker.setAttribute("orient", "0");
    let container = document.createElementNS("http://www.w3.org/2000/svg", "g");
    container.setAttribute("width", "32");
    container.setAttribute("height", "32");
    container.setAttribute("fill", style.START_MARKER_FILL);
    container.setAttribute("viewbox", "0 0 16 16");
    let path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", "M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z");
    container.appendChild(path);
    return container;
    //'<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="%231f6aff" class="bi bi-geo-alt-fill" viewBox="0 0 16 16"><path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/><svg>'
}
function _create_marker(markerTargetIsSelected) {
    const marker = document.createElementNS("http://www.w3.org/2000/svg", "marker");
    const width = 8;
    const height = 8;
    marker.setAttribute("id", "arrowhead");
    marker.setAttribute("viewBox", "-2 -2 20 20");
    marker.setAttribute("refX", "5");
    marker.setAttribute("refY", "5");
    marker.setAttribute("markerUnits", "useSpaceOnUse");
    marker.setAttribute("markerWidth", style.RELATION_WIDTH);
    marker.setAttribute("markerHeight", style.RELATION_WIDTH);
    marker.setAttribute("orient", "auto");
    const arrowheadPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    arrowheadPath.setAttribute("stroke-linejoin", "round");
    arrowheadPath.setAttribute("stroke-linecap", "round");
    const arrowheadPathColor = markerTargetIsSelected ? style.OVERLAY_COLOR : style.RELATION_COLOR;
    arrowheadPath.setAttribute("stroke", arrowheadPathColor);
    arrowheadPath.setAttribute("fill", arrowheadPathColor);
    arrowheadPath.setAttribute("stroke-width", style.MARKER_WIDTH);
    arrowheadPath.setAttribute("d", "M 0 0 L 5 5 L 0 10");
    marker.appendChild(arrowheadPath);
    return marker;
}
function _create_path(type) {
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
    return path;
}
function _distance(point1, point2) {
    let distance = { x: 0, y: 0 };
    distance.x = Math.abs(point1.x - point2.x);
    distance.y = Math.abs(point1.y - point2.y);
    return Math.sqrt(Math.pow(distance.x, 2) + Math.pow(distance.y, 2));
}
export function drawline_at(line, startpoint, endpoint, bendpoints = []) {
    const svg = document.getElementById("lines");
    if (!svg) {
        log("SVG element with id 'lines' does not exist but necessary to contain connections", "error");
        return document.createElementNS("http://www.w3.org/2000/svg", "path");
    }
    let has_marker = document.querySelector("#arrowhead") != null;
    if (!has_marker)
        svg.appendChild(_create_marker(line.selected));
    let lineType = typeMap.get(line.typeId);
    let type = lineType ? arrow_types[lineType.lineStyle] : "line";
    let path = _create_path(type);
    let all_points = [];
    bendpoints.sort((a, b) => _distance(endpoint, b) - _distance(endpoint, a));
    all_points.push(startpoint);
    all_points.push(...bendpoints);
    all_points.push(endpoint);
    all_points[0] = calculateStartPosition(all_points);
    all_points[all_points.length - 1] = calculateEndPosition(all_points, type == "line-dropped-arrowed");
    if (all_points.length == 2 && Math.abs(startpoint.y - endpoint.y) > 10 && Math.abs(startpoint.x - endpoint.x) > 10 && !type.includes('straight')) {
        if (!type.includes('dropped')) {
            console.log("wow");
            let deltaY = Math.abs(all_points[0].y - all_points[1].y);
            let higherPoint = all_points[0].y < all_points[1].y ? all_points[0] : all_points[1];
            all_points[0] = { x: startpoint.x, y: higherPoint.y };
            line.addBendpoint(new BendPoint({ x: all_points[0].x, y: higherPoint.y + deltaY / 2 }));
            all_points.splice(1, 0, { x: all_points[0].x, y: higherPoint.y + deltaY / 2 });
            line.addBendpoint(new BendPoint({ x: all_points[1].x, y: higherPoint.y + deltaY / 2 }));
            all_points.splice(2, 0, { x: all_points[2].x, y: higherPoint.y + deltaY / 2 });
        }
        else {
            console.log("wow2");
            line.addBendpoint(new BendPoint({ x: all_points[0].x, y: all_points[1].y }));
            all_points.splice(1, 0, { x: all_points[0].x, y: all_points[1].y });
        }
    }
    //chop ends of
    let current_start = all_points[0];
    let direction = { x: 0, y: 0 };
    direction.x = current_start.x - all_points[1].x;
    direction.y = current_start.y - all_points[1].y;
    let new_start = { x: 0, y: 0 };
    new_start.x = all_points[1].x + direction.x - Math.sign(direction.x) * parseFloat(style.LINE_GAP);
    new_start.y = all_points[1].y + direction.y - Math.sign(direction.y) * parseFloat(style.LINE_GAP);
    all_points[0] = new_start;
    let current_end = all_points[all_points.length - 1];
    direction.x = current_end.x - all_points[all_points.length - 2].x;
    direction.y = current_end.y - all_points[all_points.length - 2].y;
    let new_end = { x: 0, y: 0 };
    new_end.x = all_points[all_points.length - 2].x + direction.x - Math.sign(direction.x) * parseFloat(style.LINE_GAP);
    new_end.y = all_points[all_points.length - 2].y + direction.y - Math.sign(direction.y) * parseFloat(style.LINE_GAP);
    all_points[all_points.length - 1] = new_end;
    line.update(all_points);
    let pathData = `M ${all_points[0].x} ${all_points[0].y}`;
    for (let i = 1; i < all_points.length; i++) {
        pathData += `L ${all_points[i].x} ${all_points[i].y}`;
    }
    path.id = line.id;
    if (line.selected)
        path.setAttribute("stroke", style.OVERLAY_COLOR);
    let group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    group.appendChild(path);
    if (line.selected) {
        let toucharea = _create_path(type);
        toucharea.setAttribute("d", pathData);
        toucharea.setAttribute("stroke-width", "50pt");
        toucharea.setAttribute("stroke", "transparent");
        toucharea.classList.add("line");
        toucharea.id = line.id;
        toucharea.addEventListener("click", () => console.warn("toucharea"));
        group.appendChild(toucharea);
        for (let point of bendpoints) {
            const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            circle.setAttribute("cx", (point.x).toString());
            circle.setAttribute("cy", (point.y).toString());
            circle.setAttribute("r", style.BENDPOINT_RADIUS); // Größe des Kreises
            circle.setAttribute("fill", style.BENDPOINT_COLOR);
            circle.setAttribute("stroke", "white");
            circle.setAttribute("stroke-width", style.BORDER_WIDTH);
            const toucharea = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            toucharea.setAttribute("cx", (point.x).toString());
            toucharea.setAttribute("cy", (point.y).toString());
            toucharea.setAttribute("r", "20pt"); // Größe des Kreises
            toucharea.setAttribute("fill", "transparent");
            toucharea.setAttribute("stroke-width", style.BORDER_WIDTH);
            toucharea.setAttribute("line-id", line.id);
            toucharea.classList.add("bendpoint");
            toucharea.classList.add("toucharea");
            toucharea.style.pointerEvents = "all";
            toucharea.id = point.id;
            group.appendChild(circle);
            group.appendChild(toucharea);
        }
    }
    path.setAttribute("d", pathData);
    svg.appendChild(group);
    // path.classList.add("line");
    // svg.appendChild(path);
    svg.innerHTML += "";
    return path;
}
function calculateStartPosition(all_points) {
    return calculatePositions(all_points[0], all_points[1]);
}
function calculateEndPosition(all_points, dropped) {
    let endIndex = all_points.length - 1;
    let before_point = all_points[endIndex - 1];
    let end_point = all_points[endIndex];
    let deltaX = before_point.x - end_point.x;
    let deltaY = before_point.y - end_point.y;
    //Pfeil kommt immer links oder rechts an 
    //SONDERFALL: gleiche x-koordinate ODER line-type ist dropped
    if (Math.abs(deltaX) <= style.ELEMENT_WIDTH / 2) {
        end_point.x = end_point.x + style.ELEMENT_WIDTH / 2;
        if (deltaY < 0) {
            end_point.y = end_point.y;
        }
        else {
            end_point.y = end_point.y + style.ELEMENT_HEIGHT;
        }
    }
    else if (deltaX < 0) {
        end_point.x = end_point.x;
        end_point.y = end_point.y + style.ELEMENT_HEIGHT / 2;
    }
    else {
        end_point.x = end_point.x + style.ELEMENT_WIDTH;
        end_point.y = end_point.y + style.ELEMENT_HEIGHT / 2;
    }
    return end_point;
}
function calculatePositions(point1, point2) {
    let start_point = point1;
    let second_point = point2;
    if (!second_point || !start_point) {
        log("Cant calculate line positions for empty start or empty endpoint", "error", { file: "lines.ts", line: 261, method: "calculatePositions" });
    }
    let deltaX = start_point.x - second_point.x;
    let deltaY = start_point.y - second_point.y;
    if (Math.abs(deltaY) <= style.ELEMENT_HEIGHT / 2) {
        start_point.y = start_point.y + style.ELEMENT_HEIGHT / 2;
        if (deltaX < 0) {
            start_point.x = start_point.x + style.ELEMENT_WIDTH;
        }
        else {
            start_point.x = start_point.x;
        }
    }
    else if (deltaY < 0) {
        start_point.y = start_point.y + style.ELEMENT_HEIGHT;
        start_point.x = start_point.x + style.ELEMENT_WIDTH / 2;
    }
    else {
        start_point.y = start_point.y;
        start_point.x = start_point.x + style.ELEMENT_WIDTH / 2;
    }
    return { x: start_point.x, y: start_point.y };
}
