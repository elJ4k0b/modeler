import { diagview } from "./diagramview.js";
import { create_start_marker, drawline_at } from "./lines.js";
import { grid_size, size } from "./grid.js";
import zoomHandler from "./Zoom.js";
import * as style from "./styles.js"
import { typeMap } from "./Types.js";
import { log } from "./Log.js";

let debug = true;

const CANVAS_WIDTH = 100000;

/**
 * 
 * @param {HTMLElement} container 
 * @param {HTMLElement} div 
 * @returns 
 */
export function toggel_debuginfo()
{
    debug = !debug;
}

function draw_container(container, div = document.createElement("div"))
{
    div.classList.add("draggable");
    div.classList.add("card");
    div.classList.add("container");
    div.classList.add("shadow-medium");
    div.classList.add("transition-move");
    

    div.id = container.id;
    div.style.position = "absolute";
    let matrix  = `matrix(${1}, ${0}, ${0}, ${1}, ${container.position.left}, ${container.position.top})`;
    div.style.transform = matrix;
    div.style.width = `${container.dimension.width}px`;     
    div.style.height = `${container.dimension.height}px`;
    div.style.padding = "0px";
    div.style.zIndex = "1";

    if(container.dragged)
    {
        div.classList.remove("transition-move");
    }

    if(container == diagview.startElement)
    {
        div.classList.remove("shadow-medium");
        div.classList.add("card-start"); 
    }
    else
    {
        div.classList.remove("card-start");
    }

    if(container.highlighted)
    {
        div.classList.add("highlighted");
    } 
    else
    {
        div.classList.remove("highlighted");
    }

    let titleContainer = div.querySelector(".container-title")
    if(titleContainer)
    {
        titleContainer.style.width = `${container.dimension.height}px`;
        titleContainer.querySelector("p").innerHTML = container.title;
    }
    else
    {
        titleContainer = document.createElement("div");    
        titleContainer.classList.add("container-title");
        titleContainer.style.width = `${container.dimension.height}px`;
        let title = document.createElement("p");
        title.style.textOverflow = "ellipsis"
        title.style.textAlign = "center";
        title.innerHTML = container.title;
        titleContainer.appendChild(title);
        div.appendChild(titleContainer);
    }
    
    let debugInfo = div.querySelector(".debug-info");
    if(!debugInfo)
    {
        debugInfo = document.createElement("div");
        div.appendChild(debugInfo);
    }
    debugInfo.innerHTML = `Width: ${container.dimension.width/size} <br> Height: ${container.dimension.height/size}
    <br> x: ${container.position.left/size} <br> y: ${container.position.top/size} <br> id: ${container.id}`;
    debugInfo.classList.add("debug-info");
    if(!debug) div.removeChild(debugInfo);

    return div;
}

function draw_element(tableview, div = document.createElement("div"))
{
    div.classList.add("draggable");
    div.classList.add("card");
    div.classList.add("shadow-medium");
    div.classList.add("transition-move");

    div.id = tableview.id;
    div.style.position = "absolute";
    let matrix  = `matrix(${1}, ${0}, ${0}, ${1}, ${tableview.position.left}, ${tableview.position.top})`;
    div.style.transform = matrix;
    div.style.width = `${tableview.dimension.width}px`;//`${grid_size(1)}px`;     
    div.style.height = `${tableview.dimension.height}px`;//`${grid_size(1)}px`;
    div.style.padding = "5px";
    div.style.zIndex = "2";
    
    if(tableview.dragged)
    {
        div.classList.remove("transition-move");
    }
    
    if(tableview == diagview.startElement)
    {
        div.classList.remove("shadow-medium");
        div.classList.add("card-start"); 
    }
    else
    {
        div.classList.remove("card-start");
    }

    let typeContainer = div.querySelector(".card-type")
    if(typeContainer)
    {
        let type = typeMap.get(tableview.typeId) || "none";
        typeContainer.querySelector("span").innerHTML = type.label;
    }
    else
    {
        typeContainer = document.createElement("div");
        typeContainer.classList.add("card-type");
        typeContainer.style.width = `${tableview.dimension.width * 2}px`;

        let title = document.createElement("span");
        title.style.margin = "0";
        title.style.textOverflow = "ellipsis";
        let type = typeMap.get(tableview.typeId) || "none";
        title.innerHTML = type.label;

        typeContainer.appendChild(title);
        div.appendChild(typeContainer);
    }


    let iconContainer = div.querySelector(".icon-container")
    if(!iconContainer)
    {
        iconContainer = document.createElement("div");
        div.appendChild(iconContainer);
    }
    iconContainer.setAttribute("class", "");
    iconContainer.classList.add("icon-container");
    iconContainer.classList.add(tableview.typeId);


    let titleContainer = div.querySelector(".card-title")
    if(titleContainer)
    {
        titleContainer.querySelector("span").innerHTML = tableview.title;
    }
    else
    {
        titleContainer = document.createElement("div");
        titleContainer.classList.add("card-title");
        titleContainer.style.width = `${tableview.dimension.width * 2}px`;

        let title = document.createElement("span");
        title.style.textOverflow = "ellipsis"
        title.style.margin = "0";
        title.innerHTML = tableview.title;

        titleContainer.appendChild(title);
        div.appendChild(titleContainer);
    }

    let debugInfo = div.querySelector(".debug-info");
    if(!debugInfo)
    {
        debugInfo = document.createElement("div");
        div.appendChild(debugInfo);
    }
    debugInfo.innerHTML = `Width: ${tableview.dimension.width/size} Height: ${tableview.dimension.height/size}
    <br> x: ${tableview.position.left/size} <br> y: ${tableview.position.top/size} <br> id: ${tableview.id}`;
    debugInfo.classList.add("debug-info");
    if(!debug) div.removeChild(debugInfo);

    return div;
}

export function delete_element(event, popover)
{
    draw();
}

function draw_canvas()
{
    let canvas = document.getElementById("canvas");
    //canvas.style.transform = "matrix(1, 0, 0, 1, 50000, 50000)";
    /*
    * STRUCTURING THE CANVAS
    * As position absolute is relative to the parent element, nested element position data is displayed wrong. There are two options to solve this issue.
    * 
    * Option 1 (not used here):
    * For every drawn element the necesarry offset is calculated seperatly in the respective drawing method. 
    * 
    * Option 2 (currently in use):
    * Nesting is stricktly avoided inside of the canvas. Nesting relationships ONLY allowed in the data layer and stricktly FORBIDDEN in display layer 
    * 
    */

    for(let container of diagview.containers.values())
    {
        let div = document.getElementById(container.id);
        if(!div)
        {
            div = draw_container(container);
            canvas.appendChild(div);
        }
        else
        {
            draw_container(container, div);
        }
    }

    for(let tableview of diagview.tableviews.values())
    {
        let child = document.getElementById(tableview.id);
        if(!child)
        {
            child = draw_element(tableview);
            canvas.appendChild(child);
        }
        else
        {
             child = draw_element(tableview, child);
        }
        
        child.addEventListener("transitionend", (event) => {
            event.stopPropagation();
            if(tableview.selected)
            {
                draw_overlay(tableview);
            }
        })
    }


    //remove deleted elements from canvas
    for(let node of [...canvas.childNodes].filter(element => element.nodeType == 1))
    {
        if(!diagview.get_element(node.id))
        {
            canvas.removeChild(node);
        }
    }
}

function draw_overlay() {
    let maxWidth = 0;
    let maxHeight = 0;
    let overlayContainerSvg = document.querySelector("#overlay");
    overlayContainerSvg.setAttribute("width","100%");
    overlayContainerSvg.setAttribute("height","100%");
    overlayContainerSvg.setAttribute("transform","matrix(1, 0, 0, 1, 50000, 50000)");

    let overlayableElements = [...diagview.containers.values(), ...diagview.tableviews.values()];

    for(let view of overlayableElements)
    {
        let group = overlayContainerSvg.querySelector(`[overlay-id="${view.id}"]`);

        if(diagview.is_selected(view.id))
        {
            if(group == null)
            {
                group = document.createElementNS("http://www.w3.org/2000/svg", "g");
                group.setAttribute("overlay-id", view.id);
                overlayContainerSvg.appendChild(group);
    
                let overlay = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
                overlay.setAttribute("fill", "none")
                overlay.setAttribute("stroke", style.OVERLAY_COLOR);
                overlay.setAttribute("stroke-linejoin", "round");
                group.appendChild(overlay);
    
                for(let i = 0; i < 4; i++)
                {
                    let circle = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                    //hide if element is not container
                    let is_container = diagview.get_container(view.id);
                    let color = is_container ? "white" : "transparent"
                    circle.setAttribute("fill", color);//#76C2F1
                    circle.classList.add("visual");
                    circle.setAttribute("scaling-index", i);
                    color = is_container? style.OVERLAY_COLOR: "transparent";
                    circle.setAttribute("stroke", color);
                    circle.setAttribute("stroke-width",Math.max(6, 3 /zoomHandler.zoomFactor));
                    circle.setAttribute("rx", "5");

                    let toucharea = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                    toucharea.classList.add("toucharea");
                    toucharea.setAttribute("fill", "transparent");
                    toucharea.style.pointerEvents = is_container? "all": "none";
                    toucharea.style.touchAction = "none";
                    toucharea.setAttribute("scaling-index", i);

                    let circleGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
                    circleGroup.appendChild(circle);
                    circleGroup.appendChild(toucharea);

                    group.appendChild(circleGroup);
                }
            }
            let topLeft = `${view.position.left},${view.position.top}`;
            let topRight = `${view.position.left + view.dimension.width},${view.position.top}`;
            let bottomLeft = `${view.position.left},${view.position.top  + view.dimension.height}`;
            let bottomRight = `${view.position.left + view.dimension.width},${view.position.top + view.dimension.height}`;
            let overlay = group.querySelector("polygon");
            overlay.setAttribute("points", `${topLeft} ${topRight} ${bottomRight} ${bottomLeft}`);
            overlay.setAttribute("stroke-width",Math.max(6, 3 /zoomHandler.zoomFactor));
            //overlay.setAttribute("stroke-width", "6")//` ${1 * (1/window.visualViewport.scale)}px`);
            let points = overlay.getAttribute("points").split(" ");

            for(let [index, circlegroup] of group.querySelectorAll("g").entries())
            {
                let circle = circlegroup.querySelector(".visual");
                let area = circlegroup.querySelector(".toucharea");

                let coords = points[index].split(",");

                area.setAttribute("cx", coords[0]);
                area.setAttribute("cy", coords[1]);
                let min = 10;
                let max = view.dimension.width/5;
                area.setAttribute("r", Math.max(min, 30 /zoomHandler.zoomFactor));
                area.setAttribute("r", Math.min(max, 30 /zoomHandler.zoomFactor));
                //circle.setAttribute("cx", coords[0]);
                //circle.setAttribute("cy", coords[1]);
                let circleWidth = Math.max(20, 10 /zoomHandler.zoomFactor);
                circle.setAttribute("x", coords[0] - circleWidth/2);
                circle.setAttribute("y", coords[1] - circleWidth/2);
                //circle.setAttribute("r", Math.max(10, 5 /zoomHandler.zoomFactor));
                circle.setAttribute("width", circleWidth);
                circle.setAttribute("height", circleWidth);
            }
            maxHeight = Math.max(view.dimension.height + view.position.top, maxHeight);
            maxWidth = Math.max(view.dimension.width + view.position.left, maxWidth);
        }
        else if(group != null)
        {
            overlayContainerSvg.removeChild(group);
        }
    }
    for(let group of overlayContainerSvg.children)
    {
        let id = group.getAttribute("overlay-id");
        if(!diagview.elements.get(id))
        {
            group.remove();
        }
    }
}

function draw_lines()
{
    let svg = document.getElementById("lines");
    svg.setAttribute("transform","matrix(1, 0, 0, 1, 50000, 50000)");
    svg.setAttribute("width","100%");
    svg.setAttribute("height","100%");
    svg.innerHTML = "";

    let labelContainer = document.createElementNS("http://www.w3.org/2000/svg","text");
    labelContainer.setAttribute("dy", "-20");
    
    for(let line of diagview.lineviews.values())
    {
        let label = document.createElementNS("http://www.w3.org/2000/svg", "textPath");
        label.setAttribute("href", "#"+line.id);
        label.setAttribute("text-anchor", "middle");
        label.setAttribute("startOffset", "50%");
        label.innerHTML = line.title;
        labelContainer.appendChild(label);

        try {
            let start = diagview.get_tableview(line.startId);
            let end = diagview.get_tableview(line.endId);
    
            if(start == undefined ||end == undefined)
            {
                continue;
            }
            drawline_at(line, {x:start.position.left, y:start.position.top}, {x:end.position.left, y:end.position.top}, line.bendpoints);
            if(line == diagview.startElement)
            {
                let path = document.getElementById(line.id);
                if(!path) return;

                let pathLength = path.getTotalLength();
                let point = path.getPointAtLength(0.5*pathLength);

                let marker = create_start_marker();
                
                marker.setAttribute("transform", `matrix(2, 0, 0, 2, ${point.x-16}, ${point.y + 16})`);
                svg.appendChild(marker);


            }
            else
            {
                
            }
        }
        catch(error)
        {
            log(error, "warning");
            continue;
        }
    }
    svg.appendChild(labelContainer);
    svg.innerHTML += "";
}

export default function draw(canvas)
{  
    draw_canvas();
    draw_lines();
    draw_overlay();
}