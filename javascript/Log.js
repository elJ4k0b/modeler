let environment = "production";
let environments = ["production", "development"];


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
    else if(type == "warning") console.warn(message);
    else console.log(message);
}

