import { diagview } from "./diagramview.js";
import draw from "./draw.js";
import zoomHandler from "./Zoom.js";

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
            selectionXmax = Math.max(tblview.position.left+tblview.dimension.width, selectionXmax)
            selectionYmax = Math.max(tblview.position.top+tblview.dimension.height, selectionYmax)

            if(selectionYmin != 0 && selectionXmin != 0)
            {
                selectionXmin = Math.min(tblview.position.left, selectionXmin);
                selectionYmin = Math.min(tblview.position.top, selectionYmin);
            }
            else
            {
                selectionXmin = tblview.position.left;
                selectionYmin = tblview.position.top;
            }
        }
    }
    let selectionHeight = selectionYmax - selectionYmin;
    let selectionWidth = selectionXmax - selectionXmin;
    let midX = selectionWidth/2 + selectionXmin
    let midY = selectionHeight/2 + selectionYmin;

    
    let toWide = selectionWidth * zoomHandler.zoomFactor > window.innerWidth;
    let toHigh = selectionHeight * zoomHandler.zoomFactor > window.innerHeight;
    if(toWide || toHigh)
    {
        let xScale = window.innerWidth/(selectionWidth*1.2);
        let yScale = window.innerHeight/(selectionHeight*1.2);
        let desiredScale = Math.min(xScale, yScale); 
        zoomHandler.setScale(zoomHandler.zoomFactor / desiredScale, {x: midX, y: midY});
    }


    let target = {x: midX, y: midY};
    zoomHandler.scrollTo(target, true);
}

//Function that handles the selection of elements
export function select(event)
{
    let element = diagview.get_element(event.target.id);
    console.log(event.target.id);
    console.log(element);
    
    if(!event.ctrlKey)
    {
        for(let elemId of diagview.elements.keys())
        {
            if(element && elemId == element.id) continue;
            diagview.select(elemId, false);   
        }
    }
    draw();
    if(!element) return;
    let already_selected = diagview.is_selected(element.id);
    diagview.select(element.id, !already_selected);
    if(!already_selected) scroll_to_selection();
    draw();
}

export function select_view(tblview)
{
    let element = diagview.get_element(tblview.id);
    if(!element) return;

    for(let elemId of diagview.elements.keys())
    {
        diagview.select(elemId, false);   
    }
    diagview.select(element.id, !diagview.is_selected(element.id));
    scroll_to_selection();
    draw();
}