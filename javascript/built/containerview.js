import { notify } from "./API.js";
import { attach_to_grid, grid_size } from "./grid.js";
import { DiagramElementView } from "./view.js";
class ContainerView extends DiagramElementView {
    constructor(pId, pTitle, pType, pX, pY, pWidth, pHeight, pContainer) {
        super();
        this.id = pId;
        this.container = pContainer;
        this.position = {
            top: pY,
            left: pX,
        };
        this.dimension = {
            width: pWidth,
            height: pHeight
        };
        this.min = {
            width: grid_size(1),
            height: grid_size(1),
        };
        this.max = {
            x: -Math.max(),
            y: -Math.max(),
        };
        this.children = new Map();
        this.title = pTitle;
        this.typeId = pType;
        this.selected = false;
        this._dragged = false;
        this.highlighted = false;
    }
    add(tblview) {
        if (this.children.has(tblview.id))
            return;
        this.children.set(tblview.id, tblview);
        this.update_bounds();
    }
    remove(tblview) {
        if (!this.children.has(tblview.id))
            return;
        this.children.delete(tblview.id);
    }
    move(x, y, all = true) {
        let deltaX = x - this.position.left;
        let deltaY = y - this.position.top;
        this.max.x += deltaX;
        this.max.y += deltaY;
        this.position.left = x;
        this.position.top = y;
        if (this.container)
            this.container.update_bounds();
        if (!all)
            return;
        for (let child of this.children.values()) {
            child.dragged = this._dragged;
            child.move(child.position.left + deltaX, child.position.top + deltaY, false);
        }
    }
    //This could cause performance issues
    update_bounds() {
        let children = Array.from(this.children.values());
        if (children.length < 1)
            return;
        children.sort((a, b) => { return a.position.left - b.position.left; });
        let most_left = children[0];
        let most_right = children[children.length - 1];
        this.max.x = most_left.position.left; //- grid_size(1);
        this.min.width = most_right.position.left + most_right.dimension.width - this.position.left; // + grid_size(1);
        children.sort((a, b) => { return a.position.top - b.position.top; });
        let most_top = children[0];
        let most_bottom = children[children.length - 1];
        this.max.y = most_top.position.top; //- grid_size(1);
        this.min.height = most_bottom.position.top + most_bottom.dimension.height - this.max.y; // + grid_size(1);    
    }
    resize(width, height, x, y) {
        let success = { x: false, y: false };
        let upscale = x < this.position.left || width > this.dimension.width;
        let in_bounds = x <= this.max.x && width >= this.min.width;
        if (upscale || in_bounds) {
            this.position.left = x;
            this.dimension.width = width;
            success.x = true;
        }
        let in_bounds_right = width >= this.min.width && x == this.position.left;
        let in_bounds_left = x <= this.max.x && width >= this.min.width;
        if (in_bounds_right) {
            this.dimension.width = width;
            success.x = true;
        }
        if (in_bounds_left) {
            this.position.left = x;
            this.dimension.width = width;
            success.x = true;
        }
        upscale = y < this.position.top || height > this.dimension.height;
        in_bounds = y <= this.max.y && height >= this.min.height;
        if (upscale || in_bounds) {
            this.position.top = y;
            this.dimension.height = height;
            success.y = true;
        }
        else {
            //this.position.top = this.max.y;
        }
        this.update_bounds();
        return success;
    }
    //diese funktion passt besser in diagramview 
    set_position_and_size(x, y, width, height) {
        x = Math.min(this.max.x, x);
        y = Math.min(this.max.y, y);
        width = Math.max(this.min.width, width);
        height = Math.max(this.min.height, height);
        this.dimension.width = attach_to_grid(width);
        this.dimension.height = attach_to_grid(height);
        this.position.left = attach_to_grid(x);
        this.position.top = attach_to_grid(y);
        notify("container-resize", { id: this.id, width: this.dimension.width, height: this.dimension.height });
        notify("content-move", { id: this.id, x: this.position.left, y: this.position.top });
    }
}
export default ContainerView;
