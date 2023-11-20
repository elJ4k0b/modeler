class Scroll
{
    /**
     * @param {ViewportController} viewport_controller 
     */
    constructor(viewport_controller)
    {
        this.viewport_controller = viewport_controller;
    }

    /**
     * @param {Event} event 
     */
    scroll(event)
    {
        event.preventDefault();
        let viewport = this.viewport_controller.viewport;
        let currentViewportMatrix = this.viewport_controller._getMatrix(viewport);

        let scrollDelta = event.deltaY || event.detail || event.wheelDelta || 0;
        
        let newViewportMatrix = 0;
        let newTransformOrigin = viewport.style.transformOrigin;

        if(event.ctrlKey)
        {
            newViewportMatrix = this.viewport_controller._zoom(currentViewportMatrix, scrollDelta, event);
        }
        else if(event.shiftKey)
        {
            newViewportMatrix = this.viewport_controller._horizontalScroll(currentViewportMatrix, scrollDelta);
        }
        else
        {
            newViewportMatrix = this.viewport_controller._verticalScroll(currentViewportMatrix, scrollDelta);
        }

        this._applyMatrix(viewport, newViewportMatrix, newTransformOrigin);
    }
}

