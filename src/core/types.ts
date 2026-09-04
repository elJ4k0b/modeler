import { ArrowType } from "../lines/lines.js";

let arrow_types: {[index: string]: ArrowType} = {
    "line": "line",
    "line-dashed": "line-dashed",
    "line-dashed-arrowed": "line-dashed-arrowed",
    "line-arrowed": "line-arrowed",
    "line-dropped-arrowed": "line-dropped-arrowed",
}


export class Type
{
    public id: string = "";
    public lineStyle: string = "line";
    public label: string = "";
    public icon: string = "";
    constructor(pTypeId: string, pTypeLabel:string, pTypeLine: string, pTypeIcon64: string)
    {
        this.id = pTypeId;
        this.label = pTypeLabel;
        this.lineStyle = pTypeLine || "line";;
        this.icon = pTypeIcon64; 
        this.createIconCSSClass();
    }
    createIconCSSClass(): void
    {
        var style = document.createElement('style');
        
        style.innerHTML = `.${this.id} { 
            background-image: url(data:image/png;base64,${this.icon});
            background-size: contain;
        }`;

        document.getElementsByTagName('head')[0].appendChild(style);
    }
}

export let typeMap = new Map<string, Type>();

