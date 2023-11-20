import draw, { toggel_debuginfo } from "./draw.js";
import { scroll_to_selection, select_view } from "./select.js";
import { diagview } from "./diagramview.js";
import { grid_to_pos, size, grid_size } from "./grid.js";
import Tableview from "./tableview.js";
import LineView from "./lineview.js";
import ContainerView from "./containerview.js";
import zoomHandler from "./Zoom.js";
import { Type, typeMap} from "./Types.js";

//inverses the current state of debug information visibility
export function toggle_debug()
{
    toggel_debuginfo();
    draw();
}

/*=================================
 *Functions to interact with diagram elements 
 *=================================*/
 export function set_start (id)
 {
    diagview.set_start(id);   
    draw();
 }

 export function select_element(id, bool = true)
 {
    let element = _try_get(id);
    if(!element) return;
    diagview.select(id, bool);
    draw();
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

/*
* Register MetaModel in Diagram
* pTypeId - ID used to identify the type (i.e. when creating new elements or containers)
* pTypeLabel - Label of the Type (i.e. "Start", "Akteur", "Anlegen/Abschlie�en")
* pTypeLine - Line style choose from "line", "line-dashed", "line-arrowed", "line-dashed-arrowed"
* pTypeIcon64 - Base64encoded Icon in PNG-Format (optional)
* Remember: Relationships do not support icons but linestyle. Linestyle of elements and
* containers should be set to "solid".
*/

export function register_type(pTypeId, pTypeLabel, pTypeLine, pTypeIcon64)
{
    let cleanId = _cleanType(pTypeId);
    let type = new Type(cleanId, pTypeLabel, pTypeLine, pTypeIcon64);
    typeMap.set(type.id, type);
    draw();
}

/*
* Set a margin for the fully visible diagram section to specify the currently visible section 
* and use it to move the center point. All parameters are percentages of the fully visible 
* section of the diagram.
* Example: The value 0 means no border, 50 means that half of the visible diagram section 
* serves as border.
* pTopRatio - Margin from the top in percentage 
* pRightRatio - Margin from the right in percentage
* pBottomRatio - Margin from the bottom in percentage
* pLeftRatio - Margin from the left in percentage
*/
export function set_visible_range_margin(pTopRatio,  pRightRatio, pBottomRatio, pLeftRatio)
{
	zoomHandler.set_viewport_margin(pTopRatio/100, pBottomRatio/100, pLeftRatio/100, pRightRatio/100);
    let diagram_empty = diagview.elements.size <= 0;
    if(!diagram_empty) scroll_to_selection();
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

 export function add_element(id, title, pTypeId, x, y, containerId, start = false)
{
    x = grid_to_pos(x);
    y = grid_to_pos(y);
    if(start)
    {
        set_start(id);
    }
    let container = diagview.get_container(containerId);
    let cleanTypeId = _cleanType(pTypeId);
    let tableview = new Tableview(id, title, cleanTypeId, x, y, size/2, size/2, container);
    if(container)
    {
        container.add(tableview);
    }
    diagview.add_element(tableview);
    select_view(tableview);
    draw();
}

export function add_container(id, title, pTypeId, x, y, width, height, containerId)
{
    x = grid_to_pos(x);
    y = grid_to_pos(y);
    let container = diagview.get_container(containerId);
    let cleanTypeId = _cleanType(pTypeId);
    let element = new ContainerView(id, title, cleanTypeId, x, y, grid_size(width), grid_size(height), container);
    if(container)
    {
        container.add(element);
    }
    diagview.add_element(element);
    draw();
}

export function add_relation(pId, pTitle, pTypeId, pStartId, pEndId, pBendPoints = [])
{
    let cleanTypeId = _cleanType(pTypeId);
    for(let bendPoint of pBendPoints)
    {
        bendPoint.x = grid_to_pos(bendPoint.x);
        bendPoint.y = grid_to_pos(bendPoint.y);
        
    }
    let line = new LineView(pId, pStartId, pEndId, cleanTypeId, pTitle, pBendPoints);

    diagview.add_element(line);
    draw();
}

export function set_title(id, title)
{
    let element = _try_get(id);
    element.title = title;
    draw();
}

export function add_to_container(id, containerid)
{
	 let element = _try_get(id);
     let container = _try_get(containerid);
     if(!element || !container) throw new Error("element or container with id " + id + " not found.");
     container.add(element);
     element.container = container;
}

export function remove_from_container(id, containerid)
{
	 let element = _try_get(id);
     let container = _try_get(containerid);
     container.remove(element);
     element.container = null;
}

function _try_get(id)
{  
    let element = diagview.get_element(id);
    if(!element) throw new Error("element with id " + id + " not found.");
    return element;
}

function _cleanType(typeIdString)
{
    typeIdString = typeIdString.replace(/\s/g, '');
    typeIdString = "c_"+typeIdString;
    return typeIdString;
}