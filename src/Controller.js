import Model from "./Model.js";
import View from "./View.js";
import NoiseSynth from "./NoiseSynth.js";
import {dialMax, FilterMinMax, biquadLowPass, biquadHighPass, saveParamsName} from "./Constants.js";

class Controller {
    constructor() {
        this.model = new Model();
        this.view = new View();
        this.noiseSynth = new NoiseSynth();
        
        this.view.bindPlayButton(this.handlePlayButton.bind(this));
        this.view.bindAddFilterButton(this.handleAddFilterButton.bind(this));
        this.view.bindSaveButton(this.handleSaveButton.bind(this));
        this.view.bindClearLocalStorageButton(this.handleClearLocalStorageButton.bind(this));

        this.view.createVolumeControl(this.handleVolumeChange.bind(this), this.model.getCurrentData().vol);
        this.view.createOnePoleControl(this.handleOnePoleChange.bind(this), this.model.getCurrentData().lpf1p);
        this.view.createSpeechMaskControl(this.handleSpeechMaskChange.bind(this), this.model.getCurrentData().sMask);

        this.view.createLoControl(this.handleLoControl.bind(this), this.model.getCurrentData().lo);
        this.view.createMidControl(this.handleMidControl.bind(this), this.model.getCurrentData().md);
        this.view.createHiControl(this.handleHiControl.bind(this), this.model.getCurrentData().hi);

        this.loadAllValues();

        this.view.createPresetSelector(this.model.data, this.handlePresetChange.bind(this), this.handleAddPreset.bind(this), this.handleRemovePreset.bind(this));

        this.params = new URLSearchParams(window.location.search);
        if(this.params.has(saveParamsName)){
            const data = JSON.parse(this.params.get(saveParamsName));
            this.setNewPreset('From Link');
            this.model.tempData = {...data};
            this.loadAllValues();
        }

        this.view.updateSelectorView();
    }

    async startAudio(){
        if (!this.noiseSynth.isInitialized) 
        {
            await this.noiseSynth.initialize(this.model.getCurrentData());
            this.noiseSynth.setVolume(this.model.getCurrentData().vol);
            this.noiseSynth.setBiqadLowpassFilterFrequency(biquadLowPass);
            this.noiseSynth.setBiqadHighpassFilterFrequency(biquadHighPass);
            this.noiseSynth.setOnePoleFrequency(this.model.getCurrentData().lpf1p);
            this.noiseSynth.setSpeechMaskGain(this.model.getCurrentData().sMask);
        }
    }

    handleVolumeChange(value) {
        const volume = value / dialMax;
        this.model.getCurrentData().vol = volume;
        this.noiseSynth.setVolume(volume);
    }

    handleOnePoleChange(value) {
        let min = FilterMinMax.frequency.min;
        let max = FilterMinMax.frequency.max;

        const frequency = Math.pow(10, (value / dialMax) * (Math.log10(max) - Math.log10(min)) + Math.log10(min));
        this.model.getCurrentData().lpf1p = frequency;
        this.noiseSynth.setOnePoleFrequency(frequency);
    }
    
    handleSpeechMaskChange(value) {
        const min = FilterMinMax.gain.min;
        const max = FilterMinMax.gain.max;
        const setValue = (value / dialMax) * (max - min) + min;

        this.model.getCurrentData().sMask = setValue;
        this.noiseSynth.setSpeechMaskGain(setValue);
    }

    handleLoControl(value) {
        const min = FilterMinMax.gain.min;
        const max = FilterMinMax.gain.max;
        const setValue = (value / dialMax) * (max - min) + min;

        this.model.getCurrentData().lo = setValue;
        this.noiseSynth.setLoShelfGain(setValue);
    }

    handleMidControl(value) {
        const min = FilterMinMax.gain.min;
        const max = FilterMinMax.gain.max;
        const setValue = (value / dialMax) * (max - min) + min;
        this.model.getCurrentData().md = setValue;
        this.noiseSynth.setMidGain(setValue);
    }

    handleHiControl(value) {   
        const min = FilterMinMax.gain.min;
        const max = FilterMinMax.gain.max;
        const setValue = (value / dialMax) * (max - min) + min;
        this.model.getCurrentData().hi = setValue;
        this.noiseSynth.setHiShelfGain(setValue);
    }

    handlePlayButton() {
        this.startAudio();
    }

    handleAddFilterButton() {
        this.addFilter();
    }

    addFilter(filterType = "lowpass", 
            freq = FilterMinMax.frequency.max, 
            q = FilterMinMax.Q.min, 
            gain = FilterMinMax.gain.mid) 
    {
        const filterData = this.model.addFilterData(freq, q, gain, filterType);

        this.noiseSynth.addFilterRuntime(filterData);

        this.view.createFilterControls(filterData, 
            this.handleFilterFrequencyDialChange.bind(this), 
            this.handleFilterQDialChange.bind(this), 
            this.handleFilterGainDialChange.bind(this),
            this.handleFilterTypeChange.bind(this),
            this.handleRemoveFilter.bind(this)
        );
    }

    handleFilterFrequencyDialChange(value, filterData) {
        const min = FilterMinMax.frequency.min;
        const max = FilterMinMax.frequency.max;
        const setValue = Math.pow(10, (value / dialMax) * (Math.log10(max) - Math.log10(min)) + Math.log10(min));

        this.noiseSynth.updateFilter(setValue, filterData, "frequency", true);
        this.model.getCurrentData().fd[filterData.id].F = setValue;
    }

    handleFilterQDialChange(value, filterData) {
        const min = FilterMinMax.Q.min;
        const max = FilterMinMax.Q.max;
        const setValue = (value / dialMax) * (max - min) + min;

        this.noiseSynth.updateFilter(setValue, filterData, "Q", false);
        this.model.getCurrentData().fd[filterData.id].Q = setValue;
    }

    handleFilterGainDialChange(value, filterData) {
        const min = FilterMinMax.gain.min;
        const max = FilterMinMax.gain.max;
        const setValue = (value / dialMax) * (max - min) + min;

        this.noiseSynth.updateFilter(setValue, filterData, "gain", false);
        this.model.getCurrentData().fd[filterData.id].G = setValue;
    }   

    handleFilterTypeChange(value, filterData) {
        this.noiseSynth.updateFilter(value, filterData, "filterType", false);
        this.model.getCurrentData().fd[filterData.id].T = value;
    }   

    handleSaveButton() {
        this.saveAllValues();
    }

    handleAddPreset(name){
        // const name = Date.now();
        this.setNewPreset(name);
    }

    handleRemovePreset(name) {
        this.model.removePreset(name);
        this.view.updateSelectorView();
    }

    setNewPreset(name) {
        if(!this.model.data.presets[name]) {
            this.model.newPreset(name);
            this.view.addNewPresetName(name);
        }
        
        this.model.setCurrentPreset(name);
        this.view.setPresetSelectorName(name);
    }

    handleClearLocalStorageButton() {
        this.model.clearLocalStorage();
    }
     
    handleRemoveFilter(filterData) {
        this.noiseSynth.removeFilter(filterData);
        this.model.removeFilterData(filterData);
    }

    handlePresetChange(value, data) {
        this.model.setCurrentPreset(value);
        this.loadAllValues();
    }

    saveAllValues() {
        this.model.saveValues();
    }

    loadAllValues() {
        this.noiseSynth.clear();
        this.view.clearFilterControls();

        const keys = Object.keys(this.model.getCurrentData().fd);
        keys.forEach(key => {
            const filterData = this.model.getCurrentData().fd[key];
            this.noiseSynth.addFilterRuntime(filterData);

            this.view.createFilterControls(filterData, 
                this.handleFilterFrequencyDialChange.bind(this), 
                this.handleFilterQDialChange.bind(this), 
                this.handleFilterGainDialChange.bind(this),
                this.handleFilterTypeChange.bind(this),
                this.handleRemoveFilter.bind(this)
            );
        });

        this.noiseSynth.updateAudioGraph();
        this.view.updateAllDials(this.model.getCurrentData());
    }
}

export default Controller;
