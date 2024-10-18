import {constantFilterTypes, FilterMinMax, dialMin, dialMax} from "./Constants.js"
import Dial from "./Dial.js";
import FilterControls from "./FilterControls.js";

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

    updateAllDials(data){
        this.volumeDial.setDial(data.vol);
        this.onePoleDial.setDial(data.lpf1p.f);
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
        const filterControls = new FilterControls(filterData, changeFrequencyCallback, changeQCallback, changeGainCallback, changeTypeCallback, OnRemoveFilter);
        this.filterControlsContainer.appendChild(filterControls.getContainer());
        return filterControls.getContainer();
    }
}

export default View;