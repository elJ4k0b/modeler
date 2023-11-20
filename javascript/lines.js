import { typeMap } from "./Types.js";
import * as style from "./styles.js"

let arrow_types = {
    "line": "line",
    "line-dashed": "line-dashed",
    "line-arrowed": "line-arrowed",
    "line-dashed-arrowed": "line-dashed-arrowed",
}


function _create_marker()
{
    const marker = document.createElementNS("http://www.w3.org/2000/svg", "marker");
        const width = 8;
        const height = 8;

        marker.setAttribute("id", "arrowhead");
        marker.setAttribute("viewBox", "-2 -2 20 20");
        marker.setAttribute("refX", 5);
        marker.setAttribute("refY", 5);
        marker.setAttribute("markerUnits", "strokeWidth");
        marker.setAttribute("markerWidth", width);
        marker.setAttribute("markerHeight", height);
        marker.setAttribute("orient", "auto");
        const arrowheadPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        arrowheadPath.setAttribute("stroke-linejoin","round")
        arrowheadPath.setAttribute("stroke-linecap","round")
        arrowheadPath.setAttribute("stroke", style.RELATION_COLOR);
        arrowheadPath.setAttribute("fill", "none");
        arrowheadPath.setAttribute("stroke-width", style.MARKER_WIDTH);
        arrowheadPath.setAttribute("d", "M 0 0 L 5 5 L 0 10");
           
        marker.appendChild(arrowheadPath);
        return marker;
}

function _create_path(type)
{
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("stroke", style.RELATION_COLOR);
    if(type.includes("-dashed"))
        path.setAttribute("stroke-dasharray", "4,12");
    path.setAttribute("stroke-linejoin", "round");
    path.setAttribute("stroke-linecap", "round");
    path.setAttribute("stroke-width", "5pt");
    path.setAttribute("fill", "none");
    if(type.includes("-arrowed"))
        path.setAttribute("marker-end", "url(#arrowhead)");
    return path;
}



function _distance(point1, point2)
{
    let distance = {};
    distance.x = Math.abs(point1.x - point2.x);
    distance.y = Math.abs(point1.y - point2.y);
    return Math.sqrt(Math.pow(distance.x, 2) + Math.pow(distance.y, 2));
}

/**
 * 
 * @param {Object} startpoint 
 * @param {Object} endpoint 
 * @param {Array} bendpoints 
 */
export function drawline_at(line, startpoint, endpoint, bendpoints = [])
{
    const svg = document.getElementById("lines");
    let has_marker = document.querySelector("#arrowhead") != null;
    if (!has_marker)svg.appendChild(_create_marker());
    let all_points = [startpoint];
    bendpoints.sort((a,b) => _distance(startpoint, a) - _distance(startpoint, b));
    //NUR NOCH FÜR DAS TESTEN!!!!
    if(startpoint.y != endpoint.y && startpoint.x != endpoint.x) all_points.push({x:startpoint.x, y: endpoint.y});
    all_points.push(...bendpoints);
    all_points.push(endpoint);
    
    //chop ends of
    let current_start = all_points[0];
    let direction = {};
    direction.x = current_start.x - all_points[1].x;
    direction.y = current_start.y - all_points[1].y;

    let new_start = {};
    new_start.x = all_points[1].x + direction.x - Math.sign(direction.x) * style.LINE_GAP;
    new_start.y = all_points[1].y + direction.y - Math.sign(direction.y) * style.LINE_GAP;
    all_points[0] = new_start;
    
    let current_end = all_points[all_points.length-1];
    direction.x = current_end.x - all_points[all_points.length-2].x;
    direction.y = current_end.y - all_points[all_points.length-2].y;

    let new_end = {};
    new_end.x = all_points[all_points.length-2].x + direction.x - Math.sign(direction.x) * style.LINE_GAP;
    new_end.y = all_points[all_points.length-2].y + direction.y - Math.sign(direction.y) * style.LINE_GAP;
    all_points[all_points.length-1] = new_end;
    
    let pathData = `M ${all_points[0].x} ${all_points[0].y}`;

    for(let i = 1; i < all_points.length; i++)
    {
        pathData += `L ${all_points[i].x} ${all_points[i].y}`
    }
    let lineType = typeMap.get(line.typeId) || "";
    let type = arrow_types[lineType.lineStyle] || "";
    let path = _create_path(type);
    path.setAttribute("d", pathData);
    svg.appendChild(path);
    svg.innerHTML +="";
}