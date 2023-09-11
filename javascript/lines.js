const STANDARD_STYLE = {
    stroke: "8",
    color: "#332E33",// blue: "#295FF4"
}


export function drawline_at(x1, y1, x2, y2, style = STANDARD_STYLE)
{
    x1 = parseInt(x1);
    y1 = parseInt(y1);
    x2 = parseInt(x2);
    y2 = parseInt(y2);
    const svg = document.getElementById("svg");
    let marker = document.querySelector("#arrowhead");

    if(marker == null)
    {
        const marker = document.createElementNS("http://www.w3.org/2000/svg", "marker");
        const width = 8;
        const height = 8;

        marker.setAttribute("id", "arrowhead");
        marker.setAttribute("viewBox", "-2 -2 20 20");
        marker.setAttribute("refX", 10);
        marker.setAttribute("refY", 5);
        marker.setAttribute("markerUnits", "strokeWidth");
        marker.setAttribute("markerWidth", width);
        marker.setAttribute("markerHeight", height);
        marker.setAttribute("orient", "auto");
        const arrowheadPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        arrowheadPath.setAttribute("stroke-linejoin","round")
        arrowheadPath.setAttribute("stroke-linecap","round")
        arrowheadPath.setAttribute("stroke", style.color);
        arrowheadPath.setAttribute("fill", "none");
        arrowheadPath.setAttribute("stroke-width", "3");
        arrowheadPath.setAttribute("d", "M 0 0 L 10 5 L 0 10");
        
        
        marker.appendChild(arrowheadPath);
        svg.appendChild(marker);
    }

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("stroke", style.color);
    path.setAttribute("stroke-dasharray", "4,12");
    path.setAttribute("stroke-linejoin", "round");
    path.setAttribute("stroke-linecap", "round");
    path.setAttribute("stroke-width", style.stroke);
    path.setAttribute("fill", "none");
    path.setAttribute("marker-end", "url(#arrowhead)");
    
    const deltaX = Math.abs(x2 - x1);
    const deltaY = Math.abs(y2 - y1);
    const directionX = x1 < x2 ? 1 : -1;
    const directionY = y1 < y2 ? 1 : -1;
    let pathData;
    if (deltaX > deltaY) {
        pathData = `M ${x1} ${y1} L ${x1} ${y2} L ${x2} ${y2}`;
    }
    else if(deltaX == 0)
    {
        pathData = `M ${x1} ${y1} L ${x2-directionX} ${y2}`;
    }
    else 
    {
        //pathData = `M ${x1} ${y1} L ${x1} ${y2 - directionY * 10} L ${x2} ${y2 - directionY * 10}`;
        pathData = `M ${x1} ${y1} L ${x1} ${y2} L ${x2} ${y2}`;
    }
    //pathData = `M ${x1} ${y1} L ${x1} ${y2} L ${x2} ${y2}`;
    path.setAttribute("d", pathData);
    svg.appendChild(path);
    svg.innerHTML +="";
}