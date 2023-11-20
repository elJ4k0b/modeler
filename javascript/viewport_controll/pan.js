import { Gesture } from "./gesture";
export class Pan extends Gesture
{
    /**
     * @param {ViewportController} viewport_controller 
     */
    constructor(viewport_controller)
    {
        super();
        this.viewport_controller = viewport_controller;
        this.panstart = {x: 0, y: 0};
    }
    start(pointers)
    {
        let start = {};
        start.x = this.point1.x;
        start.y = this.point1.y;

        this.panstart = start;
    }
    do(pointers)
    {
        super.do(pointers);
        let delta = {};
        delta.x = this.point1.x - panstart.x;
        delta.y = this.point1.y - panstart.y;
        
        panstart.x = this.point1.x;
        panstart.y = this.point1.y;
        
        let matrix = this.viewport_controller._getMatrix();
        matrix = this.viewport_controller._horizontalScroll(matrix, -delta.x);
        matrix = this.viewport_controller._verticalScroll(matrix, -delta.y);
        this.viewport_controller._applyMatrix(matrix, this.viewport_controller.viewport);
    }
    end(pointers)
    {
        super.end(pointers);
        this.panstart = {x: 0, y: 0};      
    }
}