import { ELEMENT_HEIGHT } from "./Styles.js";

export const size = ELEMENT_HEIGHT * 2;


function attach_to_grid(value: number)
{
    let intVal = Math.round(value/size);
    return intVal*size;
}

function pos_to_grid(value: number)
{
    let intVal = Math.round(value/size);
    return intVal;
}

function grid_to_pos(value: number)
{
    return Math.round(value) * size;
}

function grid_size(value: number)
{
    return value * size;
}

function grid_to_poscenter(value: number)
{
    return grid_to_pos(value) + size/4;
}


export {attach_to_grid, pos_to_grid, grid_to_pos, grid_size, grid_to_poscenter};