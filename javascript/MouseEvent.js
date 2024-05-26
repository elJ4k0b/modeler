import { log } from "./Log.js";

class MouseEvent
{
    constructor()
    {
        document.addEventListener("pointerdown", (event) => {
            try {
                this._handlePointerDown(event);
            }catch(error)
            {
                log(error, "warning");
            }
        });
        document.addEventListener("pointermove", (event) => {
            try {
                this.handlePointermove(event);
            }catch(error)
            {
                log(error, "warning")
            }

        });
        document.addEventListener("pointerup", (event) => {
            try {
                this.handlePointerup(event);
            }catch(error)
            {
                log(error, "warning");
            }
        });
        document.addEventListener("pointercancel", (event) => {
            try {
                this.handlePointercancel(event)
            }catch(error)
            {
                log(error, "warning");
            }
        });
        
        this._pointers = {};
    }
    _handlePointerDown(event)
    {
        event.preventDefault();
        let pointer = this._createPointer(event);
        let test =  JSON.parse(JSON.stringify(event)); 
        
        test.target = pointer.target;
        event.diagram = pointer.target;
        this.handlePointerDown();
    }
    handleLongPress(pointer, event)
    {
        pointer.longpress = true;
    }
    handlePointermove(event)
    {
        event.preventDefault();
        let pointer = this._pointers[event.pointerId];

        if(!pointer) return;

        let movementDelta = {}
        movementDelta.x = pointer.origin.x - event.clientX;
        movementDelta.y = pointer.origin.y - event.clientY;

        pointer.originalEvent = event;

        if(!pointer.drag)
        {
            if(Math.abs(movementDelta.x) > 10 || Math.abs(movementDelta.y) > 10)
            {
                pointer.drag = true;
                clearTimeout(pointer.longclickTimeout);   
                document.body.style.cursor = "grabbing";
                this.handleDragStart(event);
            }        
        }
        else
        {
            this.handleDrag(event);
        }

    }
    handlePointerDown(event){}
    handleDragStart(event){}
    handleDrag(event){}
    handlePointerMove(event){}
    handleDragEnd(event){}
    handleClick(event){}

    handlePointerup(event)
    {
        event.preventDefault();
        let pointers = this._pointers;
        let pointer = pointers[event.pointerId];

        this._pointerup(event);

        
        if(pointer.drag){
            document.body.style.cursor = "Default";
            this.handleDragEnd(event);
        } 
        
        if(!pointer.longpress && !pointer.drag)
        {
            clearTimeout(pointer.longclickTimeout);  
            this.handleClick(event); 
        }
        pointer.target.releasePointerCapture(event.pointerId);
        delete pointers[event.pointerId];
    }
    handlePointercancel(event)
    {
        this.handlePointerup(event);
    }

    setPointerTarget(pointerId, element)
    {
        if (!element instanceof Node) return;

        let customPointer = this._pointers[pointerId];
        if(!customPointer) throw Error("invalid request to set unregistered pointer target");
        customPointer.target = element;

        element.setPointerCapture(pointerId);
    }
    _getPointer(id)
    {
        return this._pointers[id];
    }
    _createPointer(event)
    {
        event.preventDefault();
        let pointer = {};
        this._pointers[event.pointerId] = pointer;
        pointer.target = event.target.closest('[id*="diagram"]') || event.target;

        pointer.longpress = false;
        pointer.origin = {x: event.clientX, y: event.clientY};

        pointer.originalEvent = event;

        pointer.target.setPointerCapture(event.pointerId);
        pointer.longclickTimeout= setTimeout(()=>this.handleLongPress(pointer, event), 500);

        return pointer
    }

    _pointerup(event)
    {
        let dropTargets = document.elementsFromPoint(event.clientX, event.clientY);
        let pointer = this._getPointer(event.pointerId);

        for(let element of dropTargets)
        {
            let dropTarget = element.closest('[id*="diagram"]');
        }
    }
}

export default MouseEvent;
