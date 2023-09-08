import { diagview } from "./diagramview.js";
import { drawline_at } from "./lines.js";
import { grid_size } from "./grid.js";
import zoomHandler from "./Zoom.js";

const CANVAS_WIDTH = 100000;

/**
 * 
 * @param {HTMLElement} container 
 * @param {HTMLElement} div 
 * @returns 
 */
function draw_container(container, div = document.createElement("div"))
{
    div.classList.add("draggable");
    div.classList.add("card");
    div.classList.add("container");
    div.classList.add("shadow-medium");
    

    div.id = container.id;
    div.style.position = "absolute";
    let matrix  = `matrix(${1}, ${0}, ${0}, ${1}, ${container.position.left}, ${container.position.top})`;
    div.style.transform = matrix;
    // div.style.top = `${container.position.top}px`;
    // div.style.left = `${container.position.left}px`;
    div.style.width = `${container.dimension.width}px`;     
    div.style.height = `${container.dimension.height}px`;
    div.style.padding = "0px";
    div.style.zIndex = "1";

    if(container.dragged)
    {
        div.classList.remove("transition-move");
    }

    let titleContainer = div.querySelector(".container-title")
    if(titleContainer)
    {
        titleContainer.style.width = `${container.dimension.height}px`;
        titleContainer.querySelector("h2").innerHTML = container.title;
    }
    else
    {
        titleContainer = document.createElement("div");    
        titleContainer.classList.add("container-title");
        titleContainer.style.width = `${container.dimension.height}px`;
        let title = document.createElement("h2");
        title.style.textOverflow = "ellipsis"
        title.style.textAlign = "center";
        title.innerHTML = container.title;
        titleContainer.appendChild(title);
        div.appendChild(titleContainer);
    }
    
    return div;
}

function draw_element(tableview, div = document.createElement("div"))
{
    div.classList.add("draggable");
    div.classList.add("card");
    div.classList.add("shadow-medium");
    div.id = tableview.id;
    div.style.position = "absolute";
    let matrix  = `matrix(${1}, ${0}, ${0}, ${1}, ${tableview.position.left}, ${tableview.position.top})`;
    div.style.transform = matrix;

    // div.style.top = `${tableview.position.top}px`;
    // div.style.left = `${tableview.position.left}px`;
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
    overlayContainerSvg.setAttribute("transform","matrix(1, 0, 0, 1, 50000, 50000)");

    for(let view of diagview.elements.values())
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
                overlay.setAttribute("stroke", "#26A4FF"); //#295FF4
                group.appendChild(overlay);
    
                for(let i = 0; i < 4; i++)
                {
                    let circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                    circle.setAttribute("fill", "#76C2F1");
                    circle.classList.add("visual");
                    circle.setAttribute("scaling-index", i);

                    let toucharea = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                    toucharea.classList.add("toucharea");
                    toucharea.setAttribute("fill", "transparent");
                    toucharea.style.pointerEvents = "all";
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
            overlay.setAttribute("stroke-width", "6")//` ${1 * (1/window.visualViewport.scale)}px`);
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
                circle.setAttribute("cx", coords[0]);
                circle.setAttribute("cy", coords[1]);
                circle.setAttribute("r", Math.max(10, 5 /zoomHandler.zoomFactor));
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
    
    //Force svg to svg to update
    document.querySelector("#overlay").style.width = `${maxWidth+20}px`;
    document.querySelector("#overlay").style.height = `${maxHeight+20}px`;
}

function draw_lines()
{
    let svg = document.getElementById("svg");
    svg.setAttribute("transform","matrix(1, 0, 0, 1, 50000, 50000)");
    let canvas = document.getElementById("canvas");
    svg.setAttribute("width","100%");
    svg.setAttribute("height","100%");
    svg.innerHTML = "";
    
    for(let line of diagview.lineviews.values())
    {
        let start = diagview.get_tableview(line.startId);
        let end = diagview.get_tableview(line.endId);

        if(start == undefined ||end == undefined)
        {
            continue;
        }
        let startPosY = 0;
        let startPosX = 0;
    
        let endPosY = 0;
        let endPosX = 0;
    
        //Check relative position
        let deltaY = start.position.top - end.position.top;
        let deltaX = start.position.left - end.position.left;
    
        //Pfeil entspringt immer oben oder unten
        if(deltaY < 0)
        {
            startPosY = start.position.top + start.dimension.height;
            startPosX = start.position.left + start.dimension.width/2;
        }
        //SONDERFALL: gleiche Y-Koordinate
        else if(deltaY == 0)
        {
            startPosY = start.position.top + start.dimension.height/2;
            if(deltaX < 0 )
            {
                startPosX = start.position.left + start.dimension.height;
            }   
            else
            {
                startPosX = start.position.left;
            }
        }
        else 
        {
            startPosY = start.position.top;
            startPosX = start.position.left + start.dimension.width/2;
        }
    
        //Pfeil kommt immer links oder rechts an 
        if(deltaX < 0)
        {
            endPosX = end.position.left;
            endPosY = end.position.top + end.dimension.height/2;    
        }
        //SONDERFALL: gleiche x-koordinate
        else if (deltaX == 0) 
        {
            endPosX = end.position.left + end.dimension.width/2;
            if(deltaY < 0 )
            {
                endPosY = end.position.top;
            }   
            else
            {
                endPosY = end.position.top + end.dimension.height;
            }
            
        }   
        else 
        {
            endPosX = end.position.left  + end.dimension.width;
            endPosY = end.position.top + end.dimension.height/2;    
        }
        drawline_at(startPosX, startPosY, endPosX, endPosY);
    }
    svg.innerHTML += "";
}

export default function draw(canvas)
{  
    draw_canvas();
    draw_lines();
    draw_overlay();
}