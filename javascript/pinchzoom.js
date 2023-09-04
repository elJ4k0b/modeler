import zoomHandler from "./Zoom.js";
let dummyPointer = {};
let lastScale = 1;
        

let initDistance = {};
let center = {};

export function startpinch(pointers)
{
    let pointerarr = Object.keys(pointers);
    console.warn("startpinch");
    console.log(pointerarr);


    let pointer1 = pointers[pointerarr[0]];
    let pointer2 = pointers[pointerarr[1]];
    

    dummyPointer.originalEvent = {};
    dummyPointer.originalEvent.clientX = 0;
    dummyPointer.originalEvent.clientY = 0;

    dummyPointer.origin = {};
    dummyPointer.origin.x = 0;
    dummyPointer.origin.y = 0;

    //pointer2 = dummyPointer;


    let point1 = {x: pointer1.originalEvent.clientX, y: pointer1.originalEvent.clientY};
    let point2 = {x: pointer2.originalEvent.clientX, y: pointer2.originalEvent.clientY};


    lastScale = 1;

    initDistance.x = pointer2.originalEvent.clientX - pointer1.originalEvent.clientX;
    initDistance.y = pointer2.originalEvent.clientY - pointer1.originalEvent.clientY;
    initDistance.sum = _distance(point1, point2);

    center.x = pointer1.originalEvent.clientX + initDistance.x/2;
    center.y = pointer1.originalEvent.clientY + initDistance.y/2;

    let el = document.getElementById("Hallo");
    el.style.top = `${center.y }px`;
    el.style.left = `${center.x }px`;
}

export function pinch(pointers)
{
    let pointerarr = Object.keys(pointers);
    let pointer1 = pointers[pointerarr[0]];
    let pointer2 = pointers[pointerarr[1]];


    dummyPointer.originalEvent = {};
    dummyPointer.originalEvent.clientX = 0;
    dummyPointer.originalEvent.clientY = 0;

    dummyPointer.origin = {};
    dummyPointer.origin.x = 0;
    dummyPointer.origin.y = 0;
    //pointer2 = dummyPointer;
    
    let currentDistance = {};
    currentDistance.x = Math.abs(pointer2.originalEvent.clientX - pointer1.originalEvent.clientX);
    currentDistance.y = Math.abs(pointer2.originalEvent.clientY - pointer1.originalEvent.clientY);

    let point1 = {x: pointer1.originalEvent.clientX, y: pointer1.originalEvent.clientY};
    let point2 = {x: pointer2.originalEvent.clientX, y: pointer2.originalEvent.clientY};
    currentDistance.sum = _distance(point1, point2);
    console.log("pointer")
    console.log(pointer1);
    console.log(pointer2);

    console.log("distance")
    console.log(initDistance);
    console.log(currentDistance);
    
    let test = 0.01;
    initDistance.sum < currentDistance.sum ? test = 1-test : test = 1+test;  
    
    initDistance.x *= test;
    initDistance.y *= test;
    initDistance.sum *= test;

    console.log("updated init Distance");
    console.log(initDistance);
    
    let scale = initDistance.sum  / currentDistance.sum;
    console.log("raw scale")
    console.log(scale)
    //scale = (scale/lastScale);

    console.log("last scale")
    console.log(lastScale);
    //lastScale = scale;
    console.log("new scale");
    console.log(scale);
    zoomHandler.setScale(scale, center);


    initDistance.x = currentDistance.x;
    initDistance.y = currentDistance.y;
    initDistance.sum = currentDistance.sum;
}

export function endpinch()
{

}

function _distance(point1, point2)
{
    let distance = {};
    distance.x = Math.abs(point1.x - point2.x);
    distance.y = Math.abs(point1.y - point2.y);
    return Math.sqrt(Math.pow(distance.x, 2) + Math.pow(distance.y, 2));
}


