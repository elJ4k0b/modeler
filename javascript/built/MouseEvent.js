import { log } from "./Log.js";
class MouseEvent {
    constructor() {
        document.addEventListener("pointerdown", (event) => {
            try {
                this._handlePointerDown(event);
            }
            catch (error) {
                log(`${error}`, "warning");
            }
        });
        document.addEventListener("pointermove", (event) => {
            try {
                this._handlePointermove(event);
            }
            catch (error) {
                log(`${error}`, "warning");
            }
        });
        document.addEventListener("pointerup", (event) => {
            try {
                this._handlePointerup(event);
            }
            catch (error) {
                log(`${error}`, "warning");
            }
        });
        document.addEventListener("pointercancel", (event) => {
            try {
                this._handlePointercancel(event);
            }
            catch (error) {
                log(`${error}`, "warning");
            }
        });
        this._pointers = {};
    }
    _handlePointerDown(event) {
        event.preventDefault();
        let pointer = this._createPointer(event);
        this.handlePointerDown(event, pointer);
    }
    _handlePointermove(event) {
        event.preventDefault();
        let pointer = this._pointers[event.pointerId];
        if (!pointer)
            return;
        let movementDelta = { x: 0, y: 0 };
        movementDelta.x = pointer.origin.x - event.clientX;
        movementDelta.y = pointer.origin.y - event.clientY;
        pointer.originalEvent = event;
        if (!pointer.drag) {
            if (Math.abs(movementDelta.x) > 10 || Math.abs(movementDelta.y) > 10) {
                pointer.drag = true;
                clearTimeout(pointer.longclickTimeout);
                document.body.style.cursor = "grabbing";
                this.handleDragStart(event, pointer);
            }
        }
        else {
            this.handleDrag(event, pointer);
        }
        this.handlePointerMove(event, pointer);
    }
    _handleLongPress(event, pointer) {
        pointer.longpress = true;
        this.handleLongPress(event, pointer);
    }
    _handlePointerup(event) {
        event.preventDefault();
        let pointers = this._pointers;
        let pointer = pointers[event.pointerId];
        this._pointerup(event);
        if (pointer.drag) {
            document.body.style.cursor = "Default";
            this.handleDragEnd(event, pointer);
        }
        if (!pointer.longpress && !pointer.drag) {
            clearTimeout(pointer.longclickTimeout);
            this.handleClick(event, pointer);
        }
        pointer.target.releasePointerCapture(event.pointerId);
        delete pointers[event.pointerId];
        //this.handlePointerUp(event, pointer);
    }
    _handlePointercancel(event) {
        this._handlePointerup(event);
    }
    _createPointer(event) {
        event.preventDefault();
        let eventTarget = event.target instanceof Element ? event.target : document.body;
        let pointer = {
            target: eventTarget.closest('[id*="diagram"]') || eventTarget,
            longpress: false,
            origin: { x: event.clientX, y: event.clientY },
            originalEvent: event,
            longclickTimeout: 0,
            drag: false,
            dropTargets: []
        };
        this._pointers[event.pointerId] = pointer;
        pointer.target.setPointerCapture(event.pointerId);
        pointer.longclickTimeout = setTimeout(() => this._handleLongPress(event, pointer), 500);
        return pointer;
    }
    _pointerup(event) {
        let dropTargets = document.elementsFromPoint(event.clientX, event.clientY);
        let pointer = this._pointers[event.pointerId];
        for (let element of dropTargets) {
            let dropTarget = element.closest('[id*="diagram"]');
            if (dropTarget && dropTarget instanceof Element)
                pointer.dropTargets.push(dropTarget);
        }
    }
    handlePointerDown(event, pointer) { }
    handleDragStart(event, pointer) { }
    handleDrag(event, pointer) { }
    handlePointerMove(event, pointer) { }
    handleDragEnd(event, pointer) { }
    handleClick(event, pointer) { }
    handlePointerUp(event, pointer) { }
    handleLongPress(event, pointer) { }
}
export default MouseEvent;
