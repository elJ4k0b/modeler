import Tableview from "./tableview.js";
import ContainerView from "./containerview.js";
import LineView from "./lineview.js";


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
    }

    set_start(id)
    {
        let element = this.tableviews.get(id);
        this.prevStartElement = this.startElement;
        this.startElement = element;
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
                break;
            case Tableview:
                this.tableviews.set(element.id, element);
                /*if(this.startElement != null)
                {
                    let id = Math.max(...this.lineviews.keys(), -1)+1;
                    let newLine = new LineView (id, this.startElement.id,  element.id, "standard");
                    this.lineviews.set(newLine.id, newLine);
                    this.tableviews.set(element.id, element);
                }
                else 
                {
                    this.tableviews.set(element.id, element);
                    this.set_start(element.id);
                }*/
                
                break;
            default:
                console.error("invalid element");
                return 0;
        }
        
    }

    move(id, left, top)
    {    
        let element = this.elements.get(id);
        element.position.left = left;
        element.position.top = top;   
    }

    remove_element(id)
    {      
        let element = this.elements.get(id);
        this.elements.delete(id);
        if (element == null){console.log("element not found");}
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
                if(element = this.startElement)
                {
                    this.startElement = this.prevStartElement;
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

    is_selected(id)
    {   
        return this.elements.get(id).selected;
    }
    select(id,bool)
    {   
        let element = this.elements.get(id);
        if(!element){return}
        element.selected = bool;
        bool? this.selected_elements.set(id, element): this.selected_elements.delete(id);
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