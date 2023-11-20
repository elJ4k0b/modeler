import MouseEvent from "./MouseEvent.js";
import zoomHandler from "./Zoom.js";
import { startdrag, drag, enddrag } from "./drag.js";
import { startscale, scale, endscale } from "./scale.js";
import { select } from "./select.js";
import { startpinch,pinch, endpinch } from "./pinchzoom.js";
import draw from "./draw.js";
import { diagview } from "./diagramview.js";



const TOOLS = {
    select: "select",
    scale: "scale",
    drag: "drag",
    scroll: "scroll",
    zoom: "zoom"
}

let selected_tool = TOOLS.drag;

function switch_tool(tool)
{
    switch(tool) 
    {
        case (TOOLS.select):
            selected_tool = TOOLS.select;
            break;
        case (TOOLS.drag):
            selected_tool = TOOLS.drag;
            break;
        case (TOOLS.scale):
            selected_tool = TOOLS.scale;
            break;
        case (TOOLS.zoom):
            selected_tool = TOOLS.zoom;
            break;
        case (TOOLS.scroll):
            selected_tool = TOOLS.scroll;
            break;
    }
}

class CustomEvents extends MouseEvent
{
    constructor()
    {
        super();
        this.scrolling = false;
    }

    handleClick(event)
    {
        if(selected_tool == TOOLS.drag)  select(event);
    }
    handleLongPress(pointer, event)
    {
        super.handleLongPress(pointer, event);
        let element = diagview.get_element(event.target.id);
        if(!element) return;
        diagview.set_start(element.id);
        draw();
    }

    handlePointerDown(event)
    {
        draw();
        if(selected_tool == TOOLS.scroll && Object.keys(this._pointers).length == 2)
        {
            switch_tool(TOOLS.zoom);
            startpinch(this._pointers);
        }
    }

    handleDragStart(event)
    {
        let target = event.target;
        if(Object.keys(this._pointers).length >= 2)
        {
            if(selected_tool != TOOLS.zoom)
            {
                switch_tool(TOOLS.zoom);
                startpinch(this._pointers);
            }
            return;
        }else if(target.id == "viewport")
        {
            switch_tool(TOOLS.scroll);
            zoomHandler.start_pan(event);
            return;
        }else if(target.classList.contains("container") && !diagview.is_selected(target.id))
        {
            switch_tool(TOOLS.scroll);
            zoomHandler.start_pan(event);
            return;
        }
        target.classList.remove("transition-move");
        switch_tool(TOOLS.drag);
        if(target.classList.contains("visual") || target.classList.contains("toucharea")) switch_tool(TOOLS.scale);
        selected_tool == TOOLS.scale ? startscale(event):startdrag(event);
    }
    handleDrag(event)
    {
        switch(selected_tool)
        {
            case TOOLS.drag:
                drag(event);
                break;
            case TOOLS.scale:
                scale(event);
                break;
            case TOOLS.scroll:
                zoomHandler.pan(event);
                break;
            case TOOLS.zoom:
                if(Object.keys(this._pointers).length < 2)
                {
                     switch_tool(TOOLS.scroll);
                     zoomHandler.start_pan(event);
                     return;
                }
                draw();
                pinch(this._pointers);
                break;
            default:
                drag(event);    
                break;
        }
        
    }

    handleDragEnd(event)
    {
        switch(selected_tool)
        {
            case TOOLS.drag:
                enddrag(event);
                break;
            case TOOLS.scale:
                endscale(event);
                switch_tool(TOOLS.drag);
                break;
            case TOOLS.zoom:
                if(Object.keys(this._pointers).length < 2)
                {
                     switch_tool(TOOLS.drag);
                }
                break;
            case TOOLS.scroll:
                switch_tool(TOOLS.drag);
                break;
        }
    }

    scroll()
    {

    }
}

export default CustomEvents;