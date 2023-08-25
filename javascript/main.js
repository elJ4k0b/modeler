let draggedElement;
let selectedElements = [];



const TOOLS = {
    select: "select",
    drag: "drag"
}

let selected_tool = TOOLS.drag;


function switch_tool(tool)
{
    switch(tool) 
    {
        case (TOOLS.select):
            selected_tool = TOOLS.select;
            break;
        case (TOOLS.drag):
            selected_tool = TOOLS.drag;
            break;
    }
    handle_mousedown();
}

function handle_mousedown()
{
    deactivate_all();
    switch(selected_tool)
    {
        case TOOLS.drag:
            activate_drag();
            break;
        case TOOLS.select:
            activate_selection();
            break;
    }
}



function activate_selection()
{
    let poly = document.querySelector("polygon");
    let path = document.querySelector("#select");

    //TODO: Alle Eventlistener und variablen setzen
    let startX, startY;
    let pathData = "";
    let points = "";
    
    document.addEventListener("mousedown", function(e) {
        if (e.button === 0) {
        startX = e.clientX;
        startY = e.clientY;
        pathData = `M ${startX} ${startY} `;
        document.addEventListener("mousemove", drawPath);
        document.addEventListener("mousemove", drawPolygon);
        }
    });

    document.addEventListener("mouseup", function(e) {
        if (e.button === 0) {
        document.removeEventListener("mousemove", drawPath);
        document.removeEventListener("mousemove", drawPolygon);
        path.setAttribute("points", points);
        path.setAttribute("d", pathData);
        select_points();
        
        points = "";
        }
    });

    function select_points()
    {
        for(let view of diagview.tableviews.values())
        {
            if(poly.isPointInFill(new DOMPoint(view.position.left, view.position.top)))
            {
                const elem = {id: view.id};
                select(event, elem);
            }
        }
    }

    function drawPolygon(e) {
        let x = e.clientX;
        let y = e.clientY;
        points += ` ${x},${y}`
        poly.setAttribute("points", points);
    }   

    function drawPath(e) {
        let x = e.clientX;
        let y = e.clientY;
        pathData += `L ${x} ${y} `;
        path.setAttribute("d", pathData);
    }
}


function activate_drag()
{
    //TODO: Alle Eventlistener und variablen setzen
    let offset = {
        x:0,
        y:0
    };
    
    let test = document.querySelectorAll(".draggable");
    for(let item of test)
    {
        item.addEventListener("mousedown", startdrag(event, item));
    }
    document.addEventListener("mouseup", enddrag);


    //document.addEventListener("click", select(event, event.currentTarget));
    function select(event, element)
    {
        if(selectedElements.includes(element.id))
        {
            const index = selectedElements.indexOf(element.id);
            selectedElements.splice(index, 1);
        }
        else {
            selectedElements.push(element.id);
        }
        diagview.select(element.id, !diagview.is_selected(element.id));
        draw(document.getElementById("canvas"));
    }


    function startdrag(event)
    {
        event.preventDefault();
        element = diagview.get_tableviews(event.currentTarget.id);
        offset.x = event.clientX - element.position.left;
        offset.y = event.clientY - element.position.top;
        draggedElement = element;
        document.addEventListener("mousemove", drag);
    }
    
    function enddrag(event, element)
    {
        if(draggedElement == null) {return};
        select(event, draggedElement);
        document.removeEventListener("mousemove", drag);
        draggedElement = null;
    }
    
    function drag(event)
    {

            elem = draggedElement;

            if(elem == null){return};
            if(!offset.x || !offset.y){
                offset.x = 0;
                offset.y = 0;
            }
            
            let xPosition = event.clientX - offset.x;
            let yPosition = event.clientY - offset.y;
        
        
            /*Only for grid attached movement
            xPosition = attach_to_grid(event.clientX);
            yPosition = attach_to_grid(event.clientY);*/
        

            diagview.move(elem.id, xPosition, yPosition);
            draw(document.getElementById("canvas"));
    }

}

function deactivate_all()
{
    //TODO: Eventlistener von allem entfernen
    // Entfernen Sie alle Listener vom Dokument
    const clone = document.documentElement.cloneNode(true);
    document.replaceChild(clone, document.documentElement);
}














/*=======================================*/
function drawDottedPath() {
    let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    let path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    let poly = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    svg.appendChild(path);
    svg.appendChild(poly);
    document.body.appendChild(svg);

    svg.style.position = "absolute";
    svg.style.zIndex = "-2";
    svg.style.width = "100%";
    svg.style.height = "100%";
    svg.style.top = "0";
    svg.style.left = "0";

    path.setAttribute("stroke-dasharray", "2,10");
    path.setAttribute("stroke-width", "4");
    path.setAttribute("stroke", "#71747A");
    path.setAttribute("fill", "none");
    path.setAttribute("stroke-linecap", "round");

    //poly.setAttribute("stroke-dasharray", "5,5");
    //poly.setAttribute("stroke-width", "2");
    //poly.setAttribute("stroke", "black");
    poly.setAttribute("fill", "none"); //#77CAF7
    //poly.setAttribute("fill-opacity", "0.25");


    let startX, startY;
    let pathData = "";
    let points = "";
    
    document.addEventListener("mousedown", function(e) {
        if (e.button === 0) {
        startX = e.clientX;
        startY = e.clientY;
        pathData = `M ${startX} ${startY} `;
        document.addEventListener("mousemove", drawPath);
        document.addEventListener("mousemove", drawPolygon);
        }
    });

    document.addEventListener("mouseup", function(e) {
        if (e.button === 0) {
        document.removeEventListener("mousemove", drawPath);
        document.removeEventListener("mousemove", drawPolygon);
        path.setAttribute("points", points);
        path.setAttribute("d", pathData);
        
        points = "";
        }
    });

    function drawPolygon(e) {
        let x = e.clientX;
        let y = e.clientY;
        points += ` ${x},${y}`
        poly.setAttribute("points", points);
    }   

    function drawPath(e) {
        let x = e.clientX;
        let y = e.clientY;
        pathData += `L ${x} ${y} `;
        path.setAttribute("d", pathData);
    }
}







/*=======================================*/


/*let offset = {
    x:0,
    y:0
};

function startdrag(event, element)
{
    event.preventDefault();
    offset.x = event.clientX - element.getBoundingClientRect().left;
    offset.y = event.clientY - element.getBoundingClientRect().top;
    draggedElement = element;
}

function enddrag(event, element)
{
    if(draggedElement == null){return};
    draggedElement = null;
}

function drag(event, id)
{
    if(draggedElement == null){return};
    if(!offset.x || !offset.y){
        offset.x = 0;
        offset.y = 0;
    }
    
    let xPosition = event.clientX - offset.x;
    let yPosition = event.clientY - offset.y;


    /*Only for grid attached movement
    xPosition = pos_to_grid(event.clientX);
    yPosition = pos_to_grid(event.clientY);

    diagview.move(id, xPosition, yPosition);
    draw(document.getElementById("canvas"));
}


function init()
{
    document.addEventListener("mousemove", event => {
        if(draggedElement == null){return;}
        drag(event, draggedElement.id);
    });
}

*/
function select(event, element)
{
    console.log("select");
    diagview.select(element.id, !diagview.is_selected(element.id));
    draw(document.getElementById("canvas"));
}




function draw(canvas)
        {
            
            canvas.innerHTML = "";
            document.querySelector("#overlay").innerHTML = "";
            let svg = document.getElementById("svg");
            svg.innerHTML = "";

            let maxWidth = 0;
            let maxHeight = 0;
            for(let tableview of diagview.tableviews.values())
            {
                let div = document.createElement("div");
                div.classList.add("draggable");


                div.id = tableview.id;
                div.style.position = "absolute";
                div.style.top = `${tableview.position.top}px`;
                div.style.left = `${tableview.position.left}px`;
                div.style.width = `${tableview.dimension.width}px`;     
                div.style.height = `${tableview.dimension.height}px`;
                div.style.backgroundColor = "red";
                div.style.padding = "5px";
                if(tableview.selected)
                {
                    let popover = document.querySelector("#template");
                    if (popover)
                    {
                        let test = popover.cloneNode(true);
                        test.id = div.id;
                        div.appendChild(test);
                    }
                    draw_overlay(tableview);
                }
                div.addEventListener ("click", event => {select(event, div)});
                div.addEventListener("mousedown", event => {
                    switch_tool(TOOLS.drag);
                });

                for(let columnView of tableview.columnViews.values())
                {
                    let child = document.createElement("div");
                    child.style.backgroundColor = "green";
                    child.style.width = "100%";
                    child.style.height = "100%";
                    child.style.backgroundColor = "green";
                    div.appendChild(child);
                }

                maxHeight = Math.max(tableview.dimension.height + tableview.position.top, maxHeight);
                maxWidth = Math.max(tableview.dimension.width + tableview.position.left, maxWidth);

                canvas.appendChild(div);
                div.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
                
                console.log(div);
                draw_lines(tableview);
            }
            svg.setAttribute("width", `${maxWidth}px`);
            svg.setAttribute("height", `${maxHeight}px`);
            svg = document.querySelector("#overlay");
            svg.setAttribute("width", `${maxWidth+10}px`);
            svg.setAttribute("height", `${maxHeight+10}px`);

            canvas.style.width = `${maxWidth}px`;
            canvas.style.height = `${maxHeight}px`;
        }


        function draw_overlay(elem) {
            console.log(elem);
            let overlay = document.createElementNS("http://www.w3.org/1999/xhtml", "polygon");
            let topLeft = `${elem.position.left},${elem.position.top}`;
            let topRight = `${elem.position.left + elem.dimension.width},${elem.position.top}`;
            let bottomLeft = `${elem.position.left},${elem.position.top  + elem.dimension.height}`;
            let bottomRight = `${elem.position.left + elem.dimension.width},${elem.position.top + elem.dimension.height}`;

            overlay.setAttribute("marker-mid", "url(#dot)");
            overlay.setAttribute("marker-start", "url(#dot)");
            overlay.setAttribute("points", `${topLeft} ${topRight} ${bottomRight} ${bottomLeft}`);
            overlay.setAttribute("fill", "none")
            overlay.setAttribute("stroke", "#295FF4");
            overlay.setAttribute("stroke-width", "1");

            console.log(overlay);
            document.querySelector("#overlay").appendChild(overlay);
            document.querySelector("#overlay").innerHTML += "";
            
        }
        function draw_lines(elem)
        {
            for(let after of elem.after)
            {
                after +="";
                after = diagview.tableviews.get(after);
                let startPosY = 0;
                let startPosX = 0;

                let endPosY = 0;
                let endPosX = 0;

                //Check relative position
                let deltaY = elem.position.top - after.position.top;
                let deltaX = elem.position.left - after.position.left;

                //Pfeil entspringt immer oben oder unten
                if(deltaY < 0)
                {
                    startPosY = elem.position.top + elem.dimension.height;
                    startPosX = elem.position.left + elem.dimension.width/2;
                }
                //SONDERFALL: gleiche Y-Koordinate
                else if(deltaY == 0)
                {
                    startPosY = elem.position.top + elem.dimension.height/2;
                    if(deltaX < 0 )
                    {
                        startPosX = elem.position.left + elem.dimension.height;
                    }   
                    else
                    {
                        startPosX = elem.position.left;
                    }
                }
                else 
                {
                    startPosY = elem.position.top;
                    startPosX = elem.position.left + elem.dimension.width/2;
                }

                //Pfeil kommt immer links oder rechts an 
                if(deltaX < 0)
                {
                    endPosX = after.position.left;
                    endPosY = after.position.top + after.dimension.height/2;    
                }
                //SONDERFALL: gleiche x-koordinate
                else if (deltaX == 0) 
                {
                    endPosX = after.position.left + after.dimension.width/2;
                    if(deltaY < 0 )
                    {
                        endPosY = after.position.top;
                    }   
                    else
                    {
                        endPosY = after.position.top + after.dimension.height;
                    }
                    
                }   
                else 
                {
                    endPosX = after.position.left  + after.dimension.width;
                    endPosY = after.position.top + after.dimension.height/2;    
                }
                drawline_at(startPosX, startPosY, endPosX, endPosY);
            }
        }