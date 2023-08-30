const SCALING_CONSTANT = 0.0005;
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
            //newTransformOrigin = this._calculateOrigin(event);
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
    _zoom(matrix, delta, e)
    {
        let newZoom = this.zoomFactor;
        let eventRegistry = this.eventRegistry;
        let center = this.viewportCenter;

        //calculate zoom factor
        delta *= -SCALING_CONSTANT;
        newZoom += delta;
        
        if(newZoom < MIN_ZOOM || newZoom > MAX_ZOOM) return matrix;
        matrix.a = newZoom;
        matrix.d = newZoom;

        //apply offset
        let xs = (e.clientX - center.x) / this.zoomFactor;
        let ys = (e.clientY - center.y) / this.zoomFactor;
        
        center.x = e.clientX - xs * newZoom;
        center.y = e.clientY - ys * newZoom;

        this.viewportCenter.x = center.x;
        this.viewportCenter.y = center.y;

        matrix.e = center.x -50000;
        matrix.f = center.y -50000;

        this.zoomFactor = newZoom;
        return matrix;
    } 

    _calculateOrigin(event)
    {
        let mousePosX = event.pageX;
        let mousePosY = event.pageY;

        let rect = this.viewport.getBoundingClientRect();
        let offsetX = (mousePosX - rect.left + window.scrollX) / rect.width * 100;
        let offsetY = (mousePosY - rect.top + window.scrollY) / rect.height * 100;

        this.lastMousePosX = mousePosX;
        this.lastMousePosY = mousePosY;
      
        return `${offsetX}% ${offsetY}%`;
    }

    _applyMatrix(element, matrix)
    {
        element.setAttribute("transform", matrix.toString());
        element.style.transform = matrix.toString();
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
        
        stepsize.x = Math.abs(stepsize.x) * Math.sign(dist.x); 
        stepsize.y = Math.abs(stepsize.y) * Math.sign(dist.y);
        

        if(Math.abs(matrix.e - target.x) > Math.abs(stepsize.x) )
        { 
            matrix = this._horizontalScroll(matrix, stepsize.x);
        }
        else
        {
            matrix = this._horizontalScroll(matrix, matrix.e - target.x);
        }
        if(Math.abs(matrix.f - target.y) > Math.abs(stepsize.y))
        {
            matrix = this._verticalScroll(matrix, stepsize.y);
        } 
        else
        {
            matrix = this._verticalScroll(matrix, matrix.f - target.y);
        }

        this._applyMatrix(this.viewport, matrix);
        

        //break if nothing happens
        let currDist = {x: matrix.e - target.x, y: matrix.f - target.y};
        if(dist.x == currDist.x && dist.y == currDist.y)
        {
            this.scrolling = false;
            return;
        }
        requestAnimationFrame(() => {this._scroll(stepsize, currDist)});
    }

    scroll_smooth(target)
    {
        console.log("Target");
        console.log(target);
        let matrix = this._getMatrix(this.viewport);
        // let realDistX = (target.x + ((50000 + matrix.e))); 
        // let realDistY = (target.y + ((50000 + matrix.f)));

        // console.log(matrix.e);
        // console.log(matrix.f);

        // console.log("start target")
        // console.log(target);

        // console.log("realDist")
        // console.log(realDistX);
        // console.log(realDistY);
        // target = {x: matrix.e - realDistX, y: matrix.f - realDistY};

        // console.log("target")
        // console.log(target);

        console.warn(this.viewportCenter.x);
        

        let centerX = this.viewportCenter.x;
        let centerY = this.viewportCenter.y;
        console.log("center");
        console.log(this.viewportCenter.x);
        console.log(this.viewportCenter.y);


        console.log("matrix")
        console.log(matrix);
        
        let xs = target.x// + centerX);
        let ys = target.y// + centerY);

        console.log("offset");
        console.log(xs);
        console.log(ys);


        //console.log("target1");
        target = {x: matrix.e - xs, y: matrix.f - ys};
        console.log(target);



        let diffX = matrix.e*this.zoomFactor - target.x;
        let diffY = matrix.f*this.zoomFactor - target.y;
        //console.log("target2");
        console.log(target);

        



        let stepsize = {x: this.scrollSpeed, y: this.scrollSpeed};
        this.scrollTarget = target;
        //if(!this.scrolling) requestAnimationFrame(() => {this._scroll(stepsize, {x:diffX, y: diffY})});
        
    }
}

const zoomHandler = new ZoomHandler();

export default zoomHandler;