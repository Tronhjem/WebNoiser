import {dialMax, dialMin} from "./Constants.js";

class Dial {
    constructor(min, max, initValue, isLog, changeCallback, filterData, decimals = 2, name, suffix) {
        this.min = min;
        this.max = max;
        this.initValue = initValue;
        this.isLog = isLog;
        this.changeCallback = changeCallback;
        this.filterData = filterData;
        this.decimals = decimals;
        this.name = name;
        this.suffix = suffix;
        this.isActive = true;
        this.isInput = false;

        this.container = document.createElement("div");
        this.container.classList.add("dial-container");

        this.container.innerHTML = `
            <input class="dial-input" type="number" style="display: none;">
            <div class="dial-value-text">0.56</div>
            <div class="dial-function-text">Volume</div>
            <div class="dial">
                <div class="dial-indicator" style="transform: translate(-50%, -100%) rotate(16.2deg);">
                    <div class="dial-indicator-tip">
                    </div>
                </div>
            </div>
        `;
        
        this.dial = this.container.querySelector(".dial");
        this.indicator = this.container.querySelector(".dial-indicator");
        this.input = this.container.querySelector(".dial-input");
        this.textElement = this.container.querySelector(".dial-value-text");
        this.container.querySelector(".dial-function-text").innerHTML = name;

        this.isDragging = false;
        this.startY = 0;
        this.valueAtStartDragging = 0;

        this.value = 0;
        if (this.isLog) {
            this.value = (dialMax * Math.log(initValue / this.min)) / Math.log(this.max / this.min);
        } else {
            this.value = (initValue - this.min) / (this.max - this.min) * dialMax;
        }

        this.dial.addEventListener("mousedown", this.mouseDown.bind(this));
        this.dial.addEventListener("touchstart", this.touchStart.bind(this));
        // this.dial.addEventListener("dblclick", this.doubleClick.bind(this));

        document.addEventListener("mouseup", this.mouseUp.bind(this));
        document.addEventListener("touchend", this.touchEnd.bind(this));

        this.dial.addEventListener('click', this.showInput.bind(this));
        this.input.addEventListener('keydown', this.handleInputKeydown.bind(this));
        this.input.addEventListener('blur', this.handleInputBlur.bind(this));

        this.updateDialOnDrag();
    }

    doubleClick(){
        this.setDial(this.initValue);
    }

    touchStart(event){
        if (!this.isActive) {
            return;
        }

        document.addEventListener("touchmove", this.touchMove.bind(this));
        this.isDragging = true;
        this.startY = event.touches[0].clientY;
        this.valueAtStartDragging = this.value;
        event.preventDefault();
    }

    touchMove(event){
        if (this.isDragging && this.isActive && !this.isInput) {
            const deltaY = this.startY - event.touches[0].clientY;
            this.value += deltaY * 1;
            this.value = Math.max(dialMin, Math.min(dialMax, this.value));
            this.startY = event.touches[0].clientY;
            this.updateDialOnDrag();
        }
    }

    touchEnd(){
        this.isDragging = false;
        document.removeEventListener("touchmove", this.touchMove);
    }

    mouseDown(event){
        if (!this.isActive) {
            return;
        }

        document.addEventListener("mousemove", this.mouseMove.bind(this));
        this.isDragging = true;
        this.startY = event.clientY;
        this.valueAtStartDragging = this.value;
        event.preventDefault();
    }

    mouseMove(mouseEvent){
        if (this.isDragging && this.isActive && !this.isInput) {
            const deltaY = this.startY - mouseEvent.clientY;
            this.value += deltaY * 1;
            this.value = Math.max(dialMin, Math.min(dialMax, this.value));
            this.startY = mouseEvent.clientY;

            this.updateDialOnDrag();
        }
    }

    mouseUp(){
        this.isDragging = false;
        document.removeEventListener("mousemove", this.mouseMove);
    }

    showInput() {
        if (this.valueAtStartDragging == this.value) {
            this.input.style.display = 'block';
            this.textElement.style.display = 'none';
            let setValue = 0;
            if (this.isLog) {
                setValue = this.roundDown(Math.pow(10, (this.value / dialMax) * (Math.log10(this.max) - Math.log10(this.min)) + Math.log10(this.min), this.decimals), this.decimals);
            }
            else{
                setValue = this.roundDown((this.value / dialMax) * (this.max - this.min) + this.min, this.decimals);
            }

            this.input.value = setValue;
            this.input.focus();
            this.isInput = true;
        }
    }

    handleInputKeydown(event) {
        if (event.key === 'Enter') {
            this.updateValueFromInput();
            this.isInput = false;
        }
    }

    handleInputBlur() {
        this.updateValueFromInput();
    }

    updateValueFromInput() {
        const newValue = parseFloat(this.input.value);
        if (!isNaN(newValue)) {
            const value = Math.max(this.min, Math.min(this.max, newValue));
            this.setDial(value);
        }

        this.input.style.display = 'none';
        this.textElement.style.display = 'block';
        this.isInput = false;
    }

    getContainer(){
        return this.container;
    }

    roundDown(value, decimals) {
        const factor = Math.pow(10, decimals);
        return Math.floor(value * factor) / factor;
    }

    updateDialOnDrag() {
        this.setDialIndicator();
        this.changeCallback(this.value, this.filterData)
    };

    setDial(value) {

        if (this.isLog) {
            this.value = (dialMax * Math.log(value / this.min)) / Math.log(this.max / this.min);
        } else {
            this.value = (value - this.min) / (this.max - this.min) * dialMax;
        }
        
        this.setDialIndicator();
        this.changeCallback(this.value, this.filterData)
    }

    setDialIndicator() {
        const angle = (this.value / dialMax ) * 270 - 135;
        this.indicator.style.transform = `translate(-50%, -100%) rotate(${angle}deg)`;
        
        let textValue = 0;

        if(this.isLog){
            textValue = Math.floor(Math.pow(10, (this.value / dialMax) * 
                        (Math.log10(this.max) - Math.log10(this.min)) + 
                        Math.log10(this.min)));
        } 
        else {
            textValue = this.roundDown((this.value / dialMax) * (this.max - this.min) + this.min, this.decimals);
        }
        this.textElement.textContent = `${textValue} ${this.suffix}`;
    }

    setActive(active){
        if (active) {
            this.container.classList.remove("faded");
            this.container.style.pointerEvents = "auto";
            this.isActive = true;
        } else {
            this.container.classList.add("faded");
            this.container.style.pointerEvents = "none";
            this.isActive = true;
        }
    }
}

export default Dial;
