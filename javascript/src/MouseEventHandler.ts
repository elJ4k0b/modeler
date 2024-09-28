import MouseEvent, { CustomPointer } from "./MouseEvent.js";
import zoomHandler from "./main.js";
import { startdrag, drag, enddrag } from "./drag.js";
import { startscale, scale, endscale } from "./scale.js";
import { select } from "./select.js";
import { startpinch, pinch} from "./pinchzoom.js";
import draw from "./draw.js";
import { diagview } from "./diagramview.js";



const TOOLS = {
    select: "select",
    scale: "scale",
    drag: "drag",
    scroll: "scroll",
    zoom: "zoom"
}

enum Tools {
    select,
    scale,
    drag,
    scroll,
    zoom,
}

let selected_tool: Tools = Tools.drag;

function switch_tool(tool: Tools)
{

    selected_tool = tool;
    // switch(tool) 
    // {
    //     case (Tools.select):
    //         selected_tool = Tools.select;
    //         break;
    //     case (Tools.drag):
    //         selected_tool = Tools.drag;
    //         break;
    //     case (Tools.scale):
    //         selected_tool = Tools.scale;
    //         break;
    //     case (Tools.zoom):
    //         selected_tool = Tools.zoom;
    //         break;
    //     case (Tools.scroll):
    //         selected_tool = Tools.scroll;
    //         break;
    // }
}

class CustomEvents extends MouseEvent
{
    private scrolling: boolean = false;

    constructor()
    {
        super();
        this.scrolling = false;
    }

    override handleClick(event: PointerEvent)
    {
        if(selected_tool == Tools.drag)  select(event);
    }
    override  handleLongPress(event: PointerEvent, pointer: CustomPointer)
    {
        if(!event.target || !(event.target instanceof Element)) return;

        let element = diagview.get_element(event.target.id);
        if(!element)
        {
            diagview.remove_start();
            draw();
            return;
        }
        diagview.set_start(element.id);
        draw();
    }

    override handlePointerDown(event: PointerEvent, pointer: CustomPointer)
    {
        draw();
        if(selected_tool == Tools.scroll && Object.keys(this._pointers).length == 2)
        {
            switch_tool(Tools.zoom);
            startpinch(this._pointers);
        }
    }

    override handleDragStart(event: PointerEvent, pointer: CustomPointer)
    {
        if(!(event.target instanceof Element)) return;
        let target = event.target;
        if(Object.keys(this._pointers).length >= 2)
        {
            if(selected_tool != Tools.zoom)
            {
                switch_tool(Tools.zoom);
                startpinch(this._pointers);
            }
            return;
        }
        else if(target.id == "viewport")
        {
            switch_tool(Tools.scroll);
            zoomHandler.start_pan(event);
            return;
        }
        else if(target.classList.contains("container") && !diagview.is_selected(target.id))
        {
            switch_tool(Tools.scroll);
            zoomHandler.start_pan(event);
            return;
        }

        target.classList.remove("transition-move");
        switch_tool(Tools.drag);

        if(target.classList.contains("visual") || target.classList.contains("toucharea"))
            switch_tool(Tools.scale);

        selected_tool == Tools.scale ? startscale(event): startdrag(event);
    }
    override handleDrag(event: PointerEvent, pointer: CustomPointer)
    {
        switch(selected_tool)
        {
            case Tools.drag:
                drag(event);
                break;
            case Tools.scale:
                scale(event);
                break;
            case Tools.scroll:
                zoomHandler.pan(event);
                break;
            case Tools.zoom:
                if(Object.keys(this._pointers).length < 2)
                {
                     switch_tool(Tools.scroll);
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

    override handleDragEnd(event: PointerEvent)
    {
        switch(selected_tool)
        {
            case Tools.drag:
                enddrag(event);
                this.checkDropTargets(event);
                break;
            case Tools.scale:
                endscale(event);
                switch_tool(Tools.drag);
                break;
            case Tools.zoom:
                if(Object.keys(this._pointers).length < 2)
                {
                     switch_tool(Tools.drag);
                }
                break;
            case Tools.scroll:
                switch_tool(Tools.drag);
                break;
        }

        
    }

    checkDropTargets(event: PointerEvent)
    {
        if(!event.target || !(event.target instanceof Element)) return;

        let dropTargets = document.elementsFromPoint(event.clientX, event.clientY);
        let draggedElement = event.target;

        let draggedElementIsContainer = diagview.get_container(draggedElement.id) != null;
        if(draggedElementIsContainer) return;

        for(let target of dropTargets)
        {
            let container = diagview.get_container(target.id);
            if(!container || draggedElement == target) continue;

            let element = diagview.get_element(draggedElement.id);
            if(!element) return;
            diagview.removeFromCurrentContainer(element.id);
            diagview.addToContainer(element.id, container.id);
            return;
        }
        diagview.removeFromCurrentContainer(draggedElement.id);
    }
}

export default CustomEvents;