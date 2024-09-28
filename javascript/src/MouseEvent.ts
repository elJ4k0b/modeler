import { log } from "./Log.js";

export type CustomPointer = {
    target: Element, 
    longpress: boolean,
    origin: {x: number, y: number},
    originalEvent: PointerEvent,
    longclickTimeout: number,
    drag: boolean,
    dropTargets: Array<Element>
}

type Point = {x: number, y: number}

class MouseEvent
{
    protected _pointers: {[key: string]: CustomPointer};

    constructor()
    {
        document.addEventListener("pointerdown", (event) => {
            try {
                this._handlePointerDown(event);
            }catch(error)
            {
                log(`${error}`, "warning");
            }
        });
        document.addEventListener("pointermove", (event) => {
            try {
                this._handlePointermove(event);
            }catch(error)
            {
                log(`${error}`, "warning")
            }

        });
        document.addEventListener("pointerup", (event) => {
            try {
                this._handlePointerup(event);
            }catch(error)
            {
                log(`${error}`, "warning");
            }
        });
        document.addEventListener("pointercancel", (event) => {
            try {
                this._handlePointercancel(event)
            }catch(error)
            {
                log(`${error}`, "warning");
            }
        });
        
        this._pointers = {};
    }

    private _handlePointerDown(event: PointerEvent): void
    {
        event.preventDefault();
        let pointer = this._createPointer(event);
        this.handlePointerDown(event, pointer);
    }

    private _handlePointermove(event: PointerEvent): void
    {
        event.preventDefault();
        let pointer = this._pointers[event.pointerId];
        
        if(!pointer) return;
        
        let movementDelta: Point = {x: 0, y: 0};
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
                this.handleDragStart(event, pointer);
            }        
        }
        else
        {
            this.handleDrag(event, pointer);
        }
        
        this.handlePointerMove(event, pointer);
    }
    
    private _handleLongPress(event: PointerEvent, pointer: CustomPointer)
    {
        pointer.longpress = true;
        this.handleLongPress(event, pointer);
    }

    
    private _handlePointerup(event: PointerEvent): void
    {
        event.preventDefault();
        let pointers = this._pointers;
        let pointer = pointers[event.pointerId];
        
        this._pointerup(event);
        
        
        if(pointer.drag){
            document.body.style.cursor = "Default";
            this.handleDragEnd(event, pointer);
        } 
        
        if(!pointer.longpress && !pointer.drag)
            {
            clearTimeout(pointer.longclickTimeout);  
            this.handleClick(event, pointer); 
        }
        pointer.target.releasePointerCapture(event.pointerId);
        delete pointers[event.pointerId];

        //this.handlePointerUp(event, pointer);
    }
    
    private _handlePointercancel(event: PointerEvent): void
    {
        this._handlePointerup(event);
    }

    private _createPointer(event: PointerEvent): CustomPointer
    {
        event.preventDefault();
        let eventTarget = event.target instanceof Element ? event.target : document.body;

        let pointer: CustomPointer = {
            target: eventTarget.closest('[id*="diagram"]') || eventTarget,
            longpress: false,
            origin: {x: event.clientX, y: event.clientY},
            originalEvent: event,
            longclickTimeout: 0,
            drag: false,
            dropTargets: []
        };

        this._pointers[event.pointerId] = pointer;
        pointer.target.setPointerCapture(event.pointerId);
        pointer.longclickTimeout= setTimeout(()=>this._handleLongPress(event, pointer), 500);
        
        return pointer
    }

    private _pointerup(event: PointerEvent): void
    {
        let dropTargets = document.elementsFromPoint(event.clientX, event.clientY);
        let pointer = this._pointers[event.pointerId];
        
        for(let element of dropTargets)
        {
            let dropTarget = element.closest('[id*="diagram"]');
            if(dropTarget && dropTarget instanceof Element)
                pointer.dropTargets.push(dropTarget);
        }
    }
        
    protected handlePointerDown(event: PointerEvent, pointer: CustomPointer){}
    protected handleDragStart(event: PointerEvent, pointer: CustomPointer){}
    protected handleDrag(event: PointerEvent, pointer: CustomPointer){}
    protected handlePointerMove(event: PointerEvent, pointer: CustomPointer){}
    protected handleDragEnd(event: PointerEvent, pointer: CustomPointer){}
    protected handleClick(event: PointerEvent, pointer: CustomPointer){}
    protected handlePointerUp(event: PointerEvent, pointer: CustomPointer){}
    protected handleLongPress(event: PointerEvent, pointer: CustomPointer){}
}
    
    
export default MouseEvent;
