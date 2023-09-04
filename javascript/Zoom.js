const SCALING_CONSTANT = 0.0005;
const DEFAULT_VIEWPORT_OFFSET = -50000;
const MAX_ZOOM = 4;
const MIN_ZOOM = 0.2;
const SCROLL_SPEED = 20;

class ZoomHandler
{
    constructor()
    {
        this.zoomFactor = 1;
        this.viewport = document.getElementById("viewport");
        this.viewport.addEventListener("wheel", (event) => this.handleWheel(event));
        this.scrollSpeed = SCROLL_SPEED;

        //Used for calculating transform center
        this.viewportCenter = {x: 0, y: 0};
    }

    handleWheel(event)
    {
        event.preventDefault();
        let viewport = this.viewport;
        let currentViewportMatrix = this._getMatrix(viewport);

        let scrollDelta = event.deltaY || event.detail || event.wheelDelta || 0;
        
        let newViewportMatrix = 0;
        let newTransformOrigin = viewport.style.transformOrigin;

        if(event.ctrlKey)
        {
            newViewportMatrix = this._zoom(currentViewportMatrix, scrollDelta, event);
        }
        else if(event.shiftKey)
        {
            newViewportMatrix = this._horizontalScroll(currentViewportMatrix, scrollDelta);
        }
        else
        {
            newViewportMatrix = this._verticalScroll(currentViewportMatrix, scrollDelta);
        }

        this._applyMatrix(viewport, newViewportMatrix, newTransformOrigin);
    }

    _horizontalScroll(matrix, delta)
    {
        this.viewportCenter.x -= delta;
        matrix.e -= delta; 
        return matrix;
    }

    _verticalScroll(matrix, delta)
    {
        this.viewportCenter.y -= delta;
        matrix.f -= delta;
        return matrix;
    }
    _zoom(matrix, delta, event)
    {
        let newZoom = this.zoomFactor;
        let center = this.viewportCenter;

        //calculate zoom factor
        delta *= -SCALING_CONSTANT;
        newZoom += delta;
        
        if(newZoom < MIN_ZOOM || newZoom > MAX_ZOOM) return matrix;
        matrix.a = newZoom;
        matrix.d = newZoom;

        //apply offset
        let xs = (event.clientX - center.x) / this.zoomFactor;
        let ys = (event.clientY - center.y) / this.zoomFactor;
        
        center.x = event.clientX - xs * newZoom;
        center.y = event.clientY - ys * newZoom;

        this.viewportCenter.x = center.x;
        this.viewportCenter.y = center.y;

        matrix.e = center.x -50000;
        matrix.f = center.y -50000;

        this.zoomFactor = newZoom;
        return matrix;
    }
    _applyMatrix(element, matrix)
    {
        try {
            element.setAttribute("transform", matrix.toString());
            element.style.transform = matrix.toString();
        }catch (error)
        {
            console.log(error);
            console.log(matrix);
        }
        
    }
    
    _getMatrix(element)
    {
        let viewportTransform = element.getAttribute("transform") || new WebKitCSSMatrix();
        let currentViewportMatrix = new WebKitCSSMatrix(viewportTransform);
        return currentViewportMatrix;
    }

    _round(number, resolution)
    {
        return Math.round(number * resolution) / resolution;
    }

    _scroll(stepsize, dist)
    {
        this.scrolling = true;

        let matrix = this._getMatrix(this.viewport);
        let target = this.scrollTarget;

        if(dist.x == 0 && dist.y == 0)
        {
            this.scrolling = false;
            return;
        }
        
        //Calculate scroll direction
        stepsize.x = Math.abs(stepsize.x) * Math.sign(dist.x); 
        stepsize.y = Math.abs(stepsize.y) * Math.sign(dist.y);

        let currentDistance = {x: matrix.e - target.x, y: matrix.f - target.y};
        

        if(Math.abs(currentDistance.x) > Math.abs(stepsize.x) )
        { 
            matrix = this._horizontalScroll(matrix, stepsize.x);
        }
        else
        {
            matrix = this._horizontalScroll(matrix, currentDistance.x);
        }

        if(Math.abs(currentDistance.y) > Math.abs(stepsize.y))
        {
            matrix = this._verticalScroll(matrix, stepsize.y);
        } 
        else
        {
            matrix = this._verticalScroll(matrix, currentDistance.y);
        }

        this._applyMatrix(this.viewport, matrix);
        

        //break if nothing happens
        if(dist.x == currentDistance.x && dist.y == currentDistance.y)
        {
            this.scrolling = false;
            return;
        }
        requestAnimationFrame(() => {this._scroll(stepsize, currentDistance)});
    }

    scrollTo(target, smooth = true)
    {
        let targetCenter = {};
        targetCenter.x = this.viewportCenter.x;
        targetCenter.y = this.viewportCenter.y;

        let windowCenter = {};
        windowCenter.x = window.innerWidth / 2;
        windowCenter.y = window.innerHeight / 2;

        targetCenter.x = windowCenter.x - target.x * this.zoomFactor;
        targetCenter.y = windowCenter.y - target.y * this.zoomFactor;

        target.x = targetCenter.x + DEFAULT_VIEWPORT_OFFSET;
        target.y = targetCenter.y + DEFAULT_VIEWPORT_OFFSET;

        let dist = {};
        dist.x = target.x - targetCenter.x;
        dist.y = target.y - targetCenter.y;

        //customize scrollspeed here
        let stepsize = {};
        smooth? stepsize.x = this.scrollSpeed: stepsize.x = dist.x;
        smooth? stepsize.y = this.scrollSpeed: stepsize.y = dist.y; 

        this.scrollTarget = target;
        if(!this.scrolling) requestAnimationFrame(() => {this._scroll(stepsize, dist)});
    }

    setScale(scale, center)
    {
        let eventDummy = {};
        eventDummy.clientX = center.x;
        eventDummy.clientY = center.y;

        let matrix =  this._getMatrix(this.viewport);
        let delta = scale - this.zoomFactor;
        this._zoom(matrix, delta, eventDummy);
    }

    start_pan(event)
    {
        console.log("startpan");
        let start = {};
        start.x = event.clientX;
        start.y = event.clientY;

        this.panstart = start;

    }

    end_pan()
    {

    }

    pan(event)
    {
        console.log("pan");
        let delta = {};
        let matrix = this._getMatrix(this.viewport);
        delta.x = event.clientX - this.panstart.x;
        delta.y = event.clientY - this.panstart.y;

        this.panstart.x = event.clientX;
        this.panstart.y = event.clientY;
        
        matrix = this._horizontalScroll(matrix, -delta.x);
        matrix = this._verticalScroll(matrix, -delta.y);
        this._applyMatrix(this.viewport, matrix);
    }
}

const zoomHandler = new ZoomHandler();

export default zoomHandler;