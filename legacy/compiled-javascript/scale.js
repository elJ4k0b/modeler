import { log } from "./Log.js";
import zoomHandler from "./main.js";
import ContainerView from "./containerview.js";
import { diagview } from "./diagramview.js";
import draw from "./draw.js";
let scaledElements = [];
let scaleStartX = 0;
let scaleStartY = 0;
let scalePoint = 0;
let offset = { x: 0, y: 0 };
export function startscale(event) {
    if (!event.target || !(event.target instanceof Element)) {
        log("Calling startscale on event target that is not an Element. Should only be called on corner points.", "warning");
        return;
    }
    let index = event.target.getAttribute("scaling-index");
    if (!index) {
        log("Corner point is missing scaling-index property to determin the scaling direction", "warning");
        return;
    }
    event.preventDefault();
    //Only for circle scaling nobs TODO: update to use rect
    let currPosX = event.target.getAttribute("cx") || "0";
    let currPosY = event.target.getAttribute("cy") || "0";
    offset.x = event.clientX / zoomHandler.zoomFactor - parseInt(currPosX);
    offset.y = event.clientY / zoomHandler.zoomFactor - parseInt(currPosY);
    scaleStartX = event.clientX / zoomHandler.zoomFactor;
    scaleStartY = event.clientY / zoomHandler.zoomFactor;
    scalePoint = parseInt(index);
}
export function scale(event) {
    scaledElements = [...diagview.get_selected_elements()].filter((element) => element instanceof ContainerView);
    if (scaledElements == null)
        return;
    let mousepos = { x: event.clientX / zoomHandler.zoomFactor, y: event.clientY / zoomHandler.zoomFactor };
    let deltaSizeX = mousepos.x - scaleStartX;
    let deltaSizeY = mousepos.y - scaleStartY;
    for (let element of scaledElements) {
        let newWidth = 0;
        let newHeight = 0;
        let newX = 0;
        let newY = 0;
        element.dragged = true;
        //Scailing the element around its center;
        switch (scalePoint) {
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
        if (success.x)
            scaleStartX = mousepos.x;
        if (success.y)
            scaleStartY = mousepos.y;
        draw();
    }
}
export function endscale(event) {
    if (scaledElements == null)
        return;
    for (let element of scaledElements) {
        element.set_position_and_size(element.position.left, element.position.top, element.dimension.width, element.dimension.height);
    }
    scaledElements = [];
    draw();
}
