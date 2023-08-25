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
 

function move_element(id, x, y, grid = false)
{
    try {
        if(grid == true)
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

function move_container(id, x, y, grid = false)
{
    if(grid == true)
    {
        x = grid_to_pos(x);
        y = grid_to_pos(y);
    }
    diagview.get_container(id).move(x,y);
    draw();
}


function resize_conainer(id, width, height)
{
    if(diagview.get_container(id) == null) return;
    diagview.get_container(id).resize(width, height);
    draw();
}

/*=================================
 *Functions to add and remove diagram elements 
 *=================================
 */
 
 function remove_element(id)
 {
     diagview.remove_element(id);
     draw();
 }

function add_element(id, title, x, y, containerId, grid = true, start = false)
{
    if(grid)
    {
        x = grid_to_pos(x);
        y = grid_to_pos(y);
    }
    if(start)
    {
        set_start(id);
    }
    let tableview = new Tableview(id, title, x, y, size, size);
    let container = diagview.get_container(containerId);
    if(container)
    {
        container.add(tableview);
    }
    diagview.add_element(tableview);
    draw();
}

function add_container(id, title, x, y, width, height, grid = false)
{
    if(grid)
    {
        x = grid_to_pos(x);
        y = grid_to_pos(y);
    }
    let container = new ContainerView(id, title, "standard", x, y, width, height);
    diagview.add_element(container);
    draw();
}

function add_relation(pId, pStartId, pEndId, pType)
{
    let line = new LineView(pId, pStartId, pEndId, pType)
    diagview.add_element(line);
    draw();
}
