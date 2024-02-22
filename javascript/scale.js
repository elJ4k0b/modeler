import zoomHandler from "./Zoom.js";
import { diagview } from "./diagramview.js";
import draw from "./draw.js";
import { grid_size } from "./grid.js";

//Functions that handle the scaling of elements

let scaledElements = [];
let scaleStartX = 0;
let scaleStartY = 0;
let scalePoint = 0;
let offset = {};

export function startscale(event)
{
    let index = event.target.getAttribute("scaling-index");

    if(event.type == "touchstart")
    {
        event.preventDefault();
        event = event.targetTouches[0];
    }
    else
    {
        event.preventDefault();
    }

    //Only for circle scaling nobs
    let currPosX = event.target.getAttribute("cx");
    let currPosY = event.target.getAttribute("cy");

    offset.x = event.clientX/zoomHandler.zoomFactor - parseInt(currPosX);
    offset.y = event.clientY/zoomHandler.zoomFactor - parseInt(currPosY);
    
    scaleStartX = event.clientX/zoomHandler.zoomFactor;
    scaleStartY = event.clientY/zoomHandler.zoomFactor;
    scalePoint = parseInt(index);
}

export function scale(event)
{
    scaledElements = diagview.get_selected_elements();
    if(scaledElements == null) return;

    let mousepos = {x: event.clientX/zoomHandler.zoomFactor, y: event.clientY/zoomHandler.zoomFactor};
    
    let deltaSizeX = mousepos.x - scaleStartX;
    let deltaSizeY = mousepos.y - scaleStartY;

    for(let element of scaledElements)
    {
        let newWidth = 0;
        let newHeight = 0;

        let newX = 0;
        let newY = 0;
        element.dragged = true;
        //Scailing the element around its center;
        switch(scalePoint)
        {
            case 0:
                newWidth = element.dimension.width - deltaSizeX;
                newHeight = element.dimension.height - deltaSizeY;
                
                newX = mousepos.x - offset.x;
                newY = mousepos.y - offset.y;
                break;
            case 1:              
                newWidth = element.dimension.width + deltaSizeX;
                newHeight = element.dimension.height - deltaSizeY;                    
                
                newX = element.position.left;
                newY = mousepos.y - offset.y;
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

                newX = mousepos.x - offset.x;
                newY = element.position.top;
                break;
            default:
                return;
        }
        let success = element.resize(newWidth, newHeight, newX, newY);
        if(success.x) scaleStartX = mousepos.x;
        if(success.y) scaleStartY = mousepos.y;
        draw();
    }
}

export function endscale ()
{
    scaledElements = [];
}