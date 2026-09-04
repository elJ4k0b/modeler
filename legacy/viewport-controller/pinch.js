import { Gesture } from "./gesture.js";

const SMOOTHING_FACTOR = 0.01;
export class Pinch extends Gesture
{
    /**
     * 
     * @param {ViewportController} viewport_controller 
     */
    constructor(viewport_controller)
    {
        this.initial_distance = {x: 0, y: 0, sum:0};
        this.pinch_center = {x: 0, y: 0, sum: 0};
        this.viewport_controller = viewport_controller;
    }
    start()
    {
        initial_distance.x = this.point2.x - this.point1.x;
        initial_distance.y = this.point2.y - this.point1.y;
        initial_distance.sum = _distance(this.point1, this.point2);

        this.pinch_center.x = this.point1.y + initial_distance.x/2;
        this.pinch_center.y = this.point1.y + initial_distance.y/2;
    }
    do(pointers)
    {
        super.do(pointers);
        let current_distance = {};
        current_distance.x = this.point2.x - this.point1.x;
        current_distance.y = this.point2.y - this.point1.y;
        current_distance.sum = _distance(this.point1, this.point2);

        //used to relatively modify the reference point of the distance calculation
        let distance_offset = 1;
        initial_distance.sum < current_distance.sum ? 
            distance_offset = 1 - SMOOTHING_FACTOR : distance_offset = 1 + SMOOTHING_FACTOR;  
        
        initial_distance.x *= distance_offset;
        initial_distance.y *= distance_offset;
        initial_distance.sum *= distance_offset;

        let scale = initial_distance.sum  / current_distance.sum;
        
        
        initial_distance.x = current_distance.x;
        initial_distance.y = current_distance.y;
        initial_distance.sum = current_distance.sum;

        this.viewport_controller.setScale(scale, this.pinch_center);
    }
    end(pointers)
    {
        super.end(pointers);
        initial_distance = {x: 0, y: 0, sum:0};
        this.pinch_center = {x: 0, y: 0, sum: 0};
    }
    _distance(point1, point2)
    {
        let distance = {};
        distance.x = Math.abs(point1.x - point2.x);
        distance.y = Math.abs(point1.y - point2.y);
        return Math.sqrt(Math.pow(distance.x, 2) + Math.pow(distance.y, 2));
    }
}



