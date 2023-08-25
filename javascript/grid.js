const size = 200;


function attach_to_grid(value)
{
    let intVal = Math.round(value/size);
    return intVal*size;
}

function pos_to_grid(value)
{
    let intVal = Math.round(value/size);
    return intVal;
}

function grid_to_pos(value)
{
    
    return Math.round(value) * size;
}

function grid_size(value)
{
    return value * size;
}
