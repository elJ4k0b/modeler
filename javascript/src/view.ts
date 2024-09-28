import ContainerView from "./containerview.js";

export abstract class View
{
    public abstract id: string;
    public abstract title: string;
    public abstract typeId: string;
    public abstract container: ContainerView | null;
    public selected: boolean = false;
    public highlighted: boolean = false;
    public position: {top: number, left: number} = {top: 0, left: 0}
    public dimension: {width: number, height: number} = {width: 0, height: 0}

    constructor() {}
}

export abstract class DiagramElementView  extends View
{
    public dragged: boolean = false;

    constructor(){super()}
    public abstract move (x: number, y: number): void;
}