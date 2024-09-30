import draw, { toggel_debuginfo } from "./draw.js";
import { scroll_to_selection, select_view } from "./select.js";
import { diagview } from "./diagramview.js";
import { grid_to_pos, size, grid_size, pos_to_grid, grid_to_poscenter } from "./grid.js";
import Tableview from "./Tableview.js";
import LineView from "./lineview.js";
import ContainerView from "./containerview.js";
import zoomHandler from "./main.js";
import { Type, typeMap } from "./Types.js";
import { log } from "./Log.js";
//inverses the current state of debug information visibility
export function toggle_debug() {
    toggel_debuginfo();
    draw();
}
//empty diagram
export function clear_diagram(types = false) {
    try {
        diagview.reset();
        if (types)
            typeMap.clear();
        draw();
    }
    catch (error) {
        log(error, "warning");
    }
}
/*=================================
 *Functions to interact with diagram elements
 *=================================*/
export function highlight_container(id, bool = true) {
    try {
        diagview.highlight(id, bool);
        draw();
    }
    catch (error) {
        log(error, "warning");
    }
}
export function set_start(id, bool = true) {
    try {
        if (bool == false) {
            diagview.remove_start();
        }
        else {
            diagview.set_start(id);
        }
        draw();
    }
    catch (error) {
        log(error, "warning");
    }
}
export function select_element(id, bool = true) {
    try {
        let element = _try_get(id);
        if (!element)
            return;
        diagview.select(id, bool);
        draw();
    }
    catch (error) {
        log(error, "warning");
    }
}
function lock_element(id) {
    diagview.lock(id);
    draw();
}
function get_element(id) {
    let hit = diagview.get_element(id);
    return hit;
}
/*=================================
 *Functions to move diagram elements
 *=================================*/
export function move_element(id, x, y, grid = true) {
    try {
        if (grid) {
            x = grid_to_pos(x);
            y = grid_to_pos(y);
        }
        diagview.move(id, x, y);
        draw();
    }
    catch (error) {
        log(error, "warning");
    }
}
export function move_container(id, x, y, grid = true, content = false) {
    try {
        if (grid) {
            x = grid_to_pos(x);
            y = grid_to_pos(y);
        }
        if (!content) {
            let container = _try_get(id);
            if (!container)
                return;
            let content = [...container.children.values()];
            for (let element of content)
                container.remove(element);
            diagview.move(id, x, y);
            for (let element of content)
                container.add(element);
        }
        else {
            diagview.move(id, x, y);
        }
        draw();
    }
    catch (error) {
        log(error, "warning");
    }
}
//WARNING: Funktion macht keinen Sinn
// export function move_relation(id: string, pBendPoints = [])
// {
//     try {
//         let cleanTypeId = _cleanType(pTypeId);
//         for(let bendPoint of pBendPoints)
//         {
//             bendPoint.x = grid_to_poscenter(bendPoint.x);
//             bendPoint.y = grid_to_poscenter(bendPoint.y);
//         }
//         let line = new LineView(id, pStartId, pEndId, cleanTypeId, pTitle, pBendPoints);
//         diagview.add_element(line);
//         draw();
//     }catch(error)
//     {
//         log(error, "warning");
//     }
// }
export function resize_container(id, width, height) {
    try {
        let container = diagview.get_container(id);
        if (container == null)
            return;
        container.resize(grid_size(width), grid_size(height), container.position.left, container.position.top);
        draw();
    }
    catch (error) {
        log(error, "warning");
    }
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
export function register_type(pTypeId, pTypeLabel, pTypeLine, pTypeIcon64) {
    try {
        let cleanId = _cleanType(pTypeId);
        let type = new Type(cleanId, pTypeLabel, pTypeLine, pTypeIcon64);
        typeMap.set(type.id, type);
        draw();
    }
    catch (error) {
        log(error, "warning");
    }
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
export function set_visible_range_margin(pTopRatio, pRightRatio, pBottomRatio, pLeftRatio) {
    try {
        zoomHandler.set_viewport_margin(pTopRatio / 100, pBottomRatio / 100, pLeftRatio / 100, pRightRatio / 100);
        let diagram_empty = diagview.elements.size <= 0;
        if (!diagram_empty)
            scroll_to_selection();
    }
    catch (error) {
        log(error, "warning");
    }
}
/*=================================
 *Functions to add and remove diagram elements
 *=================================
 */
export function remove_element(id) {
    try {
        diagview.remove_element(id);
        draw();
    }
    catch (error) {
        log(error, "warning");
    }
}
export function add_element(id, title, pTypeId, x, y, containerId, start = false) {
    try {
        x = grid_to_pos(x);
        y = grid_to_pos(y);
        if (start) {
            set_start(id);
        }
        let container = diagview.get_container(containerId) || null;
        let cleanTypeId = _cleanType(pTypeId);
        let tableview = new Tableview(id, title, cleanTypeId, x, y, size / 2, size / 2, container);
        if (container) {
            container.add(tableview);
        }
        diagview.add_element(tableview);
        select_view(tableview);
        draw();
    }
    catch (error) {
        log(error, "warning");
    }
}
export function add_container(id, title, pTypeId, x, y, width, height, containerId) {
    try {
        x = grid_to_pos(x);
        y = grid_to_pos(y);
        let container = diagview.get_container(containerId) || null;
        let cleanTypeId = _cleanType(pTypeId);
        let element = new ContainerView(id, title, cleanTypeId, x, y, grid_size(width), grid_size(height), container);
        if (container) {
            container.add(element);
        }
        diagview.add_element(element);
        select_view(element);
        draw();
    }
    catch (error) {
        log(error, "warning");
    }
}
export function add_relation(pId, pTitle, pTypeId, pStartId, pEndId, pBendPoints = []) {
    try {
        let cleanTypeId = _cleanType(pTypeId);
        for (let bendPoint of pBendPoints) {
            bendPoint.x = grid_to_poscenter(bendPoint.x);
            bendPoint.y = grid_to_poscenter(bendPoint.y);
        }
        let line = new LineView(pId, pStartId, pEndId, cleanTypeId, pTitle, pBendPoints);
        diagview.add_element(line);
        draw();
    }
    catch (error) {
        log(error, "warning");
    }
}
export function set_title(id, title) {
    try {
        let element = _try_get(id);
        element.title = title;
        draw();
    }
    catch (error) {
        log(`${error}`, "warning");
    }
}
export function add_to_container(id, containerid) {
    try {
        let element = _try_get(id);
        let container = _try_get(containerid);
        if (!element || !container)
            throw new Error("element or container with id " + id + " not found.");
        container.add(element);
        element.container = container;
    }
    catch (error) {
        log(`${error}`, "warning");
    }
}
export function remove_from_container(id, containerid) {
    try {
        let element = _try_get(id);
        let container = _try_get(containerid);
        container.remove(element);
        element.container = null;
    }
    catch (error) {
        log(`${error}`, "warning");
    }
}
function _try_get(id) {
    try {
        let element = diagview.get_element(id);
        if (!element)
            throw new Error("element with id " + id + " not found.");
        try {
            return element;
        }
        catch (error) {
            return element;
        }
    }
    catch (error) {
        log(`${error}`, "warning");
        return {};
    }
}
function _cleanType(typeIdString) {
    typeIdString = typeIdString.replace(/\s/g, '');
    typeIdString = "c_" + typeIdString;
    return typeIdString;
}
/**
 * Callback Funktionen bei Interaktion mit Diagramm
 *
 * notify() bündelt die callback calls
 */
export function notify(type, args) {
    try {
        console.log(type);
        switch (type) {
            case "start":
                start_selected(args.id);
                break;
            case "move":
                content_moved(args.id, pos_to_grid(args.x), pos_to_grid(args.y));
                break;
            case "select":
                content_selected(args.id);
                break;
            case "start-deselect":
                start_deselected(args.id);
                break;
            case "content-deselect":
                content_deselected(args.id);
                break;
            case "highlight":
                content_highlighted(args.id);
                break;
            case "highlight-deselect":
                highlight_deselected(args.id);
                break;
            case "container-remove":
                content_removed_from_container(args.elementId, args.containerId);
                break;
            case "container-add":
                content_added_to_container(args.elementId, args.containerId);
                break;
            case "container-resize":
                container_resized(args.id, args.width / size, args.height / size);
        }
    }
    catch (error) {
        log(`${error}`, "warning");
    }
}
function content_selected(id) {
    log(`content ${id} was selected`, "info");
    // @ts-ignore
    B4A.CallSub('ContentSelected', true, id);
}
function start_selected(id) {
    log(`content ${id} is starting element`, "info");
    // @ts-ignore
    B4A.CallSub('CurrentSelected', true, id);
}
function content_moved(id, x, y) {
    log(`content ${id} moved to ${x}, ${y}`, "info");
    // @ts-ignore
    B4A.CallSub('ContentMoved', true, id, x, y);
}
function container_resized(id, w, h) {
    log(`content ${id} resized to ${w}, ${h}}`, "info");
    // @ts-ignore
    B4A.CallSub('ContainerResized', true, id, w, h);
}
function content_added_to_container(id, containerid) {
    log(`content ${id} added to container ${containerid}`, "info");
    // @ts-ignore
    B4A.CallSub('ContentAddedToContainer', true, id, containerid);
}
function content_removed_from_container(id, containerid) {
    //TODO: B4A.Callsub fehlt noch 
    log(`content ${id} removed from container ${containerid}`, "info");
}
function content_deselected(id) {
    log(`content ${id} was deselected`, "info");
    // @ts-ignore
    B4A.CallSub('ContentDeselected', true, id);
}
function start_deselected(id) {
    log(`start was removed from content ${id}`, "info");
    // @ts-ignore
    B4A.CallSub('StartDeselected', true, id);
}
function highlight_deselected(id) {
    log(`highlight was removed from content ${id}`, "info");
    // @ts-ignore
    B4A.CallSub('HighlightDeselected', true, id);
}
function content_highlighted(id) {
    log(`highlight was added to content ${id}`, "info");
    // @ts-ignore
    B4A.CallSub('HighlightSelected', true, id);
}
