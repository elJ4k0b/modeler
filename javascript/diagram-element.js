class DiagramElement extends HTMLElement{
    constructor(test)
    {
        super();
        this.attachShadow({mode: "open"});
        this.load_template("./diagram-element.html");
        console.log(test);
    }
    async load_template(file)
    {
        const response = await fetch(file);
        let html = await response.text();
        let template = document.createElement("template");
        template.innerHTML = html.trim();
        this.shadowRoot.appendChild(template.content.cloneNode(true));
    }
}

window.customElements.define("diagram-element", DiagramElement);