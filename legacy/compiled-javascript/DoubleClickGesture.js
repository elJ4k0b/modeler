import { Gesture } from "./Gesture.js";
export class DoubleClickGesture extends Gesture {
    constructor(pointer) {
        super(pointer);
        this.DOUBLE_CLICK_TIMEOUT_TIME = 1000;
        this.clickcounter = 0;
        console.log("Hallo");
        this.isActive = true;
        document.addEventListener("pointerdown", this.executeGesture.bind(this));
        this._doubleClickTimeOut = setTimeout(this.cancelGesture, this.DOUBLE_CLICK_TIMEOUT_TIME);
    }
    executeGesture() {
        if (!this.isActive)
            return;
        console.log("Double Click");
        clearTimeout(this._doubleClickTimeOut);
        this.isActive = false;
    }
    cancelGesture() {
        console.log("clear double");
        document.removeEventListener("pointerdown", this.executeGesture);
        this.isActive = false;
    }
}
