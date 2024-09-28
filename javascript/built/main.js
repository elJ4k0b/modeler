import CustomEvents from "./MouseEventHandler.js";
import draw from "./draw.js";
import * as API from "./API.js";
import ZoomHandler from "./Zoom.js";
function init() {
    const viewport = document.createElement("div");
    viewport.setAttribute("id", "viewport");
    viewport.style.width = "100000px";
    viewport.style.height = "100000px";
    viewport.setAttribute("transform", "matrix(1, 0, 0, 1, -50000, -50000)");
    const lineContainer = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    ;
    lineContainer.setAttribute("id", "lines");
    lineContainer.setAttribute("width", "100%");
    lineContainer.setAttribute("height", "100%");
    lineContainer.setAttribute("tabindex", "-1");
    lineContainer.style.position = "absolute";
    lineContainer.style.zIndex = "2";
    lineContainer.style.pointerEvents = "none";
    lineContainer.style.width = "100%";
    lineContainer.style.height = "100%";
    const lineLabelContainer = document.createElementNS("http://www.w3.org/2000/svg", "text");
    lineLabelContainer.setAttribute("id", "line-labels");
    lineLabelContainer.setAttribute("dy", "-20");
    const overlayContainer = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    overlayContainer.setAttribute("id", "overlay");
    overlayContainer.setAttribute("min-width", "100vw");
    overlayContainer.setAttribute("min-height", "100vh");
    overlayContainer.setAttribute("fill", "none");
    overlayContainer.style.position = "absolute";
    overlayContainer.style.zIndex = "5";
    overlayContainer.style.pointerEvents = "none";
    overlayContainer.style.width = "100%";
    overlayContainer.style.height = "100%";
    const canvas = document.createElement("div");
    canvas.setAttribute("id", "canvas");
    lineContainer.appendChild(lineLabelContainer);
    viewport.appendChild(lineContainer);
    viewport.appendChild(overlayContainer);
    viewport.appendChild(canvas);
    document.body.appendChild(viewport);
    let events = new CustomEvents();
    draw();
    if (window.visualViewport) {
        window.visualViewport.onresize = () => {
            draw();
        };
    }
}
init();
// @ts-ignore
window.API = API;
const zoomHandler = new ZoomHandler();
export default zoomHandler;
