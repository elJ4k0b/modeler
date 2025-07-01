import draw, { toggel_debuginfo } from "./draw.js";
export var Environments;
(function (Environments) {
    Environments[Environments["Production"] = 0] = "Production";
    Environments[Environments["Developement"] = 1] = "Developement";
})(Environments || (Environments = {}));
const DEFAULT_ENVIRONMENT = Environments.Developement;
let currentEnvironment = DEFAULT_ENVIRONMENT;
export function set_environment(pEnvironment) {
    currentEnvironment = pEnvironment;
    toggel_debuginfo(pEnvironment == Environments.Developement);
    if (pEnvironment == Environments.Production) {
        let container = document.getElementById("errorContainer");
        if (container)
            container.style.display = "none";
    }
    else if (pEnvironment == Environments.Developement) {
        let container = document.getElementById("errorContainer");
        if (container)
            container.style.display = "block";
    }
    draw();
}
export function log(message, type, detail) {
    switch (currentEnvironment) {
        case Environments.Production:
            log_production(type, message, detail);
            break;
        case Environments.Developement:
            log_development(type, message, detail);
            break;
    }
}
function log_production(type, message, detail) {
    if (type == "error")
        console.error(message);
}
function log_development(type, message, detail) {
    if (type == "error") {
        console.error(message);
        displayLog(message, type, detail);
    }
    else if (type == "warning") {
        console.warn(message);
        displayLog(message, type, detail);
    }
    else
        console.log(message);
}
function displayLog(message, type, detail) {
    let container = document.getElementById("errorContainer");
    if (!container) {
        container = document.createElement("div");
        container.id = "errorContainer";
        switch (type) {
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
        container.onclick = (event) => navigator.clipboard.writeText((container === null || container === void 0 ? void 0 : container.innerHTML) || "");
        if (currentEnvironment == Environments.Developement)
            document.body.appendChild(container);
    }
    container.innerHTML = `${message} - Occured in ${(detail === null || detail === void 0 ? void 0 : detail.file) || "not provided file"} in method ${(detail === null || detail === void 0 ? void 0 : detail.method) || "not provided method"} in line ${(detail === null || detail === void 0 ? void 0 : detail.line) || "not provided line"}`;
}
