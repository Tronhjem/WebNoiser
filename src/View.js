import {constantFilterTypes, FilterMinMax, dialMin, dialMax} from "./Constants.js"

class View {
    constructor() {
        this.playButton = document.getElementById("play-button");
        this.addFilterButton = document.getElementById("add-filter-button");
        this.saveButton = document.getElementById("save-button");
        this.loadButton = document.getElementById("load-button");
        this.clearLocalStorageButton = document.getElementById("clear-local-storage");
        this.filterControlsContainer = document.getElementById("filter-controls-container");
        this.coreControls = document.getElementById("core-controls");
    }

    bindPlayButton(handler) {
        this.playButton.addEventListener("click", async event => {
            await handler(event.target.value);
        });
    }

    bindAddFilterButton(handler) {
        this.addFilterButton.addEventListener("click", event => {
            handler(event.target.value);
        });
    }

    bindSaveButton(handler) {
        this.saveButton.addEventListener("click", event => {
            handler(event.target.value);
        });
    }

    bindLoadButton(handler) {
        this.loadButton.addEventListener("click", event => {
            handler(event.target.value);
        });
    }

    bindClearLocalStorageButton(handler) {
        this.clearLocalStorageButton.addEventListener("click", event => {
            handler(event.target.value);
        });
    }

    clearFilterControls() {
        while (this.filterControlsContainer.firstChild) {
            this.filterControlsContainer.removeChild(this.filterControlsContainer.firstChild);
        }

        while(this.coreControls.firstChild){
            this.coreControls.removeChild(this.coreControls.firstChild);
        }
    }

    createVolumeControl(volumeChangedCallback, initValue = 0.5){
        const container = document.createElement("div");
        container.classList.add("volume-control");

        const volumeDial = this.createDial(0, 1, initValue, false, volumeChangedCallback, null, 2, "Volume", "");

        container.appendChild(volumeDial);
        this.coreControls.appendChild(container);
    }

    createOnePoleControl(onePoleChangedCallback, initValue = 1500){
        const container = document.createElement("div");
        container.classList.add("onepole-control");

        const volumeDial = this.createDial(FilterMinMax.frequency.min, FilterMinMax.frequency.max, initValue, true, onePoleChangedCallback, null, 2, "Freq", "Hz");

        container.appendChild(volumeDial);
        this.coreControls.appendChild(container);
    }

    roundDown(value, decimals) {
        const factor = Math.pow(10, decimals);
        return Math.floor(value * factor) / factor;
    }

    createDial(min, max, initValue, isLog, changeCallback, filter, decimals = 2, name, suffix) {
        const container = document.createElement("div");
        container.classList.add("dial-container");

        const dial = document.createElement("div");
        dial.classList.add("dial");

        const indicator = document.createElement("div");
        indicator.classList.add("dial-indicator");
        dial.appendChild(indicator);

        const circle = document.createElement("div");
        circle.classList.add("dial-indicator-tip");
        indicator.appendChild(circle);

        const textElement = document.createElement("div");
        textElement.classList.add("dial-value-text");
        textElement.textContent = initValue;
        container.appendChild(textElement);

        const functionText = document.createElement("div");
        functionText.classList.add("dial-function-text");
        functionText.textContent = name;
        container.appendChild(functionText);

        let isDragging = false;
        let startY = 0;
        
        let value = 0;
        if(isLog){
            value = (dialMax * Math.log(initValue / min)) / Math.log(max / min);
        }
        else{
            value = ( initValue - min) / (max - min) * dialMax;
        }

        const updateDial = () => {
            const angle = (value / dialMax ) * 270 - 135;
            indicator.style.transform = `translate(-50%, -100%) rotate(${angle}deg)`;
            
            let textValue = 0;

            if(isLog){
                textValue = Math.floor(Math.pow(10, (value / dialMax) * (Math.log10(max) - Math.log10(min)) + Math.log10(min)));
            } 
            else {
                textValue = this.roundDown((value / dialMax) * (max - min) + min, decimals);
            }
            textElement.textContent = `${textValue} ${suffix}`;
            changeCallback(value, filter)
        };

        dial.addEventListener("mousedown", (event) => {
            isDragging = true;
            startY = event.clientY;
            event.preventDefault();
        });

        document.addEventListener("mousemove", (event) => {
            if (isDragging) {
                const deltaY = startY - event.clientY;
                value += deltaY * 1;
                value = Math.max(dialMin, Math.min(dialMax, value));
                startY = event.clientY;
                updateDial();
            }
        });

        document.addEventListener("mouseup", () => {
            isDragging = false;
        });

        updateDial();
        container.appendChild(dial);
        return container;
    }

    createFilterControls(filter, changeFrequencyCallback, changeQCallback, changeGainCallback, OnRemoveFilter, filterData) {
        const container = document.createElement("div");
        container.classList.add("filter-controls");
        container.classList.add("row");

        const frequencyDial = this.createDial(FilterMinMax.frequency.min, FilterMinMax.frequency.max, filter.frequency.value, true, changeFrequencyCallback, filter, 0, "Freq", "Hz");
        const qDial = this.createDial(FilterMinMax.Q.min, FilterMinMax.Q.max, filter.Q.value, false, changeQCallback, filter, 2, "Q", "");
        const gainDial = this.createDial(FilterMinMax.gain.min, FilterMinMax.gain.max, filter.gain.value, false, changeGainCallback, filter, 0, "Gain", "dB");

        const typeSelector = document.createElement("select");
        typeSelector.classList.add("filter-type-selector");
        constantFilterTypes.forEach(type => {
            const option = document.createElement("option");
            option.value = type;
            option.textContent = type;
            if (filter.type === type) {
                option.selected = true;
            }
            typeSelector.appendChild(option);
        });

        typeSelector.addEventListener("change", (event) => {
            filter.type = event.target.value;
        });

        const removeButton = document.createElement("button");
        removeButton.classList.add("filter-button");
        removeButton.classList.add("my-button");
        removeButton.textContent = "Remove";
        removeButton.addEventListener("click", (event) => {
            container.remove();
            OnRemoveFilter(filter, filterData);
        });

        container.appendChild(frequencyDial);
        container.appendChild(qDial);
        container.appendChild(gainDial);
        container.appendChild(typeSelector);
        container.appendChild(removeButton);

        this.filterControlsContainer.appendChild(container);
        return container;
    }
}

export default View;