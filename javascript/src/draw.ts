import { diagview } from "./diagramview.js";
import { create_start_marker, drawline_at } from "./lines.js";
import { grid_size, size } from "./grid.js";
import zoomHandler from "./main.js";
import * as style from "./Styles.js"
import { typeMap } from "./Types.js";
import { log } from "./Log.js";
import ContainerView from "./containerview.js";
import Tableview from "./Tableview.js";

let debug = true;

const CANVAS_WIDTH = 100000;

export function toggel_debuginfo()
{
    debug = !debug;
}

function draw_container(container: ContainerView, div = document.createElement("div"))
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

    try {
        let titleContainer = div.querySelector(".container-title") as HTMLElement;
        titleContainer.style.width = `${container.dimension.height}px`;
        let titleContainerText = titleContainer.querySelector("p");
        if(!titleContainerText) throw new Error(`TitleContainer does not have title text element on container with id ${container.id}`);
        titleContainerText.innerHTML = container.title;
    }
    catch(error) {

        let titleContainer = document.createElement("div");    
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
        debugInfo.classList.add(".debug-info");
        div.appendChild(debugInfo);
    }
    debugInfo.innerHTML = `Width: ${container.dimension.width/size} <br> Height: ${container.dimension.height/size}
    <br> x: ${container.position.left/size} <br> y: ${container.position.top/size} <br> id: ${container.id}`;
    debugInfo.classList.add("debug-info");
    if(!debug) div.removeChild(debugInfo);

    return div;
}

function draw_element(tableview: Tableview, div = document.createElement("div"))
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

    let typeContainer = div.querySelector(".card-type");
    if(typeContainer)
    {
        let type = typeMap.get(tableview.typeId)?.label || "none";
        let typeContainerText = typeContainer.querySelector("span");
        if(!typeContainerText)
        {
            typeContainerText = document.createElement("span");
            typeContainer.appendChild(typeContainerText);
        }
        typeContainerText.innerHTML = type;
    }
    else
    {
        try {
            let newTypeContainer = document.createElement("div") as HTMLDivElement;
            newTypeContainer.classList.add("card-type");
            newTypeContainer.style.width = `${tableview.dimension.width * 2}px`;
    
            let title = document.createElement("span");
            title.style.margin = "0";
            title.style.textOverflow = "ellipsis";
            let type = typeMap.get(tableview.typeId)?.label || "none";
            title.innerHTML = type;
    
            newTypeContainer.appendChild(title);
            div.appendChild(newTypeContainer);
        } catch (error) {
            log("Failed to create type container to display the elements type", "error", {file: "draw.ts", line: 162, method: "draw_element"});
        }
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
    let title = titleContainer?.querySelector("span");
    if(titleContainer && title)
    {
        
        title.innerHTML = tableview.title;
    }
    else
    {
        let newTitleContainer = document.createElement("div");
        newTitleContainer.classList.add("card-title");
        newTitleContainer.style.width = `${tableview.dimension.width * 2}px`;

        let title = document.createElement("span");
        title.style.textOverflow = "ellipsis"
        title.style.margin = "0";
        title.innerHTML = tableview.title;

        newTitleContainer.appendChild(title);
        div.appendChild(newTitleContainer);
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

function draw_canvas()
{
    let canvas = document.getElementById("canvas");
    if(!canvas)
    {
        canvas = document.createElement("div");
        canvas.setAttribute("id", "canvas");
        document.body.appendChild(canvas);
    }
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
        try 
        {
            let containerDiv = document.getElementById(container.id) as HTMLDivElement;
            if(!containerDiv)
            {
                containerDiv = draw_container(container);
                canvas.appendChild(containerDiv);
            }
            else
            {
                draw_container(container, containerDiv);
            }
        }
        catch(error)
        {
            log(`HTML representation of containers is expected to be of type HTMLDivElement but was not for 
                container with id  ${container.id} - ${error}`, "error");
        }
    }

    for(let tableview of diagview.tableviews.values())
    {
        try 
        {
            let elementDiv = document.getElementById(tableview.id) as HTMLDivElement;
            if(!elementDiv)
            {
                elementDiv = draw_element(tableview);
                canvas.appendChild(elementDiv);
            }
            else
            {
                elementDiv = draw_element(tableview, elementDiv);
            }
            
            elementDiv.addEventListener("transitionend", (event) => {
                event.stopPropagation();
                if(tableview.selected)
                {
                    draw_overlay();
                }
            })
        }
        catch(error)
        {
            log(`HTML representation of elements is expected to be of type HTMLDivElement but was not for 
                element with id  ${tableview.id} - ${error}`, "error");
        }
        
    }


    //remove deleted elements from canvas
    for(let node of [...canvas.childNodes].filter(element => element.nodeType == 1)) //remove non HTMLElement nodes
    {
        try {
            let nodeElement = node as Element;
            if(!diagview.get_element(nodeElement.id))
            {
                canvas.removeChild(node);
            }
        }
        catch(error)
        {
            log(`Expecting only Element nodes in node list. Node ${node} could not be deleted - ${error}`, "error");
        }
    }
}

function draw_overlay() {
    let maxWidth = 0;
    let maxHeight = 0;
    
    let overlayContainerSvg = document.getElementById("overlay");
    if(!overlayContainerSvg)
    {
        let newOverlayContainerSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        newOverlayContainerSvg.setAttribute("id", "overlay");
        document.body.appendChild(newOverlayContainerSvg);
    }

    overlayContainerSvg = document.getElementById("overlay");
    if(!overlayContainerSvg)
    {
        log("OverlayContainer element does not exist but should have been created", "error");
        return;
    }
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
                    circle.setAttribute("scaling-index", i.toString());
                    color = is_container? style.OVERLAY_COLOR: "transparent";
                    circle.setAttribute("stroke", color);
                    circle.setAttribute("stroke-width", Math.max(6, 3 /zoomHandler.zoomFactor).toString());
                    circle.setAttribute("rx", "5");

                    let toucharea = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                    toucharea.classList.add("toucharea");
                    toucharea.setAttribute("fill", "transparent");
                    toucharea.style.pointerEvents = is_container? "all": "none";
                    toucharea.style.touchAction = "none";
                    toucharea.setAttribute("scaling-index", i.toString());

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
            if(!overlay)
            {
                overlay = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
                group.appendChild(overlay);
            }
            overlay.setAttribute("points", `${topLeft} ${topRight} ${bottomRight} ${bottomLeft}`);
            overlay.setAttribute("stroke-width", Math.max(6, 3 /zoomHandler.zoomFactor).toString());
            //overlay.setAttribute("stroke-width", "6")//` ${1 * (1/window.visualViewport.scale)}px`);

            try {

                let points = overlay.getAttribute("points")?.split(" ");
                if(!points) throw new Error("Points attribute of overlay was not set");

                for(let [index, circlegroup] of group.querySelectorAll("g").entries())
                {
                    let cornerpoint = circlegroup.querySelector(".visual"); //svg rect element functioning as visual cornerpoint
                    if(!cornerpoint)
                    {
                        log("Cornerpoint was not found, but should already exist", "warning", {file: "draw.ts", line: 402, method: "draw_overlay"});
                        cornerpoint = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                        cornerpoint.classList.add("visual");
                    }

                    let area = circlegroup.querySelector(".toucharea");//svg circle element to increase the toucharea of the cornerpoint
                    if(!area)
                    {
                        log("Toucharea was not found, but should already exist", "warning", {file: "draw.ts", line: 402, method: "draw_overlay"});
                        area = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                        area.classList.add("toucharea");
                    }
                    let coords = points[index].split(",");
                    let x = coords[0];
                    let y = coords[1] ;
                    
                    area.setAttribute("cx", coords[0]);
                    area.setAttribute("cy", coords[1]);
                    let min = 10;
                    let max = view.dimension.width/5;
                    area.setAttribute("r", Math.max(min, 30 /zoomHandler.zoomFactor).toString());
                    area.setAttribute("r", Math.min(max, 30 /zoomHandler.zoomFactor).toString());

                    let cornerPointWidth = Math.max(20, 10 /zoomHandler.zoomFactor);                    
                    cornerpoint.setAttribute("x", (parseFloat(x) - cornerPointWidth/2).toString());
                    cornerpoint.setAttribute("y", (parseFloat(y) - cornerPointWidth/2).toString());
                    //circle.setAttribute("r", Math.max(10, 5 /zoomHandler.zoomFactor));
                    cornerpoint.setAttribute("width", cornerPointWidth.toString());
                    cornerpoint.setAttribute("height", cornerPointWidth.toString());
                }
                maxHeight = Math.max(view.dimension.height + view.position.top, maxHeight);
                maxWidth = Math.max(view.dimension.width + view.position.left, maxWidth);
            }
            catch(error) {
                log(`Error in calculating and setting the overlay corner position - ${error}`, "error");
            }
        }
        else if(group != null)
        {
            overlayContainerSvg.removeChild(group);
        }
    }
    //removing overlay from deleted elements
    for(let group of overlayContainerSvg.children)
    {
        try
        {
            let id = group.getAttribute("overlay-id")?.toString();
            if(!id) throw new Error(`Group ${group} lacks overlay-id attribute`);
            if(!diagview.elements.get(id))
            {
                group.remove();
            }
        }
        catch(error)
        {
            log(`Unexpected error occured while trying to remove overlay from deleted elements - ${error}`, "warning", {file: "draw.ts", line: 451, method: "draw_olveray"});
            continue;
        }
    }
}

function draw_lines()
{
    let svg = document.getElementById("lines");
    if(!svg)
    {
        log(`Failed to get lines element`, "error", {file: "draw", line: 377, "method": "draw_lines"});
        return;
    }

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
                throw new Error(`The start or end values of line with id ${line.id} are undefined`);
            drawline_at(line, {x:start.position.left, y:start.position.top}, {x:end.position.left, y:end.position.top}, line.bendpoints);
        }
        catch(error)
        {
            log(`Failed to draw line with id ${line.id} - ${error}`, "error");
            continue;
        }

        if(line == diagview.startElement)
        {
            let path = document.getElementById(line.id) as SVGPathElement | null;
            if(!path || !(path.constructor == SVGPathElement)) return;

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
    svg.appendChild(labelContainer);
    svg.innerHTML += "";
}

export default function draw()
{  
    draw_canvas();
    draw_lines();
    draw_overlay();
}