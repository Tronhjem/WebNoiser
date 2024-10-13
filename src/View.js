import {constantFilterTypes, FilterMinMax, dialMin, dialMax} from "./Constants.js"
import Dial from "./Dial.js";

class View {
    constructor() {
        this.playButton = document.getElementById("play-button");
        this.addFilterButton = document.getElementById("add-filter-button");
        this.saveButton = document.getElementById("save-button");
        this.loadButton = document.getElementById("load-button");
        this.clearLocalStorageButton = document.getElementById("clear-local-storage");
        this.filterControlsContainer = document.getElementById("filter-controls-container");
        this.coreControls = document.getElementById("core-controls");

        this.volumeDial = null;
        this.onePoleDial = null;
    }

    updateAllDials(globalValueTree){
        this.volumeDial.setDial(globalValueTree.volume);
        this.onePoleDial.setDial(globalValueTree.onePoleLowpass.frequency);
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
    }

    createVolumeControl(volumeChangedCallback, initValue = 0.5){
        const container = document.createElement("div");
        container.classList.add("volume-control");

        this.volumeDial = new Dial(0, 1, initValue, false, volumeChangedCallback, null, 2, "Volume", "");

        container.appendChild(this.volumeDial.getContainer());
        this.coreControls.appendChild(container);
    }

    createOnePoleControl(onePoleChangedCallback, initValue = 1500){
        const container = document.createElement("div");
        container.classList.add("onepole-control");

        this.onePoleDial = new Dial(FilterMinMax.frequency.min, FilterMinMax.frequency.max, initValue, true, onePoleChangedCallback, null, 2, "Freq", "Hz");

        container.appendChild(this.onePoleDial.getContainer());
        this.coreControls.appendChild(container);
    }

    createFilterControls(filterData, changeFrequencyCallback, changeQCallback, changeGainCallback, changeTypeCallback, OnRemoveFilter) {
        const container = document.createElement("div");
        container.classList.add("filter-controls");
        container.classList.add("row");

        const frequencyDial = new Dial(FilterMinMax.frequency.min, FilterMinMax.frequency.max, filterData.Frequency, true, changeFrequencyCallback, filterData, 0, "Freq", "Hz");
        const qDial = new Dial(FilterMinMax.Q.min, FilterMinMax.Q.max, filterData.Q, false, changeQCallback, filterData, 2, "Q", "");
        const gainDial = new Dial(FilterMinMax.gain.min, FilterMinMax.gain.max, filterData.Gain, false, changeGainCallback, filterData, 0, "Gain", "dB");

        const typeSelector = document.createElement("select");
        typeSelector.classList.add("filter-type-selector");
        constantFilterTypes.forEach(type => {
            const option = document.createElement("option");
            option.value = type;
            option.textContent = type;
            if (filterData.type === type) {
                option.selected = true;
            }
            typeSelector.appendChild(option);
        });

        typeSelector.addEventListener("change", (event) => {
            filterData.type = event.target.value;
            changeTypeCallback(event.target.value, filterData);
        });

        const removeButton = document.createElement("button");
        removeButton.classList.add("filter-button");
        removeButton.classList.add("my-button");
        removeButton.textContent = "Remove";
        removeButton.addEventListener("click", (event) => {
            container.remove();
            OnRemoveFilter(filterData);
        });

        container.appendChild(frequencyDial.getContainer());
        container.appendChild(qDial.getContainer());
        container.appendChild(gainDial.getContainer());

        container.appendChild(typeSelector);
        container.appendChild(removeButton);

        this.filterControlsContainer.appendChild(container);
        return container;
    }
}

export default View;