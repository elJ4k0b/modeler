import zoomHandler from "./Zoom.js";

let initDistance = {};
let center = {};
const SMOOTHING_FACTOR = 0.01;

export function startpinch(pointers)
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

export function pinch(pointers)
{
    let pointerarr = Object.keys(pointers);
    let pointer1 = pointers[pointerarr[0]];
    let pointer2 = pointers[pointerarr[1]];
    
    let currentDistance = {};
    currentDistance.x = pointer2.originalEvent.clientX - pointer1.originalEvent.clientX;
    currentDistance.y = pointer2.originalEvent.clientY - pointer1.originalEvent.clientY;
    currentDistance.sum = _distance(pointer1, pointer2);

    let distanceOffset = 1;
    initDistance.sum < currentDistance.sum ? distanceOffset = 1- SMOOTHING_FACTOR : distanceOffset = 1 + SMOOTHING_FACTOR;  
    
    initDistance.x *= distanceOffset;
    initDistance.y *= distanceOffset;
    initDistance.sum *= distanceOffset;

    let scale = initDistance.sum  / currentDistance.sum;
    
    zoomHandler.setScale(scale, center);

    initDistance.x = currentDistance.x;
    initDistance.y = currentDistance.y;
    initDistance.sum = currentDistance.sum;
}

export function endpinch()
{

}

function _distance(pointer1, pointer2)
{
    let distance = {};
    distance.x = Math.abs(pointer1.originalEvent.clientX - pointer2.originalEvent.clientX);
    distance.y = Math.abs(pointer1.originalEvent.clientY - pointer2.originalEvent.clientY);
    return Math.sqrt(Math.pow(distance.x, 2) + Math.pow(distance.y, 2));
}


