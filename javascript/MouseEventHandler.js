import MouseEvent from "./MouseEvent.js";
import zoomHandler from "./Zoom.js";
import { startdrag, drag, enddrag } from "./drag.js";
import { startscale, scale, endscale } from "./scale.js";
import { select } from "./select.js";
import { startpinch,pinch, endpinch } from "./pinchzoom.js";


let selected_tool;

const TOOLS = {
    select: "select",
    scale: "scale",
    drag: "drag",
    scroll: "scroll",
    zoom: "zoom"
}

function switch_tool(tool)
{
    console.log("switching tool to" + tool);
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
    console.log(selected_tool);
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
        select(event);
    }
    handleLongPress(pointer, event)
    {
        super.handleLongPress(pointer, event);
    }

    handleDragStart(event)
    {
        let target = event.target;
        if(Object.keys(this._pointers).length >= 2)
        {
            console.log("Hallo wir zoomend jetzt");
            switch_tool(TOOLS.zoom);
            startpinch(this._pointers);
        }else if(target.id == "viewport")
        {
            console.log("viewport")
            switch_tool(TOOLS.scroll);
            zoomHandler.start_pan(event);
            return;
        }
        console.log("nicht viewport");
        target.classList.remove("transition-move");
        switch_tool(TOOLS.drag);
        if(target.classList.contains("visual")) switch_tool(TOOLS.scale);
        selected_tool == TOOLS.scale ? startscale(event):startdrag(event);
    }
    handleDrag(event)
    {
        console.log("selected toool")
        console.log(selected_tool);
        switch(selected_tool)
        {
            case TOOLS.drag:
                console.log("dragging");
                drag(event);
                break;
            case TOOLS.scale:
                console.log("scaling");
                scale(event);
                break;
            case TOOLS.scroll:
                console.log("panning");
                zoomHandler.pan(event);
                break;
            case TOOLS.zoom:
                console.log("zooming");
                if(Object.keys(this._pointers).length < 2)
                {
                    document.body.style.backgroundColor = "red";
                    switch_tool(TOOLS.drag);
                    return;
                }
                pinch(this._pointers);
            default:
                console.log("default");
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
                break;
            case TOOLS.zoom:
                switch_tool(TOOLS.drag);
                break;
            case TOOLS.scroll:
                switch_tool(TOOLS.drag);
                break;
        }
        requestAnimationFrame(() => {event.target.classList.add("transition-move");});
    }

    scroll()
    {

    }
}

export default CustomEvents;