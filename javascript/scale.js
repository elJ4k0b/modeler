import { diagview } from "./diagramview.js";
import draw from "./draw.js";

//Functions that handle the scaling of elements

let scaledElements = [];
let scaleStartX = 0;
let scaleStartY = 0;
let scalePoint = 0;

export function startscale(event, elements, index)
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

export function scale(event)
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

export function endscale ()
{
    scaledElements = [];
}