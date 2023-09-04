import zoomHandler from "./Zoom.js";

let initDistance = {};

export function startpinch(pointers)
{
    console.log(pointers);
    let pointerarr = Object.keys(pointers);
    let pointer1 = pointerarr[0];
    let pointer2 = pointerarr[1];
    
    
    initDistance.x = Math.abs(pointer1.origin.x - pointer2.origin.x);
    initDistance.y = Math.abs(pointer1.origin.y - pointer2.origin.y);
}

export function pinch(pointers)
{
    let pointer1 = pointers[0];
    let pointer2 = pointers[1];
    let currentDistance = {};
    currentDistance.x = Math.abs(pointer2.originalEvent.clientX - pointer1.originalEvent.clientX);
    currentDistance.y = Math.abs(pointer2.originalEvent.clientY - pointer1.originalEvent.clientY);

    let scale = currentDistance.x / initDistance.x;

    let center = {};
    center.x = pointer1.originalEvent.clientX + currentDistance.x/2;
    center.y = pointer1.originEvent.clientY + currentDistance.y/2;

    zoomHandler.setScale(scale, center);
}

export function endpinch()
{

}


