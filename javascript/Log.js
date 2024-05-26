let environment = "development";
let environments = ["production", "development"];
let errorContainer;


export function set_environment(pEnvironment)
{
    if(!environments.includes(pEnvironment)) return;
    environment = pEnvironment;
}

export function log(message, type)
{
    switch(environment)
    {
        case "production":
            log_production(type, message);        
            break;
        case "development":
            log_development(type, message);
            break;
    }
}

function log_production(type, message)
{
    if(type == "error") console.error(message); 

}

function log_development(type, message)
{
    if(type == "error") console.error(message);
    else if(type == "warning")
    {
        console.warn(message);
        displayLog(message);
    }
    else console.log(message);
}

function displayLog(message)
{
    let container = document.getElementById("errorContainer");

    if(!container)
    {
        container = document.createElement("div");
        container.id = "errorContainer";
        container.style.backgroundColor = "red";
        container.style.position = "absolute";
        container.style.top = "15%";
        container.style.left = "50%";
        container.style.width = "90%";
        container.style.transform  = "translateX(-50%)";
        container.style.borderRadius = "1em";
        container.style.padding = "1em";
        container.onclick = (event) => navigator.clipboard.writeText(container.innerHTML); 
        document.body.appendChild(container);
    }
    container.innerHTML = `${message.message} in ${message.fileName} line: ${message.lineNumber}`;
}

