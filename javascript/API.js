import draw from "./draw.js";
import { select, select_view } from "./select.js";
import { diagview } from "./diagramview.js";
import { grid_to_pos, size, grid_size } from "./grid.js";
import Tableview from "./tableview.js";
import LineView from "./lineview.js";
import ContainerView from "./containerview.js";

function init()
{
    diagview = new Diagramview();
    selected_tool = TOOLS.drag;
    document.getElementById("template").style.transform = ` scale(max(${1/visualViewport.scale}, 1)) translate(-50%, -100%)`;
    draw();
    document.addEventListener("mousemove", handle_mousemove);
    document.addEventListener("mouseup", handle_mouseup);
    
    window.visualViewport.onresize = () => {
        draw();
    }
    window.visualViewport.onscroll = () => {
        
        
    }
}



/*=================================
 *Functions to interact with diagram elements 
 *=================================*/
 function set_start (id)
 {
    diagview.set_start(id);   
 }

 function select_element(id, bool)
 {
    diagview.select_element(id, bool);
 }

 function lock_element(id)
 {
    diagview.lock(id);
    draw();
 }

 function get_element(id)
 {
    let hit = diagview.get_element(id);
    return hit;
 }


/*=================================
 *Functions to move diagram elements 
 *=================================*/
 

 export function move_element(id, x, y, grid = true)
{
    try {
        if(grid)
        {
            x = grid_to_pos(x);
            y = grid_to_pos(y);
        }
        diagview.get_tableview(id).move(x,y);
    }
    catch(error){
        move_container(id, x, y, false);
    }
    draw();
}

export function move_container(id, x, y, grid = true)
{
    if(grid)
    {
        x = grid_to_pos(x);
        y = grid_to_pos(y);
    }
    diagview.get_container(id).move(x,y);
    draw();
}


export function resize_conainer(id, width, height)
{
    if(diagview.get_container(id) == null) return;
    diagview.get_container(id).resize(grid_size(width), grid_size(height));
    draw();
}

/*=================================
 *Functions to add and remove diagram elements 
 *=================================
 */
 
 export function remove_element(id)
 {
     diagview.remove_element(id);
     draw();
 }

 export function add_element(id, title, type, x, y, containerId, start = false)
{
    x = grid_to_pos(x);
    y = grid_to_pos(y);
    if(start)
    {
        set_start(id);
    }
    let tableview = new Tableview(id, title, type, x, y, size, size);
    let container = diagview.get_container(containerId);
    if(container)
    {
        container.add(tableview);
    }
    diagview.add_element(tableview);
    select_view(tableview);
    draw();
}

export function add_container(id, title, x, y, width, height, containerId)
{
    x = grid_to_pos(x);
    y = grid_to_pos(y);
    let element = new ContainerView(id, title, "standard", x, y, grid_size(width), grid_size(height));
    let container = diagview.get_container(containerId);
    if(container)
    {
        container.add(element);
    }
    diagview.add_element(element);
    draw();
}

export function add_relation(pId, pStartId, pEndId, pType, pTitle)
{
    let line = new LineView(pId, pStartId, pEndId, pType, pTitle)
    diagview.add_element(line);
    draw();
}