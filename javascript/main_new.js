import CustomEvents from "./MouseEventHandler.js";
import zoomHandler from "./Zoom.js";
import draw from "./draw.js";
import * as API from "./API.js";
function init()
{
    let viewport = document.getElementById("viewport");
    viewport.style.width = "100000px";
    viewport.style.height = "100000px";
    viewport.setAttribute("transform", "matrix(1, 0, 0, 1, -50000, -50000)");
    
    API.add_element("Hallo", "Hallo", "2", 2, 2);
    API.add_element("Hallo2", "Hallo","Test2", 3, 2);
    API.add_relation("Test", "Test", "OK", "Hallo", "Hallo2");
    API.add_container("container1", "Das hier ist ein längerer Titel", 1, 1, 8, 4, "");
    let events = new CustomEvents();
    draw();
    window.visualViewport.onresize = () => {
        draw();
    }
}
window.API = API;  
init();