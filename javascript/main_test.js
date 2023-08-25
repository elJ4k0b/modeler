
//Global diagram object that serves as interface for the data layer 
let diagview;

let selected_tool;

const TOOLS = {
    select: "select",
    interact: "interact",
    drag: "drag"
}

function switch_tool(tool)
{
    switch(tool) 
    {
        case (TOOLS.select):
            selected_tool = TOOLS.select;
            break;
        case (TOOLS.drag):
            selected_tool = TOOLS.drag;
            break;
        case (TOOLS.interact):
            selected_tool = TOOLS.drag;
            break;
    }
}

function handle_mousedown(e)
{
    if(selected_tool == null){return};
    switch(selected_tool)
    {
        case TOOLS.drag:
            startdrag(e);
            break;
        case TOOLS.select:
            //TODO: implement custom selection functionality
            break;
        case (TOOLS.interact):
            
            break;
    }
}

function handle_mouseup(e)
{
    switch(selected_tool)
    {
        case TOOLS.drag:
            enddrag(e);
            break;
        case TOOLS.select:
            //TODO: implement custom selection functionality
            break;
        case TOOLS.scale:
            endscale(e);
            break;
    }

}

function handle_mousemove(e)
{
    switch(selected_tool)
    {
        case TOOLS.drag:
            drag(e);
            break;
        case TOOLS.select:
            //TODO: implement custom selection functionality
            break;
        case TOOLS.scale:
            scale(e);
            break;
        default:
            drag(e);    
            break;
    }
}

//Functions that handle the drag and drop mechanism

let draggedElement;

let offset = {
    x:0,
    y:0
};

function startdrag(event)
{
    if(event.type == "touchstart")
    {
        if(event.touches.length >= 2)
        {
            return;
        }
        
        event = event.targetTouches[0];                
    }
    else
    {
        event.preventDefault();
    }
    selected_tool = TOOLS.drag;
    
    let element = diagview.get_element(event.target.id);
    if(element == null){return};

    diagview.select(element.id, false);
    diagview.drag(element.id, true);
    offset.x = event.clientX - element.position.left;
    offset.y = event.clientY - element.position.top;
    draggedElement = element;
}

function enddrag(event)
{
    if(draggedElement == null){return};
    select(event, draggedElement);
    let xPosition = draggedElement.position.left;
    let yPosition = draggedElement.position.top;
    
    yPosition = attach_to_grid(yPosition);
    xPosition = attach_to_grid(xPosition);

    
    


    diagview.get_element(draggedElement.id).move(xPosition, yPosition);
    draw();
    diagview.drag(draggedElement.id, false);
    draggedElement = null;
}

function drag(event)
{   
    let elem = draggedElement;
    if(elem == null){return};

    if(!offset.x || !offset.y){
        offset.x = 0;
        offset.y = 0;
    }
    if(event.type == "touchmove")
    {
        if(event.touches.length >= 2)
        {
            return;
        }
        event.preventDefault();
        event = event.targetTouches[0];
    }

    let xPosition = event.clientX - offset.x;
    let yPosition = event.clientY - offset.y;

    /*Only for grid attached movement
    xPosition = attach_to_grid(event.clientX);
    yPosition = attach_to_grid(event.clientY);*/
    move_element(elem.id, xPosition, yPosition);
    draw(document.getElementById("canvas"));
}


function scroll_to_selection()
{
    let selectionXmin = 0;
    let selectionXmax = 0;
    let selectionYmin = 0;
    let selectionYmax = 0;
    for(let tblviewId of diagview.elements.keys())
    {
        if(diagview.is_selected(tblviewId))
        {
            let tblview = diagview.get_element(tblviewId);
            selectionXmax = Math.max(tblview.position.left+tblview.dimension.width/2, selectionXmax)
            selectionYmax = Math.max(tblview.position.top+tblview.dimension.height/2, selectionYmax)

            if(selectionYmin != 0 && selectionXmin != 0)
            {
                selectionXmin = Math.min(tblview.position.left + tblview.dimension.width/2, selectionXmin);
                selectionYmin = Math.min(tblview.position.top + tblview.dimension.height/2, selectionYmin);
            }
            else
            {
                selectionXmin = tblview.position.left + tblview.dimension.width/2;
                selectionYmin = tblview.position.top + tblview.dimension.height/2;
            }
        }
    }
    let selectionHeight = selectionYmax - selectionYmin;
    let selectionWidth = selectionXmax - selectionXmin;
    let x = selectionWidth/2 + selectionXmin - window.innerWidth/2;
    let y = selectionHeight/2 + selectionYmin - window.innerHeight/2;
    //window.scrollTo({left: x,  top: y, behavior: "smooth"});
    setTimeout(function(){
        document.documentElement.scrollTo({left: x,  top: y, behavior: "smooth"});
    },0);
}

//Function that handles the selection of elements
function select(event, element)
{
    if(!event.ctrlKey)
    {
        for(let elemId of diagview.elements.keys())
        {
            diagview.select(elemId, false);
            
        }
    }
    diagview.select(element.id, !diagview.is_selected(element.id));
    scroll_to_selection();
    draw();
}

//Functions that handle the scaling of elements

let scaledElements = [];
let scaleStartX = 0;
let scaleStartY = 0;
let scalePoint = 0;

function startscale(event, elements, index)
{
    if(event.type == "touchstart")
    {
        event.preventDefault();
        event = event.targetTouches[0];
    }
    else
    {
        event.preventDefault();
    }
    console.log(event.target);
    selected_tool = TOOLS.scale;
    scaledElements.push(elements);

    //Only for circle scaling nobs
    let currPosX = event.target.getAttribute("cx");
    let currPosY = event.target.getAttribute("cy");

    offset.x = event.clientX - parseInt(currPosX);
    offset.y = event.clientY - parseInt(currPosY);
    
    scaleStartX = event.clientX;
    scaleStartY = event.clientY;
    scalePoint = index;
}

function scale(event)
{
    
    if(scaledElements == null) return;

    if(event.type == "touchmove")
    {
        event = event.targetTouches[0];
    }
    let deltaSizeX = event.clientX - scaleStartX;
    let deltaSizeY = event.clientY - scaleStartY;

    for(let element of scaledElements)
    {
        let newWidth = 0;
        let newHeight = 0;

        let newX = 0;
        let newY = 0;
        //Scailing the element around its center;
        switch(scalePoint)
        {
            case 0:
                newWidth = element.dimension.width - deltaSizeX;
                newHeight = element.dimension.height - deltaSizeY;
                
                newX = event.clientX - offset.x;
                newY = event.clientY - offset.y;
                break;
            case 1:              
                newWidth = element.dimension.width + deltaSizeX;
                newHeight = element.dimension.height - deltaSizeY;                    
                
                newX = element.position.left;
                newY = event.clientY - offset.y;
                break;
            case 2:               
                newWidth = element.dimension.width + deltaSizeX;
                newHeight = element.dimension.height + deltaSizeY;
                    
                newX = element.position.left;
                newY = element.position.top;
                break;
            case 3:                
                newWidth = element.dimension.width - deltaSizeX;
                newHeight = element.dimension.height + deltaSizeY;

                newX = event.clientX - offset.x;
                newY = element.position.top;
                break;
            default:
                return;
        }
        if(newHeight > element.minHeight+20)
        {
            diagview.move(element.id, element.position.left, newY)
            resize_conainer(element.id, element.dimension.width, newHeight);
            scaleStartY = event.clientY;
        }
        if(newWidth > element.minWidth+20)
        {
            diagview.move(element.id, newX, element.position.top);
            resize_conainer(element.id, newWidth, element.dimension.height);
            scaleStartX = event.clientX;
        }
    }
}

function endscale ()
{
    scaledElements = [];
    selected_tool = TOOLS.drag;
}




//Functions for drawing view elements
function draw_container(container, div = document.createElement("div"))
{
    div.classList.add("draggable");
    div.classList.add("card");
    div.classList.add("container");
    div.classList.add("shadow-medium");
    

    div.id = container.id;
    div.style.position = "absolute";
    div.style.top = `${container.position.top}px`;
    div.style.left = `${container.position.left}px`;
    div.style.width = `${container.dimension.width}px`;     
    div.style.height = `${container.dimension.height}px`;
    div.style.padding = "0px";
    div.style.zIndex = "1";

    div.addEventListener("mousedown", (event) => startdrag(event));
    div.addEventListener("touchstart", handle_mousedown);
    div.addEventListener("touchmove", handle_mousemove);
    div.addEventListener("touchend", handle_mouseup);
    div.addEventListener("touchcancel", handle_mouseup);

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
    div.classList.add("transition-move");
    div.id = tableview.id;
    div.style.position = "absolute";
    div.style.top = `${tableview.position.top}px`;
    div.style.left = `${tableview.position.left}px`;
    div.style.width = `${grid_size(1)}px`;//`${tableview.dimension.width}px`;     
    div.style.height = `${grid_size(1)}px`;//`${tableview.dimension.height}px`;
    div.style.padding = "5px";
    div.style.zIndex = "2";
    div.addEventListener("touchmove", handle_mousemove);
    div.addEventListener("touchend", handle_mouseup);
    div.addEventListener("touchcancel", handle_mouseup);
    div.addEventListener("touchstart", handle_mousedown);
    let popover = div.querySelector(".popover") || attach_popover(div);
    
    if(tableview.dragged)
    {
        div.classList.remove("transition-move");
    }
    if(tableview.selected)
    {   
        popover.classList.remove("popover-shrunken");
        popover.style.visibility = "visible";
        popover.style.transform = ` scale(max(${1/visualViewport.scale}, 1)) translate(-50%, -100%)`;
        for(let child of popover.childNodes)
        {
            if(child.nodeType == 1)
            {
                child.style.display = "flex";
            }
        }
        popover.style.opacity = "0";
        requestAnimationFrame(function() {
            popover.style.opacity = "1";
            popover.style.maxWidth = "";
        });

        if(tableview.locked)
        {
            popover.querySelector(".lock").classList.add("icon-locked");
        }
        else
        {
            popover.querySelector(".lock").classList.remove("icon-locked");
        }
        requestAnimationFrame(function() {
            popover.style.opacity = "1";
          });
    }
    else if(tableview.locked)
    {
        popover.style.visibility = "visible"
        popover.style.opacity = "1";
        popover.querySelector(".lock").classList.add("icon-locked");
        popover.classList.add("popover-shrunken");
        maxWidth = popover.querySelector(".lock").offsetWidth;
        for(let child of popover.childNodes)
        {
            if(child.nodeType == 1 && !child.classList.contains("lock"))
            {
                child.style.display = "none";
            }
        }
        
    }
    else
    {
        popover.style.opacity = 0;
    }
    if(tableview == diagview.startElement)
    {
        popover.querySelector(".flag").classList.add("icon-locked");
        div.classList.remove("shadow-medium");
        div.classList.add("card-start"); 
    }
    else
    {
        popover.querySelector(".flag").classList.remove("icon-locked");
        div.classList.remove("card-start");
    }
    return div;
}

function delete_element(event, popover)
{
    remove_element(popover.getAttribute("parentId"));
    draw();
}

function flag_element(event, popover)
{
    diagview.startElement = diagview.get_element(popover.getAttribute("parentId"));
    draw();
}

function attach_popover(div)
{
    let popover = document.getElementById("template").cloneNode(true);
    popover.querySelector(".delete").addEventListener("click", () => {delete_element(event, popover)});
    popover.querySelector(".flag").addEventListener("click", () => {flag_element(event, popover)});
    popover.querySelector(".lock").addEventListener("click", () => {lock_element(popover.getAttribute("parentId"))});
    popover.querySelector(".delete").addEventListener("touchstart", () => {delete_element(event, popover)});
    popover.querySelector(".flag").addEventListener("touchstart", () => {flag_element(event, popover)});
    popover.querySelector(".lock").addEventListener("touchstart", () => {lock_element(popover.getAttribute("parentId"))});
    popover.setAttribute("parentId", div.id);
    div.appendChild(popover);
    return popover;
}


function draw(canvas)
{  
    draw_canvas();
    draw_lines();
    draw_overlay();
}


function draw_canvas()
{
    let canvas = document.getElementById("canvas");

    let maxWidth = 0;
    let maxHeight = 0;

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
            child.addEventListener("mousedown", handle_mousedown);
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

        maxHeight = Math.max(tableview.dimension.height + tableview.position.top + 200, maxHeight, canvas.offsetHeight);
        maxWidth = Math.max(tableview.dimension.width + tableview.position.left + 200, maxWidth, canvas.offsetWidth);
    }


    //remove deleted elements from canvas
    for(let node of [...canvas.childNodes].filter(element => element.nodeType == 1))
    {
        if(!diagview.get_element(node.id))
        {
            canvas.removeChild(node);
        }
    }
    

    canvas.style.width = `${maxWidth}px`;
    canvas.style.height = `${maxHeight}px`;
}

function draw_overlay() {
    let maxWidth = 0;
    let maxHeight = 0;
    let overlayContainerSvg = document.querySelector("#overlay");

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
                overlay.setAttribute("stroke", "#295FF4");
                group.appendChild(overlay);
    
                for(let i = 0; i < 4; i++)
                {
                    let circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                    circle.setAttribute("fill", "#76C2F1");
                    circle.classList.add("visual");

                    let toucharea = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                    toucharea.classList.add("toucharea");
                    toucharea.setAttribute("fill", "transparent");
                    toucharea.style.pointerEvents = "all";
                    toucharea.style.touchAction = "none";
                    toucharea.addEventListener("mousedown", (event) => {startscale(event, view, i)});
                    toucharea.addEventListener("touchstart", (event) =>{startscale(event, view, i)});
                    toucharea.addEventListener("touchmove", handle_mousemove);
                    toucharea.addEventListener("touchend", handle_mouseup);
                    toucharea.addEventListener("touchcancel", handle_mouseup);

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
            overlay.setAttribute("stroke-width", ` ${1 * (1/window.visualViewport.scale)}px`);
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
                area.setAttribute("r", Math.max(min, 30 * 1/window.visualViewport.scale));
                area.setAttribute("r", Math.min(max, 30 * 1/window.visualViewport.scale));
                circle.setAttribute("cx", coords[0]);
                circle.setAttribute("cy", coords[1]);
                circle.setAttribute("r", Math.max(10, 5 * 1/window.visualViewport.scale));
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
    let canvas = document.getElementById("canvas");
    svg.setAttribute("width",canvas.style.width);
    svg.setAttribute("height",canvas.style.height);
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