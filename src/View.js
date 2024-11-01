import {constantFilterTypes, FilterMinMax, dialMin, dialMax} from "./Constants.js"
import Dial from "./Dial.js";
import FilterControls from "./FilterControls.js";
import Selector from "./Selector.js";

class View {
    constructor() {
        this.playButton = document.getElementById("play-button");
        this.addFilterButton = document.getElementById("add-filter-button");
        this.saveButton = document.getElementById("save-button");
        this.clearLocalStorageButton = document.getElementById("clear-local-storage");
        this.filterControlsContainer = document.getElementById("filter-controls-container");
        this.coreControls = document.getElementById("core-controls");
        this.easyControls = document.getElementById("easy-controls");
        this.presetControls = document.getElementById("preset-controls");

        this.advancedControlToggle = document.getElementById("advanced-control-toggle");
        this.advancedControlToggle.addEventListener("click", this.toggleAdvancedControls.bind(this));
        this.advancedControlContainer = document.getElementById("advanced-control-container");
        this.advancedControlContainer.style.display = "none";

        this.presetSelector = null;
        this.volumeDial = null;
        this.onePoleDial = null;
    }

    updateAllDials(data){
        this.volumeDial.setDial(data.vol);
        this.onePoleDial.setDial(data.lpf1p);
        this.speechMaskDial.setDial(data.sMask);

        this.loDial.setDial(data.lo);
        this.midDial.setDial(data.md);
        this.hiDial.setDial(data.hi);
    }

    toggleAdvancedControls(){
        if(this.advancedControlToggle.textContent === "Show Advanced Controls"){
            this.advancedControlToggle.textContent = "Hide Advanced Controls";
            this.advancedControlContainer.style.display = "block";
        } 
        else {
            this.advancedControlToggle.textContent = "Show Advanced Controls";
            this.advancedControlContainer.style.display = "none";
        }
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
        container.classList.add("core-dial-control");

        this.volumeDial = new Dial(0, 1, initValue, false, volumeChangedCallback, null, 2, "Volume", "");

        container.appendChild(this.volumeDial.getContainer());
        this.coreControls.appendChild(container);
    }

    createOnePoleControl(onePoleChangedCallback, initValue = 1500){
        const container = document.createElement("div");
        container.classList.add("onepole-control");
        container.classList.add("core-dial-control");

        this.onePoleDial = new Dial(FilterMinMax.frequency.min, FilterMinMax.frequency.max, initValue, true, onePoleChangedCallback, null, 2, "Smooth", "Hz");

        container.appendChild(this.onePoleDial.getContainer());
        this.coreControls.appendChild(container);
    }

    createLoControl(callback, initValue){
        const container = document.createElement("div");
        container.classList.add("lowShelf-control");
        container.classList.add("easy-control");
        container.classList.add("core-dial-control");

        this.loDial = new Dial(FilterMinMax.gain.min, FilterMinMax.gain.max, initValue, false, callback, null, 2, "Low", "dB");

        container.appendChild(this.loDial.getContainer());
        this.easyControls.appendChild(container);
    }

    createMidControl(callback, initValue){
        const container = document.createElement("div");
        container.classList.add("mid-control");
        container.classList.add("easy-control");
        container.classList.add("core-dial-control");

        this.midDial = new Dial(FilterMinMax.gain.min, FilterMinMax.gain.max, initValue, false, callback, null, 2, "Mid", "dB");

        container.appendChild(this.midDial.getContainer());
        this.easyControls.appendChild(container);
    }

    createHiControl(callback, initValue){
        const container = document.createElement("div");
        container.classList.add("hi-control");
        container.classList.add("easy-control");
        container.classList.add("core-dial-control");

        this.hiDial = new Dial(FilterMinMax.gain.min, FilterMinMax.gain.max, initValue, false, callback, null, 2, "High", "dB");

        container.appendChild(this.hiDial.getContainer());
        this.easyControls.appendChild(container);
    }

    createSpeechMaskControl(callback, initValue){
        const container = document.createElement("div");
        container.classList.add("speech-mask-control");
        container.classList.add("core-dial-control");

        this.speechMaskDial = new Dial(FilterMinMax.gain.min, FilterMinMax.gain.max, initValue, false, callback, null, 2, "Speech Mask", "dB");

        container.appendChild(this.speechMaskDial.getContainer());
        this.coreControls.appendChild(container);
    }

    createFilterControls(filterData, changeFrequencyCallback, changeQCallback, changeGainCallback, changeTypeCallback, OnRemoveFilter) {
        const filterControls = new FilterControls(filterData, changeFrequencyCallback, changeQCallback, changeGainCallback, changeTypeCallback, OnRemoveFilter);
        this.filterControlsContainer.appendChild(filterControls.getContainer());
        return filterControls.getContainer();
    }

    createPresetSelector(data, changePresetCallback, addPresetCallback, removePresetCallback){
        this.presetSelector = new Selector(data, changePresetCallback, addPresetCallback, removePresetCallback);
        const presetContainer = document.getElementById("preset-container");
        presetContainer.insertBefore(this.presetSelector.getContainer(), presetContainer.firstChild);
    }

    setPresetSelectorName(name){
        this.presetSelector.setValue(name);
    }

    addNewPresetName(name){
        this.presetSelector.addOption(name);
    }

    updateSelectorView(){
        this.presetSelector.renderOptions();
    }
}

export default View;