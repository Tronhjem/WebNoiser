import PresetHandler from "./PresetHandler.js";
import NoiseSynth from "./NoiseSynth.js";
import Dial from "./Dial.js";
import FilterControls from "./FilterControls.js";
import Selector from "./Selector.js";

import {dialMax, VolMinMax, FilterMinMax, biquadLowPass, biquadHighPass, saveParamsName} from "./Constants.js";

class NoiseNookApp {
    constructor() {
        this.presetHandler = new PresetHandler();
        this.noiseSynth = new NoiseSynth();

        // CONTROLS
        this.clearLocalStorageButton = document.getElementById("clear-local-storage");
        this.filterControlsContainer = document.getElementById("filter-controls-container");
        this.coreControls = document.getElementById("core-controls");
        this.easyControls = document.getElementById("easy-controls");
        this.presetControls = document.getElementById("preset-controls");

        this.advancedControlToggle = document.getElementById("advanced-control-toggle");
        this.advancedControlToggle.addEventListener("click", this.toggleAdvancedControls.bind(this));
        this.advancedControlContainer = document.getElementById("advanced-control-container");
        this.advancedControlContainer.style.display = "none";

        this.shareModal = new bootstrap.Modal(document.getElementById('shareModal'), {})
        this.shareMoalClose = document.getElementById("share-modal-close");
        this.shareMoalClose.addEventListener("click", this.shareModal.hide);

        this.addFilterButton = document.getElementById("add-filter-button");
        this.playButton = document.getElementById("play-button");
        this.saveButton = document.getElementById("save-button");
        this.shareButton = document.getElementById("share-button");

        this.addFilterButton.addEventListener("click", this.addFilter.bind(this));
        this.playButton.addEventListener("click", this.handlePlayButton.bind(this));
        this.saveButton.addEventListener("click", this.presetHandler.saveValues.bind(this.presetHandler));
        this.shareButton.addEventListener("click", this.handleShareButton.bind(this));

        const currentData = this.presetHandler.getCurrentData();

        this.volumeDial = this.createCoreControlDial("volume-control", "core-controls", VolMinMax, 
                                                    this.handleVolumeChange.bind(this), 
                                                    currentData.vol, false, "Volume", "", this.coreControls);

        this.onePoleDial = this.createCoreControlDial("onepole-control", "core-controls", FilterMinMax.frequency, 
                                                    this.handleOnePoleChange.bind(this), 
                                                    currentData.lpf1p, true, "Smooth", "Hz", this.coreControls);

        this.speechMaskDial = this.createCoreControlDial("speech-mask-control", "core-controls", FilterMinMax.gain, 
                                                    this.handleSpeechMaskChange.bind(this), 
                                                    currentData.sMask, false, "Speech Mask", "dB", this.coreControls);

        this.loDial = this.createCoreControlDial("lo-control", "easy-controls", FilterMinMax.gain, 
                                                this.handleLoControl.bind(this), currentData.lo, 
                                                false, "Low", "dB", this.easyControls);

        this.midDial = this.createCoreControlDial("mid-control", "easy-controls", FilterMinMax.gain, 
                                                this.handleMidControl.bind(this), currentData.md, 
                                                false, "Mid", "dB", this.easyControls);

        this.hiDial = this.createCoreControlDial("hi-control", "easy-controls", FilterMinMax.gain, 
                                                this.handleHiControl.bind(this), currentData.hi, 
                                                false, "High", "dB", this.easyControls);

        this.loadAllValues();

        this.createPresetSelector(this.presetHandler.data, 
                                        this.handlePresetChange.bind(this), 
                                        this.setNewPreset.bind(this),
                                        this.handleRemovePreset.bind(this));

        this.params = new URLSearchParams(window.location.search);
        if(this.params.has(saveParamsName)){
            const data = JSON.parse(this.params.get(saveParamsName));
            this.setNewPreset('From Link');
            this.presetHandler.tempData = {...data};
            this.loadAllValues();
        }

        this.presetSelector.renderOptions();
    }

    async startAudio(){
        if (!this.noiseSynth.isInitialized) 
        {
            await this.noiseSynth.initialize(this.presetHandler.getCurrentData());
            this.noiseSynth.setVolume(this.presetHandler.getCurrentData().vol);
            this.noiseSynth.setBiqadLowpassFilterFrequency(biquadLowPass);
            this.noiseSynth.setBiqadHighpassFilterFrequency(biquadHighPass);
            this.noiseSynth.setOnePoleFrequency(this.presetHandler.getCurrentData().lpf1p);
            this.noiseSynth.setSpeechMaskGain(this.presetHandler.getCurrentData().sMask);
        }
    }

    // =====================================================================================
    // CREATE CONTROLS 
    // =====================================================================================
    //
    createCoreControlDial(htmlId, classId, minMaxPair, callback, initValue, 
                          controlIsLog, titleString, valueSuffix, parentContainer) {

        const container = document.createElement("div");
        container.classList.add(htmlId);
        container.classList.add(classId);

        const newDial = new Dial(minMaxPair.min, minMaxPair.max, 
                                 initValue, controlIsLog, 
                                 callback, null, 2, titleString, valueSuffix);

        container.appendChild(newDial.getContainer());
        parentContainer.appendChild(container);

        return newDial;
    }

    createFilterControls(filterData, changeFrequencyCallback, 
                         changeQCallback, changeGainCallback, 
                         changeTypeCallback, OnRemoveFilter) {

        const filterControls = new FilterControls(filterData, changeFrequencyCallback, 
                                                  changeQCallback, changeGainCallback, 
                                                  changeTypeCallback, OnRemoveFilter);

        this.filterControlsContainer.appendChild(filterControls.getContainer());
        return filterControls.getContainer();
    }

    createPresetSelector(data, changePresetCallback, addPresetCallback, removePresetCallback) {
        this.presetSelector = new Selector(data, changePresetCallback, addPresetCallback, removePresetCallback);
        const presetContainer = document.getElementById("preset-container");
        presetContainer.insertBefore(this.presetSelector.getContainer(), presetContainer.firstChild);
    }

    // =====================================================================================
    // HANDLERS 
    // =====================================================================================

    getScreenWidth() {
        return window.innerWidth;
    }

    toggleAdvancedControls() {
        if(this.advancedControlToggle.textContent === "Show Advanced Controls") {
            this.advancedControlToggle.textContent = "Hide Advanced Controls";
            this.advancedControlContainer.style.display = "block";
        } 
        else {
            this.advancedControlToggle.textContent = "Show Advanced Controls";
            this.advancedControlContainer.style.display = "none";
        }
    }

    handleVolumeChange(value) {
        const volume = value / dialMax;
        this.presetHandler.getCurrentData().vol = volume;
        this.noiseSynth.setVolume(volume);
    }

    handleOnePoleChange(value) {
        let min = FilterMinMax.frequency.min;
        let max = FilterMinMax.frequency.max;

        const frequency = Math.pow(10, (value / dialMax) * (Math.log10(max) - Math.log10(min)) + Math.log10(min));
        this.presetHandler.getCurrentData().lpf1p = frequency;
        this.noiseSynth.setOnePoleFrequency(frequency);
    }
    
    handleSpeechMaskChange(value) {
        const min = FilterMinMax.gain.min;
        const max = FilterMinMax.gain.max;
        const setValue = (value / dialMax) * (max - min) + min;

        this.presetHandler.getCurrentData().sMask = setValue;
        this.noiseSynth.setSpeechMaskGain(setValue);
    }

    handleLoControl(value) {
        const min = FilterMinMax.gain.min;
        const max = FilterMinMax.gain.max;
        const setValue = (value / dialMax) * (max - min) + min;

        this.presetHandler.getCurrentData().lo = setValue;
        this.noiseSynth.setLoShelfGain(setValue);
    }

    handleMidControl(value) {
        const min = FilterMinMax.gain.min;
        const max = FilterMinMax.gain.max;
        const setValue = (value / dialMax) * (max - min) + min;
        this.presetHandler.getCurrentData().md = setValue;
        this.noiseSynth.setMidGain(setValue);
    }

    handleHiControl(value) {   
        const min = FilterMinMax.gain.min;
        const max = FilterMinMax.gain.max;
        const setValue = (value / dialMax) * (max - min) + min;
        this.presetHandler.getCurrentData().hi = setValue;
        this.noiseSynth.setHiShelfGain(setValue);
    }

    handlePlayButton() {
        if(!this.noiseSynth.isPlaying){
            this.startAudio();
            this.noiseSynth.setPlayState(true);
            this.playButton.attributes.src.value = "img/stop.svg";
        }
        else{
            this.noiseSynth.setPlayState(false);
            this.playButton.attributes.src.value = "img/play.svg";
        }
    }

    addFilter(filterType = "lowpass", 
            freq = FilterMinMax.frequency.max, 
            q = FilterMinMax.Q.min, 
            gain = FilterMinMax.gain.mid) 
    {
        const filterData = this.presetHandler.addFilterData(freq, q, gain, filterType);

        this.noiseSynth.addFilterRuntime(filterData);

        this.createFilterControls(filterData, 
            this.handleFilterFrequencyDialChange.bind(this), 
            this.handleFilterQDialChange.bind(this), 
            this.handleFilterGainDialChange.bind(this),
            this.handleFilterTypeChange.bind(this),
            this.handleRemoveFilter.bind(this)
        );
    }

    clearFilterControls() {
        while (this.filterControlsContainer.firstChild) {
            this.filterControlsContainer.removeChild(this.filterControlsContainer.firstChild);
        }
    }

    handleFilterFrequencyDialChange(value, filterData) {
        const min = FilterMinMax.frequency.min;
        const max = FilterMinMax.frequency.max;
        const setValue = Math.pow(10, (value / dialMax) * (Math.log10(max) - Math.log10(min)) + Math.log10(min));

        this.noiseSynth.updateFilter(setValue, filterData, "frequency", true);
        this.presetHandler.getCurrentData().fd[filterData.id].F = setValue;
    }

    handleFilterQDialChange(value, filterData) {
        const min = FilterMinMax.Q.min;
        const max = FilterMinMax.Q.max;
        const setValue = (value / dialMax) * (max - min) + min;

        this.noiseSynth.updateFilter(setValue, filterData, "Q", false);
        this.presetHandler.getCurrentData().fd[filterData.id].Q = setValue;
    }

    handleFilterGainDialChange(value, filterData) {
        const min = FilterMinMax.gain.min;
        const max = FilterMinMax.gain.max;
        const setValue = (value / dialMax) * (max - min) + min;

        this.noiseSynth.updateFilter(setValue, filterData, "gain", false);
        this.presetHandler.getCurrentData().fd[filterData.id].G = setValue;
    }   

    handleFilterTypeChange(value, filterData) {
        this.noiseSynth.updateFilter(value, filterData, "filterType", false);
        this.presetHandler.getCurrentData().fd[filterData.id].T = value;
    }   

    handleShareButton() {
        let shareLink = this.presetHandler.getSaveLink();
        console.log(shareLink);

        let shareLinkElement = document.getElementById("share-link");
        shareLinkElement.value = shareLink;
        this.shareModal.show();
    }

    handleRemovePreset(name) {
        this.presetHandler.removePreset(name);
        this.presetSelector.renderOptions();
    }

    setNewPreset(name) {
        if(!this.presetHandler.data.presets[name]) {
            this.presetHandler.newPreset(name);
            this.presetSelector.addOption(name);
        }
        
        this.presetHandler.setCurrentPreset(name);
        this.presetSelector.setValue(name);
    }

    handleRemoveFilter(filterData) {
        this.noiseSynth.removeFilter(filterData);
        this.presetHandler.removeFilterData(filterData);
    }

    handlePresetChange(value, data) {
        this.presetHandler.setCurrentPreset(value);
        this.loadAllValues();
    }

    loadAllValues() {
        this.noiseSynth.clear();
        this.clearFilterControls();

        const keys = Object.keys(this.presetHandler.getCurrentData().fd);
        keys.forEach(key => {
            const filterData = this.presetHandler.getCurrentData().fd[key];
            this.noiseSynth.addFilterRuntime(filterData);

            this.createFilterControls(filterData, 
                this.handleFilterFrequencyDialChange.bind(this), 
                this.handleFilterQDialChange.bind(this), 
                this.handleFilterGainDialChange.bind(this),
                this.handleFilterTypeChange.bind(this),
                this.handleRemoveFilter.bind(this)
            );
        });

        this.noiseSynth.updateAudioGraph();

        const data = this.presetHandler.getCurrentData();
        this.volumeDial.setDial(data.vol);
        this.onePoleDial.setDial(data.lpf1p);
        this.speechMaskDial.setDial(data.sMask);

        this.loDial.setDial(data.lo);
        this.midDial.setDial(data.md);
        this.hiDial.setDial(data.hi);
    }
}

export default NoiseNookApp;
