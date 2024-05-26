import { diagview } from "./diagramview.js";
import { attach_to_grid } from "./grid.js";
import { move_element } from "./API.js";
import draw from "./draw.js";
import zoomHandler from "./Zoom.js";

let draggedElement;

let offset = {
    x:0,
    y:0
};

export function startdrag(event)
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
    
    let element = diagview.get_element(event.target.id);
    if(element == null){return};

    //diagview.select(element.id, false);
    diagview.drag(element.id, true);
    offset.x = event.clientX/zoomHandler.zoomFactor - element.position.left;
    offset.y = event.clientY/zoomHandler.zoomFactor - element.position.top;
    draggedElement = element;
}

export function enddrag(event)
{
    if(draggedElement == null){return};
    //select(event, draggedElement);
    let xPosition = draggedElement.position.left;
    let yPosition = draggedElement.position.top;
    
    yPosition = attach_to_grid(yPosition);
    xPosition = attach_to_grid(xPosition);

    diagview.move(draggedElement.id, xPosition, yPosition);
    draw();
    diagview.drag(draggedElement.id, false);
    draggedElement = null;
}

export function drag(event)
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

    let xPosition = event.clientX/zoomHandler.zoomFactor - offset.x;
    let yPosition = event.clientY/zoomHandler.zoomFactor - offset.y;

    move_element(elem.id, xPosition, yPosition, false);
    draw(document.getElementById("canvas"));
}