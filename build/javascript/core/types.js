let arrow_types = {
    "line": "line",
    "line-dashed": "line-dashed",
    "line-dashed-arrowed": "line-dashed-arrowed",
    "line-arrowed": "line-arrowed",
    "line-dropped-arrowed": "line-dropped-arrowed",
};
export class Type {
    constructor(pTypeId, pTypeLabel, pTypeLine, pTypeIcon64) {
        this.id = "";
        this.lineStyle = "line";
        this.label = "";
        this.icon = "";
        this.id = pTypeId;
        this.label = pTypeLabel;
        this.lineStyle = pTypeLine || "line";
        ;
        this.icon = pTypeIcon64;
        this.createIconCSSClass();
    }
    createIconCSSClass() {
        var style = document.createElement('style');
        style.innerHTML = `.${this.id} { 
            background-image: url(data:image/png;base64,${this.icon});
            background-size: contain;
        }`;
        document.getElementsByTagName('head')[0].appendChild(style);
    }
}
export let typeMap = new Map();
