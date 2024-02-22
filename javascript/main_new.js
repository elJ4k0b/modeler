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
    
    // API.add_element("Hallo", "Frau Meyer","Beraten/Erläutern", 2, 3);
    // API.add_element("Hallo2", "Hornbach AG","Externer Akteur", 3, 2);
    // API.add_element("Hallo3", "Finanzen","Bezahlen", 4, 2);
    // API.add_element("Hallo4", "Geschäftsführer","Informieren", 5, 2);
    // API.add_element("Hallo5", "Herr Peter","Ablegen/Abschließen", 3, 4);
    // API.add_element("Hallo6", "Bauhaus GMBH","Externer Akteur", 5, 4);
    // API.add_relation("Line", "Test", "line-dashed-arrowed", "Hallo", "Hallo2");
    // API.add_relation("Line1", "Test", "line-dashed", "Hallo2", "Hallo3");
    // API.add_relation("Line2", "Test", "line-arrowed", "Hallo3", "Hallo4");
    // API.add_relation("Line3", "Test", "line-arrowed", "Hallo", "Hallo5");
    // API.add_relation("Line4", "Test", "line", "Hallo5", "Hallo6");
    // API.add_container("container1", "Das hier ist ein längerer Titel", "Type", 1, 1, 8, 4, "");
    // API.add_to_container("Hallo", "container1");
    // API.add_to_container("Hallo2", "container1");
    // API.add_to_container("Hallo3", "container1");
    // API.add_to_container("Hallo4", "container1");
    // API.add_to_container("Hallo5", "container1");
    // API.add_to_container("Hallo6", "container1");
//     API.add_element("Hallo", "Title", "Type", 3, 3, 1, 1);
    let events = new CustomEvents();
    draw();
    window.visualViewport.onresize = () => {
        draw();
    }
}
window.API = API;  
init();