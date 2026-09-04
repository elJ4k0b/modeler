import { notify } from "../api.js";
import { diagview } from "../views/diagram-view.js";
import draw from "../core/draw.js";
import { attach_to_grid } from "../core/grid.js";
import { BendPoint } from "../lines/line-view.js";
import { log } from "../core/log.js";
import zoomHandler from "../main.js";
import { ELEMENT_HEIGHT } from "../core/styles.js";
let currentBendpointId;
let currentLine = null;
export function startbend(event, pointer) {
    event.preventDefault();
    event.stopPropagation();
    try {
        if (event.target instanceof Element && event.target.classList.contains("bendpoint")) {
            let bendpoint = event.target;
            let lineId = event.target.getAttribute("line-id") || "";
            let line = diagview.get_lineview(lineId);
            if (!line)
                throw new Error("Bendpoint is missing line-id property of corresponding relation. Bending prevented");
            currentBendpointId = line.getBendpoint(bendpoint.id).id;
            currentLine = line;
            return;
        }
    }
    catch (error) {
        log(`${error}`, "error");
    }
    try {
        if (!(event.target instanceof SVGPathElement))
            throw new Error(`Can only bend SVGPath elements. Bending prevented`);
        let line = diagview.get_lineview(event.target.id);
        if (!line)
            throw new Error("Trying to bend a path that is no relation. Bending prevented");
        currentLine = line;
        let newBendpoint = new BendPoint({ x: pointer.worldPos.x, y: pointer.worldPos.y });
        currentLine.addBendpoint(newBendpoint);
        currentBendpointId = newBendpoint.id;
    }
    catch (error) {
        log(`${error}`, "error");
    }
}
export function bend(event, pointer) {
    event.preventDefault();
    event.stopPropagation();
    try {
        if (!currentBendpointId || !currentLine)
            throw new Error("Current BendPoint is empty. Startbend must be called before bend to prevent this.");
        let xPosition = (event.clientX - zoomHandler.viewportCenter.x) / zoomHandler.zoomFactor;
        let yPosition = (event.clientY - zoomHandler.viewportCenter.y) / zoomHandler.zoomFactor;
        currentLine.updateBendpoint(currentBendpointId, { x: xPosition, y: yPosition });
        draw();
    }
    catch (error) {
        log(`${error}`, "error");
    }
}
export function endbend(event, pointer) {
    event.preventDefault();
    event.stopPropagation();
    try {
        if (!currentBendpointId || !currentLine)
            throw new Error("Current BendPoint is empty. Startbend must be called before endbend to prevent this.");
        let xPosition = (currentLine === null || currentLine === void 0 ? void 0 : currentLine.getBendpoint(currentBendpointId).x) || 0;
        let yPosition = (currentLine === null || currentLine === void 0 ? void 0 : currentLine.getBendpoint(currentBendpointId).y) || 0;
        currentLine.updateBendpoint(currentBendpointId, { x: attach_to_grid(xPosition) + ELEMENT_HEIGHT / 2, y: attach_to_grid(yPosition) + ELEMENT_HEIGHT / 2 });
        notify("bendpoints-update", { id: currentLine.id, bendpoints: currentLine.bendpoints });
        draw();
    }
    catch (error) {
        log(`${error}`, "error");
    }
}
