import draw, { toggel_debuginfo } from "./draw.js";

export enum Environments {
    Production, 
    Developement
}

type LogTypes = "warning" | "error" | "info"

type LogDetail = {
    file: string,
    method: string, 
    line?: number,
}

const DEFAULT_ENVIRONMENT = Environments.Developement;
let currentEnvironment: Environments = DEFAULT_ENVIRONMENT;

export function set_environment(pEnvironment: Environments)
{
    currentEnvironment = pEnvironment;
    toggel_debuginfo(pEnvironment == Environments.Developement);
    if(pEnvironment == Environments.Production)
    {
        let container = document.getElementById("errorContainer");
        if(container) container.style.display = "none";
    }
    else if(pEnvironment == Environments.Developement)
    {
        let container = document.getElementById("errorContainer");
        if(container) container.style.display = "block";
    }
    draw();
}




export function log(message: string, type: LogTypes, detail?: LogDetail)
{
    switch(currentEnvironment)
    {
        case Environments.Production:
            log_production(type, message, detail);        
            break;
        case Environments.Developement:
            log_development(type, message, detail);
            break;
    }
}

function log_production(type: LogTypes, message: string, detail?: LogDetail)
{
    if(type == "error") console.error(message); 

}

function log_development(type: LogTypes, message: string, detail?: LogDetail)
{
    if(type == "error")
    {
        console.error(message);
        displayLog(message, type, detail);  
    } 
    else if(type == "warning")
    {
        console.warn(message);
        displayLog(message, type, detail);
    }
    else console.log(message);
}

function displayLog(message: string, type: LogTypes, detail?: LogDetail)
{
    let container = document.getElementById("errorContainer");

    if(!container)
    {
        container = document.createElement("div");
        container.id = "errorContainer";
        switch(type)
        {
            case "error":
                container.style.backgroundColor = "#E64437";
                break;
            case "warning":
                container.style.backgroundColor = "#E6CB5E";
                break;
            case "info":
                container.style.backgroundColor = "#64AAE3";
                break;
        }
        
        container.onclick = (event) => {
            navigator.clipboard.writeText(container?.innerHTML || "")
            if(!container) return;
            container.style.display = "none";
        };
        if(currentEnvironment == Environments.Developement) document.body.appendChild(container);
    }
    container.innerHTML = `${message} - Occured in ${detail?.file || "not provided file"} in method ${detail?.method || "not provided method"} in line ${detail?.line || "not provided line"}`;
}

