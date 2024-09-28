import { CustomPointer } from "./MouseEvent.js";
import zoomHandler from "./main.js";

type Distance = {x: number, y: number, sum: number};

let initDistance: Distance = {x: 0, y: 0, sum: 0};
let center = {x: 0, y: 0};
const SMOOTHING_FACTOR = 0.01;


export function startpinch(pointers: {[key: string]: CustomPointer})
{
    let pointerarr = Object.keys(pointers);

    let pointer1 = pointers[pointerarr[0]];
    let pointer2 = pointers[pointerarr[1]];

    initDistance.x = pointer2.originalEvent.clientX - pointer1.originalEvent.clientX;
    initDistance.y = pointer2.originalEvent.clientY - pointer1.originalEvent.clientY;
    initDistance.sum = _distance(pointer1, pointer2);

    center.x = pointer1.originalEvent.clientX + initDistance.x/2;
    center.y = pointer1.originalEvent.clientY + initDistance.y/2;
}

export function pinch(pointers: {[key: string]: CustomPointer})
{
    let pointerarr = Object.keys(pointers);
    let pointer1 = pointers[pointerarr[0]];
    let pointer2 = pointers[pointerarr[1]];
    
    let currentDistance: Distance = {x: 0, y: 0, sum: 0};
    currentDistance.x = pointer2.originalEvent.clientX - pointer1.originalEvent.clientX;
    currentDistance.y = pointer2.originalEvent.clientY - pointer1.originalEvent.clientY;
    currentDistance.sum = _distance(pointer1, pointer2);

    let distanceOffset = 1;
    initDistance.sum < currentDistance.sum ? distanceOffset = 1 - SMOOTHING_FACTOR : distanceOffset = 1 + SMOOTHING_FACTOR;  
    
    initDistance.x *= distanceOffset;
    initDistance.y *= distanceOffset;
    initDistance.sum *= distanceOffset;

    let scale = initDistance.sum  / currentDistance.sum;
    
    zoomHandler.setScale(scale, center);

    initDistance.x = currentDistance.x;
    initDistance.y = currentDistance.y;
    initDistance.sum = currentDistance.sum;
}

export function endpinch(pointers: {[key: string]: CustomPointer})
{

}

function _distance(pointer1: CustomPointer, pointer2: CustomPointer): number
{
    let distance = {x: 0, y:0};
    distance.x = Math.abs(pointer1.originalEvent.clientX - pointer2.originalEvent.clientX);
    distance.y = Math.abs(pointer1.originalEvent.clientY - pointer2.originalEvent.clientY);
    return Math.sqrt(Math.pow(distance.x, 2) + Math.pow(distance.y, 2));
}


