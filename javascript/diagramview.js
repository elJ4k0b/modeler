import Tableview from "./tableview.js";
import ContainerView from "./containerview.js";
import LineView from "./lineview.js";
import { notify } from "./API.js";
import { log } from "./Log.js";


class Diagramview {
    constructor()
    {
        this.tableviews = new Map();
        this.lineviews = new Map();
        this.containers = new Map();
        this.elements = new Map();
        this.changelog = new Array();
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
        this.changelog = new Array();
        this.selected_elements = new Map();
        this.prevStartElement = null;
        this.startElement  = null;
        this.highlightedElement = null;
    }

    set_start(id)
    {
        let element = this.elements.get(id);
        if(!element) console.warn("id " + id + " does not belong to a diagram element");
        this.prevStartElement = this.startElement;
        this.startElement = element;

        notify("start", {id});
    }

    remove_start()
    {
        notify("start-deselect", {id: this.startElement.id});
        this.startElement = null;
    }
    get_tableview(id)
    {
        
        let tableview  = this.tableviews.get(id);
        return tableview;
    }

    get_container(id)
    { 
        let container = this.containers.get(id);
        return container;
    }

    get_lineview(id)
    {
        let line = this.lineviews.get(id);
        return line;
    }
    
    get_element(id)
    {
        if(id == null){return};
        return this.elements.get(id);
    }

    add_element(element)
    {
        this.elements.set(element.id, element);
        switch(element.constructor)
        {
            case ContainerView:
                this.containers.set(element.id, element);
                break;
            case LineView:
                this.lineviews.set(element.id, element);
                let startpoint = this.get_tableview(element.startId).position;
                let endpoint = this.get_tableview(element.endId).position;
                if(!startpoint || !endpoint) return;
                let points = [{x: startpoint.left, y: startpoint.top}, {x: endpoint.left, y: endpoint.top}]
                element.update(points);
                break;
            case Tableview:
                this.tableviews.set(element.id, element);
                break;
            default:
                console.error("invalid element");
                return 0;
        }
        
    }

    move(id, x, y)
    {    
        let element = this.get_tableview(id) || this.get_container(id);
        if(!element) return;
        notify("move", {id: event.target.id, x: x, y: y});
        element.move(x, y);
    }

    remove_element(id)
    {      
        let element = this.elements.get(id);
        this.elements.delete(id);
        if (element == null){log("element not found");}
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
                console.error("invalid element type");
                break;
        }
        
    }

    lock(id)
    {
        let element = this.tableviews.get(id);
        if(element)
        {
            element.lock();
            return;
        }
        console.error("Only table elements can be locked");       
    }

    highlight(id, bool = true)
    {
        let element = this.elements.get(id);
        if(!element) return;
        
        this.highlighted &&= false;
        
        element.highlighted = bool;
        this.highlightedElement = bool ? element: null;

        for(let cont of this.containers.values())
        {
            console.log(cont.highlighted);
        }

        let type  = bool? "highlight" : "highlight-deselect";
        log(type);
        notify(type, {id});
    }

    is_selected(id)
    {   
        return this.elements.get(id).selected;
    }
    select(id,bool)
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

    removeFromCurrentContainer(elementId)
    {
        let element = this.get_element(elementId);
        let currentContainer = element.container;
        if(!currentContainer) return;
        element.container = null;
        currentContainer.remove(element);

        notify("container-remove", {elementId: elementId, containerId: currentContainer.id})
    }

    addToContainer(elementId, containerId)
    {
        let container = this.get_container(containerId)
        let element = this.get_element(elementId);
        if(!container || !element) return;
        container.add(element);
        element.container = container;

        notify("container-add", {elementId, containerId})
    }

    get_selected_elements()
    {
        return this.selected_elements.values();
    }

    drag(id, bool)
    {
        let element = this.elements.get(id);
        if(!element){return}
        element.dragged = bool;
    }
}

export const diagview = new Diagramview();