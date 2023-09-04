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
    let midX = selectionWidth/2 + selectionXmin
    let midY = selectionHeight/2 + selectionYmin;

    let target = {x: midX, y: midY};    
    zoomHandler.scrollTo(target, true);
}

//Function that handles the selection of elements
export function select(event)
{
    let element = diagview.get_element(event.target.id);
    
    if(!event.ctrlKey)
    {
        for(let elemId of diagview.elements.keys())
        {
            diagview.select(elemId, false);   
        }
    }
    if(!element) return;
    diagview.select(element.id, !diagview.is_selected(element.id));
    scroll_to_selection();
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