import { diagview } from "./diagramview.js";
import draw from "./draw.js";
import { attach_to_grid, grid_size } from "./grid.js";
import { BendPoint } from "./lineview.js";
import { log } from "./Log.js";
import zoomHandler from "./main.js";
import { CustomPointer } from "./MouseEvent.js";
import { ELEMENT_HEIGHT } from "./Styles.js";

let currentBendpoint: BendPoint;

export function startbend(event: PointerEvent, pointer: CustomPointer)
{
    event.preventDefault();
    event.stopPropagation();

    try 
    {
        if(event.target instanceof Element && event.target.classList.contains("bendpoint"))
        {
            console.log("Hallo");
            let bendpoint = event.target;
            let lineId = event.target.getAttribute("line-id") || "";
            let line = diagview.get_lineview(lineId);
            if(!line)
                throw new Error("Bendpoint is missing line-id property of corresponding relation. Bending prevented");
            currentBendpoint = line.getBendpoint(bendpoint.id);
            return;
        }
    }
    catch(error)
    {
        log(`${error}`, "error");
    }
    console.log(event.target);
    try
    {
        if(!(event.target instanceof SVGPathElement))
            throw new Error(`Can only bend SVGPath elements. Bending prevented`)

        let line = diagview.get_lineview(event.target.id);
        if(!line)
            throw new Error("Trying to bend a path that is no relation. Bending prevented");

        currentBendpoint = new BendPoint({x: pointer.worldPos.x, y: pointer.worldPos.y});
        line.addBendpoint(currentBendpoint);
    }
    catch(error)
    {
        log(`${error}`, "error");
    }

}

export function bend(event: PointerEvent, pointer: CustomPointer)
{
    event.preventDefault();
    event.stopPropagation();
    console.log("bending");
    console.log(pointer.worldPos);
    try
    {
        if(!currentBendpoint)
            throw new Error("Current BendPoint is empty. Startbend must be called before bend to prevent this.");
        let xPosition = (event.clientX - zoomHandler.viewportCenter.x)/zoomHandler.zoomFactor;
        let yPosition = (event.clientY - zoomHandler.viewportCenter.y)/zoomHandler.zoomFactor;
    
        currentBendpoint.x = xPosition;
        currentBendpoint.y = yPosition;
        draw();
    }
    catch(error)
    {
        log(`${error}`, "error")
    }

}

export function endbend(event: PointerEvent, pointer: CustomPointer)
{
    event.preventDefault();
    event.stopPropagation();
    let xPosition = currentBendpoint.x;
    let yPosition = currentBendpoint.y;

    currentBendpoint.x = attach_to_grid(xPosition) + ELEMENT_HEIGHT/2;
    currentBendpoint.y = attach_to_grid(yPosition) + ELEMENT_HEIGHT/2;
    draw();
    
}