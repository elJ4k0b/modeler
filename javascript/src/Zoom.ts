import { log } from "./Log.js";

const SCALING_CONSTANT = 0.0005;
const DEFAULT_VIEWPORT_OFFSET = -50000;
const MAX_ZOOM = 4;
const MIN_ZOOM = 0.2;
const SCROLL_SPEED = 20;

type Bounds = {top: number, left: number, right: number, bottom: number};
type Point = {x: number, y: number};
type EventDummy = {clientX: number, clientY: number};

class ZoomHandler
{
    public zoomFactor: number = 1;
    public scrollSpeed: number = SCROLL_SPEED;
    public viewportCenter: Point;  //used to calculate transform origin
    private scrolling: boolean = false;
    private scrollTarget: Point; 
    private panstart: Point;
    private viewportMargins : Bounds;
    
    public viewport: HTMLElement;
    
    constructor()
    {
        this.zoomFactor = 1;
        if(!document.getElementById("viewport"))
            log("Fatal: Viewport does not exitst panning and scrolling is disabled", "error");
        
        this.viewport = document.getElementById("viewport") || document.createElement("div");
        this.viewport.addEventListener("wheel", (event) => this.handleWheel(event));
        this.scrollSpeed = SCROLL_SPEED;
        this.viewportMargins = {top: 0, left: 0, bottom: 0, right: 0};
        this.viewportCenter = {x: 0, y: 0};
        this.scrollTarget = {x: 0, y: 0};
        this.panstart = {x: 0, y: 0};
    }

    handleWheel(event: WheelEvent)
    {
        event.preventDefault();
        let viewport = this.viewport;
        let currentViewportMatrix = this._getMatrix(viewport);

        // @ts-ignore
        let scrollDelta = event.deltaY || event.detail || event.wheelDelta || 0;
        
        let newViewportMatrix: DOMMatrix;

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

        this._applyMatrix(viewport, newViewportMatrix);
    }

    _horizontalScroll(matrix: WebKitCSSMatrix, delta: number)
    {
        this.viewportCenter.x -= delta;
        matrix.e -= delta; 
        return matrix;
    }

    _verticalScroll(matrix: WebKitCSSMatrix, delta: number)
    {
        this.viewportCenter.y -= delta;
        matrix.f -= delta;
        return matrix;
    }
    _zoom(matrix: WebKitCSSMatrix, delta: number, event: EventDummy, fixed = false)
    {
        let newZoom = this.zoomFactor;
        let center = this.viewportCenter;

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

        this.viewportCenter.x = center.x;
        this.viewportCenter.y = center.y;

        matrix.e = center.x + DEFAULT_VIEWPORT_OFFSET;
        matrix.f = center.y + DEFAULT_VIEWPORT_OFFSET;

        this.zoomFactor = newZoom;
        return matrix;
    }
    _applyMatrix(element: HTMLElement, matrix: WebKitCSSMatrix)
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
    
    _getMatrix(element: HTMLElement)
    {
        let viewportTransform = element.getAttribute("transform") || new WebKitCSSMatrix();
        let currentViewportMatrix = new WebKitCSSMatrix(viewportTransform.toString());
        return currentViewportMatrix;
    }

    _round(number: number, resolution: number)
    {
        return Math.round(number * resolution) / resolution;
    }

    _scroll(stepsize: Point, dist: Point)
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

    scrollTo(target: Point, smooth = true)
    {
        let targetCenter: Point = {x: 0, y: 0};
        targetCenter.x = this.viewportCenter.x; 
        targetCenter.y = this.viewportCenter.y;

        let margin = this.getMargin(); 

        let windowCenter: Point = {x: 0, y: 0};
        windowCenter.x = (window.innerWidth + margin.left - margin.right) / 2;
        windowCenter.y = (window.innerHeight + margin.top - margin.bottom) / 2;

        targetCenter.x = windowCenter.x - target.x * this.zoomFactor;
        targetCenter.y = windowCenter.y - target.y * this.zoomFactor;

        target.x = targetCenter.x + DEFAULT_VIEWPORT_OFFSET;
        target.y = targetCenter.y + DEFAULT_VIEWPORT_OFFSET;

        let dist: Point = {x: 0, y: 0};
        dist.x = target.x - targetCenter.x;
        dist.y = target.y - targetCenter.y;

        //customize scrollspeed here
        let stepsize: Point = {x: 0, y: 0};
        smooth? stepsize.x = this.scrollSpeed: stepsize.x = dist.x;
        smooth? stepsize.y = this.scrollSpeed: stepsize.y = dist.y; 

        this.scrollTarget = target;
        if(!this.scrolling) requestAnimationFrame(() => {this._scroll(stepsize, dist)});
    }

    setScale(scale: number, center: Point)
    {
        let eventDummy: EventDummy = {clientX: 0, clientY: 0};
        eventDummy.clientX = center.x;
        eventDummy.clientY = center.y;

        let matrix =  this._getMatrix(this.viewport);

        scale = (this.zoomFactor) / scale;


        matrix = this._zoom(matrix, scale, eventDummy, true);
        this._applyMatrix(this.viewport, matrix);
    }

    start_pan(event: PointerEvent)
    {
        console.log("startpan");
        let start: Point = {x: 0, y: 0};
        start.x = event.clientX;
        start.y = event.clientY;

        this.panstart = start;

    }
    
    pan(event: PointerEvent)
    {
        console.log("pan");
        let delta: Point = {x: 0, y: 0};
        let matrix = this._getMatrix(this.viewport);
        delta.x = event.clientX - this.panstart.x;
        delta.y = event.clientY - this.panstart.y;
        
        this.panstart.x = event.clientX;
        this.panstart.y = event.clientY;
        
        matrix = this._horizontalScroll(matrix, -delta.x);
        matrix = this._verticalScroll(matrix, -delta.y);
        this._applyMatrix(this.viewport, matrix);
    }

    end_pan() {}
    
    set_viewport_margin(top: number, bottom: number, left: number, right: number)
    {
        if(top > 100 || bottom > 100 || left > 100 || right > 100)
        {
            log("Failed to set viewport margins - Margins must be set to percentages", "warning");
            return;
        } 
        this.viewportMargins = {top, bottom, left, right};
    }

    getMargin()
    {
        let margin: Bounds = {top: 0, bottom: 0, left: 0, right: 0};
        margin.top = window.innerHeight * this.viewportMargins.top;
        margin.bottom = window.innerHeight * this.viewportMargins.bottom;
        margin.left = window.innerWidth * this.viewportMargins.left;
        margin.right = window.innerWidth *this.viewportMargins.right;
        return margin;
    }

    getWindowDimension()
    {
        let margin = this.getMargin();
        let innerWidth = window.innerWidth - margin.left - margin.right;
        let innerHeight = window.innerHeight -  margin.top - margin.bottom;

        return {width: innerWidth, height: innerHeight};
    }
}

export default ZoomHandler;