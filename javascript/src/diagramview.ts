import Tableview from "./Tableview.js";
import ContainerView from "./containerview.js";
import LineView from "./lineview.js";
import { notify } from "./API.js";
import { log } from "./Log.js";
import { DiagramElementView, View } from "./view.js";


class Diagramview {
    private selected_elements = new Map<string, View>();
    private prevStartElement: View | null;
    public startElement: View | null;
    private highlightedElement: View | null;
    public tableviews = new Map<string, Tableview>();
    public lineviews = new Map<string, LineView>();
    public containers = new Map<string, ContainerView>();
    public elements = new Map<string, View>();
    constructor()
    {
        this.tableviews = new Map();
        this.lineviews = new Map();
        this.containers = new Map();
        this.elements = new Map();
        this.selected_elements = new Map();
        this.prevStartElement = null;
        this.startElement  = null;
        this.highlightedElement = null;
    }
    reset()
    {
        this.tableviews = new Map();
        this.lineviews = new Map();
        this.containers = new Map();
        this.elements = new Map();
        this.selected_elements = new Map();
        this.prevStartElement = null;
        this.startElement  = null;
        this.highlightedElement = null;
    }

    set_start(id: string)
    {
        let element = this.elements.get(id);
        if(!element)
        {
            log("Cant set start element to undefined element", "error");
            return;
        }

        this.prevStartElement = this.startElement;
        this.startElement = element;

        notify("start", {id});
    }

    remove_start()
    {
        if(!this.startElement)
        {
            log("Start element ist already null", "warning");
            return;
        }
        notify("start-deselect", {id: this.startElement.id});
        this.startElement = null;
    }
    get_tableview(id: string)
    {
        
        let tableview  = this.tableviews.get(id);
        return tableview;
    }

    get_container(id: string)
    { 
        let container = this.containers.get(id);
        return container;
    }

    get_lineview(id: string)
    {
        let line = this.lineviews.get(id);
        return line;
    }
    
    get_element(id: string)
    {
        if(id == null){return};
        return this.elements.get(id);
    }

    add_element(element: View)
    {
        this.elements.set(element.id, element);
        try {
            switch(element.constructor)
            {
                case ContainerView:
                    const containerview = element as ContainerView
                    this.containers.set(element.id, containerview);
                    break;
                case LineView:
                    //TODO: Add containerviews as connection targets und sources
                    const lineview = element as LineView;
                    this.lineviews.set(element.id, lineview);

                    try {
                        let startpoint = this.get_tableview(lineview.startId)?.position;
                        let endpoint = this.get_tableview(lineview.endId)?.position;
    
                        if(!startpoint || !endpoint) throw new Error("Start and or endpoint are not defined");
                        let points = [{x: startpoint.left, y: startpoint.top}, {x: endpoint.left, y: endpoint.top}]
                        lineview.update(points);
                        break;
                    } catch (error) {
                        log(`Failed to update line with id ${lineview.id}`, "error")
                    }
                case Tableview:
                    const tableview = element as Tableview
                    this.tableviews.set(element.id, tableview);
                    break;
                default:
                    log(`Cannot add element of type ${element.constructor} to diagram`, "error");
                    break;
            }

        } catch (error) {
            log("Failed to add element to diagram", "error");
        }
        
    }

    move(id: string, x: number, y: number)
    {    
        let element = this.get_tableview(id) || this.get_container(id);
        if(!element) return;
        notify("move", {id, x, y});
        element.move(x, y);
    }

    remove_element(id: string)
    {      
        let element = this.elements.get(id);
        if (element == null)
        {
            log("Element to be removed does not exist", "warning");
            return
        }

        try {
            this.elements.delete(id);
            switch(element.constructor)
            {
                case ContainerView:
                    this.containers.delete(id);
                    break;
                case LineView:
                    this.lineviews.delete(id);
                    break;
                case Tableview:
                    this.tableviews.delete(id);
                    if(element == this.startElement)
                    {
                        notify("start-deselect", element.id);
                    }
                    //remove all lines that start or end in the deleted element
                    for(let line of this.lineviews.values())
                    {
                        if(line.startId == id ||line.endId == id)
                        {
                            this.lineviews.delete(line.id);
                        }
                    }
                    break;
                default:
                    log(`Can not remove element with type ${element.constructor}`, "warning");
                    break;
            }
        }
        catch(error)
        {
            log(`Failed to remove element with id ${id}`, "error");
        }
        
    }

    lock(id: string)
    {
        let element = this.tableviews.get(id);
        if(element)
        {
            element.lock();
            return;
        }
        console.error("Only table elements can be locked");       
    }

    highlight(id: string, bool: boolean = true)
    {
        let element = this.elements.get(id);
        if(!element)
        {
            log(`Element to be highlighted with id ${id} does not exist`, "warning");
            return
        }
        
        element.highlighted = bool;
        this.highlightedElement = bool ? element: null;
        let type  = bool? "highlight" : "highlight-deselect";

        notify(type, {id});
    }

    is_selected(id: string)
    {   
        return this.elements.get(id)?.selected;
    }
    select(id: string, bool: boolean)
    {   
        let element = this.elements.get(id);
        if(!element){return}
        
        if(bool)
        {
            this.selected_elements.set(id, element);
            notify("select", {id});  
        } 
        else if(!bool && element.selected)
        {
            notify("content-deselect", {id});
            this.selected_elements.delete(id);
        } 
        else this.selected_elements.delete(id);
        element.selected = bool;
    }

    removeFromCurrentContainer(elementId: string)
    {
        try {
            let element = this.get_element(elementId);
            let diagramElement = element as DiagramElementView;
            let currentContainer = diagramElement.container;
            if(!currentContainer) return;
            diagramElement.container = null;
            currentContainer.remove(diagramElement);

            notify("container-remove", {elementId: elementId, containerId: currentContainer.id})
        }
        catch(error)
        {
            log("Failed to remove element from conatiner - Element does either not exist or has no container", "error");
        }


    }

    addToContainer(elementId: string, containerId: string)
    {
        try {
            let container = this.get_container(containerId)
            let element = this.get_element(elementId);
            let diagramElement = element as DiagramElementView
            if(!container || !element) return;
            container.add(diagramElement);
            element.container = container;

            log("Succesfully added element to container", "info");
            notify("container-add", {elementId, containerId})
        }
        catch(error)
        {
            log("Failed to add element to conatiner - Element does either not exist or can not be added to container " + error, "error");
        }
    }

    get_selected_elements(): Array<View>
    {
        return Array.from(this.selected_elements.values());
    }

    drag(id: string, bool: boolean)
    {
        try {
            let element = this.elements.get(id);
            let diagramElement = element as DiagramElementView;
            diagramElement.dragged = bool;
        }
        catch(error)
        {
            log(`Failed activate drag on element with id ${id} - Element does either not exist or can not be dragged ${error}`, "error");
        }
    }
}

export const diagview = new Diagramview();