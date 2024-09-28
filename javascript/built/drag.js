import { diagview } from "./diagramview.js";
import { attach_to_grid } from "./grid.js";
import { move_element } from "./API.js";
import draw from "./draw.js";
import zoomHandler from "./main.js";
import { log } from "./Log.js";
let draggedElement;
let offset = {
    x: 0,
    y: 0
};
export function startdrag(event) {
    event.preventDefault();
    if (!(event.target instanceof Element)) {
        log(`Event target could not be converted to Element thus returning`, "warning");
        return;
    }
    let eventTarget = event.target;
    let element = diagview.get_element(eventTarget.id);
    if (element == null)
        return;
    diagview.drag(element.id, true);
    offset.x = event.clientX / zoomHandler.zoomFactor - element.position.left;
    offset.y = event.clientY / zoomHandler.zoomFactor - element.position.top;
    draggedElement = element;
}
export function enddrag(event) {
    if (draggedElement == null) {
        return;
    }
    ;
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
export function drag(event) {
    let elem = draggedElement;
    if (elem == null) {
        return;
    }
    ;
    if (!offset.x || !offset.y) {
        offset.x = 0;
        offset.y = 0;
    }
    let xPosition = event.clientX / zoomHandler.zoomFactor - offset.x;
    let yPosition = event.clientY / zoomHandler.zoomFactor - offset.y;
    move_element(elem.id, xPosition, yPosition, false);
    draw();
}
