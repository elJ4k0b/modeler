var Environments;
(function (Environments) {
    Environments[Environments["Production"] = 0] = "Production";
    Environments[Environments["Developement"] = 1] = "Developement";
})(Environments || (Environments = {}));
const DEFAULT_ENVIRONMENT = Environments.Developement;
let currentEnvironment = DEFAULT_ENVIRONMENT;
export function set_environment(pEnvironment) {
    currentEnvironment = pEnvironment;
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
        displayLog(message, detail);
    }
    else if (type == "warning") {
        console.warn(message);
        displayLog(message, detail);
    }
    else
        console.log(message);
}
function displayLog(message, detail) {
    let container = document.getElementById("errorContainer");
    if (!container) {
        container = document.createElement("div");
        container.id = "errorContainer";
        container.style.backgroundColor = "#E64437";
        container.style.color = "white";
        container.style.fontFamily = "sans-serif";
        container.style.position = "absolute";
        container.style.top = "3rem";
        container.style.left = "50%";
        container.style.width = "fit-content";
        container.style.transform = "translateX(-50%)";
        container.style.borderRadius = "1000px";
        container.style.padding = "1em";
        container.onclick = (event) => navigator.clipboard.writeText((container === null || container === void 0 ? void 0 : container.innerHTML) || "");
        document.body.appendChild(container);
    }
    container.innerHTML = `${message} - Occured in ${(detail === null || detail === void 0 ? void 0 : detail.file) || "not provided file"} in method ${(detail === null || detail === void 0 ? void 0 : detail.method) || "not provided method"} in line ${(detail === null || detail === void 0 ? void 0 : detail.line) || "not provided line"}`;
}
