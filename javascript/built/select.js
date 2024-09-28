import { diagview } from "./diagramview.js";
import draw from "./draw.js";
import { log } from "./Log.js";
import zoomHandler from "./main.js";
export function scroll_to_selection() {
    //Hier wichtig: Math.max ist die kleinste mögliche Zahl und Math.min die größte
    let selectionXmin = Math.min();
    let selectionXmax = Math.max();
    let selectionYmin = Math.min();
    let selectionYmax = Math.max();
    let somethingIsSelected = false;
    for (let elementId of diagview.elements.keys()) {
        if (diagview.is_selected(elementId)) {
            try {
                let element = diagview.get_element(elementId);
                if (!element)
                    throw new Error(`Selected element with id ${elementId} does not exist on diagram. Diagram elements is inconsistent`);
                somethingIsSelected = true;
                selectionXmax = Math.max(element.position.left + element.dimension.width, selectionXmax);
                selectionYmax = Math.max(element.position.top + element.dimension.height, selectionYmax);
                if (selectionYmin != 0 && selectionXmin != 0) {
                    selectionXmin = Math.min(element.position.left, selectionXmin);
                    selectionYmin = Math.min(element.position.top, selectionYmin);
                }
                else {
                    selectionXmin = element.position.left;
                    selectionYmin = element.position.top;
                }
            }
            catch (error) {
                log(`Error in calculation of selection bounds. Bounds might be inaccurate. - ${error}`, "warning", { file: "select.ts", method: "scroll_to_selection", "line": 40 });
                continue;
            }
        }
    }
    if (somethingIsSelected == false)
        return;
    let selectionHeight = selectionYmax - selectionYmin;
    let selectionWidth = selectionXmax - selectionXmin;
    let midX = selectionWidth / 2 + selectionXmin;
    let midY = selectionHeight / 2 + selectionYmin;
    let windowDimension = zoomHandler.getWindowDimension();
    let toWide = selectionWidth * zoomHandler.zoomFactor > windowDimension.width;
    let toHigh = selectionHeight * zoomHandler.zoomFactor > windowDimension.height;
    if (toWide || toHigh) {
        let xScale = (windowDimension.width) / (selectionWidth * 1.2);
        let yScale = (windowDimension.height) / (selectionHeight * 1.2);
        let desiredScale = Math.min(xScale, yScale);
        zoomHandler.setScale(zoomHandler.zoomFactor / desiredScale, { x: midX, y: midY });
    }
    let target = { x: midX, y: midY };
    zoomHandler.scrollTo(target, true);
}
//Function that handles the selection of elements
//Select on mouseevent
export function select(event) {
    log("starting method select in select.js", "info");
    if (!(event.target instanceof Element)) {
        log("event target is empty  - returning early", "error");
        return;
    }
    let element = diagview.get_element(event.target.id);
    if (!event.ctrlKey) {
        for (let elemId of diagview.elements.keys()) {
            if (element && elemId == element.id)
                continue;
            diagview.select(elemId, false);
        }
    }
    draw();
    if (!element)
        return;
    let already_selected = diagview.is_selected(element.id);
    diagview.select(element.id, !already_selected);
    if (!already_selected)
        scroll_to_selection();
    draw();
}
//Select element via code
export function select_view(tblview) {
    let element = diagview.get_element(tblview.id);
    if (!element)
        return;
    for (let elemId of diagview.elements.keys()) {
        diagview.select(elemId, false);
    }
    diagview.select(element.id, !diagview.is_selected(element.id));
    scroll_to_selection();
    draw();
}
