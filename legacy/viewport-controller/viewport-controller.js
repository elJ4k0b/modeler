const SCALING_CONSTANT = 0.0005;
const DEFAULT_VIEWPORT_OFFSET = -50000;
const DEFAULT_VIEWPORT_DIMENSION = 100000;
const MAX_ZOOM = 4;
const MIN_ZOOM = 0.2;
const SCROLL_SPEED = 20;

export default class ViewportController
{
    /**
     * @param {HTMLElement} viewport 
     */
    constructor(viewport)
    {
        this.viewport = viewport;
        this.viewport.style.width = `${DEFAULT_VIEWPORT_DIMENSION}px`;
        this.scale = 1;
        //Used for calculating transform center
        this.viewport_center = {x: 0, y: 0};

    }

    _horizontalScroll(matrix, delta)
    {
        this.viewport_center.x -= delta;
        matrix.e -= delta; 
        return matrix;
    }

    _verticalScroll(matrix, delta)
    {
        this.viewport_center.y -= delta;
        matrix.f -= delta;
        return matrix;
    }
    _zoom(matrix, delta, event, fixed = false)
    {
        let newZoom = this.zoomFactor;
        let center = this.viewport_center;

        //calculate zoom factor
        if(!fixed)
        {
            delta *= -SCALING_CONSTANT;
            newZoom += delta;
        }
        else
        {
            newZoom = delta;
        }
        
        newZoom = Math.min(MAX_ZOOM, Math.max(newZoom, MIN_ZOOM))
        matrix.a = newZoom;
        matrix.d = newZoom;

        //apply offset
        let xs = (event.clientX - center.x) / this.zoomFactor;
        let ys = (event.clientY - center.y) / this.zoomFactor;
        
        center.x = event.clientX - xs * newZoom;
        center.y = event.clientY - ys * newZoom;

        this.viewport_center.x = center.x;
        this.viewport_center.y = center.y;

        matrix.e = center.x + DEFAULT_VIEWPORT_OFFSET;
        matrix.f = center.y + DEFAULT_VIEWPORT_OFFSET;

        this.zoomFactor = newZoom;
        return matrix;
    }
    _applyMatrix(matrix, element = this.viewport)
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
    
    _getMatrix(element = this.viewport)
    {
        let viewportTransform = element.getAttribute("transform") || new WebKitCSSMatrix();
        let currentViewportMatrix = new WebKitCSSMatrix(viewportTransform);
        return currentViewportMatrix;
    }

    scrollTo(target, smooth = true)
    {
        let targetCenter = {};
        targetCenter.x = this.viewport_center.x;
        targetCenter.y = this.viewport_center.y;

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
        stepsize.x = smooth? SCROLL_SPEED : dist.x;
        stepsize.y = smooth? SCROLL_SPEED : dist.y; 

        this.scrollTarget = target;
        if(!this.scrolling) requestAnimationFrame(() => {this._scroll(stepsize, dist)});
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

        this._applyMatrix(matrix, this.viewport);
        

        //break if nothing happens
        if(dist.x == currentDistance.x && dist.y == currentDistance.y)
        {
            this.scrolling = false;
            return;
        }
        requestAnimationFrame(() => {this._scroll(stepsize, currentDistance)});
    }

    setScale(scale, center)
    {
        scale = (this.zoomFactor) / scale;
        
        let eventDummy = {};
        eventDummy.clientX = center.x;
        eventDummy.clientY = center.y;
        
        let matrix =  this._getMatrix(this.viewport);
        matrix = this._zoom(matrix, scale, eventDummy, true);
        this._applyMatrix(matrix, this.viewport);
    }

    _scale()
    {

    }
}