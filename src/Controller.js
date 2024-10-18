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
        this.view.bindLoadButton(this.handleLoadButton.bind(this));
        this.view.bindClearLocalStorageButton(this.handleClearLocalStorageButton.bind(this));

        this.view.createVolumeControl(this.handleVolumeChange.bind(this), this.model.data.vol);
        this.view.createOnePoleControl(this.handleOnePoleChange.bind(this), this.model.data.lpf1p);
        this.view.createSpeechMaskControl(this.handleSpeechMaskChange.bind(this), this.model.data.sMask);

        this.view.createLoControl(this.handleLoControl.bind(this), this.model.data.lo);
        this.view.createMidControl(this.handleMidControl.bind(this), this.model.data.md);
        this.view.createHiControl(this.handleHiControl.bind(this), this.model.data.hi);

        this.params = new URLSearchParams(window.location.search);
        if(this.params.has(saveParamsName)){
            this.model.data = JSON.parse(this.params.get(saveParamsName));
            this.initFromPreset();
        }
    }

    async startAudio(){
        if (!this.noiseSynth.isInitialized) 
        {
            await this.noiseSynth.initialize(this.model.data);
            this.noiseSynth.setVolume(this.model.data.vol);
            this.noiseSynth.setBiqadLowpassFilterFrequency(biquadLowPass);
            this.noiseSynth.setBiqadHighpassFilterFrequency(biquadHighPass);
            this.noiseSynth.setOnePoleFrequency(this.model.data.lpf1p);
            this.noiseSynth.setSpeechMaskGain(this.model.data.sMask);
        }
    }

    handleVolumeChange(value) {
        const volume = value / dialMax;
        this.model.updateVolume(volume);
        this.noiseSynth.setVolume(volume);
    }

    handleOnePoleChange(value) {
        let min = FilterMinMax.frequency.min;
        let max = FilterMinMax.frequency.max;

        const frequency = Math.pow(10, (value / dialMax) * (Math.log10(max) - Math.log10(min)) + Math.log10(min));
        this.model.updateOnePoleFrequency(frequency);
        this.noiseSynth.setOnePoleFrequency(frequency);
    }
    
    handleSpeechMaskChange(value) {
        const min = FilterMinMax.gain.min;
        const max = FilterMinMax.gain.max;
        const setValue = (value / dialMax) * (max - min) + min;

        this.model.data.sMask = setValue;
        this.noiseSynth.setSpeechMaskGain(setValue);
    }

    handleLoControl(value) {
        const min = FilterMinMax.gain.min;
        const max = FilterMinMax.gain.max;
        const setValue = (value / dialMax) * (max - min) + min;

        this.model.data.lo = setValue;
        this.noiseSynth.setLoShelfGain(setValue);
    }

    handleMidControl(value) {
        const min = FilterMinMax.gain.min;
        const max = FilterMinMax.gain.max;
        const setValue = (value / dialMax) * (max - min) + min;
        this.model.data.md = setValue;
        this.noiseSynth.setMidGain(setValue);
    }

    handleHiControl(value) {   
        const min = FilterMinMax.gain.min;
        const max = FilterMinMax.gain.max;
        const setValue = (value / dialMax) * (max - min) + min;
        this.model.data.hi = setValue;
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
        const filterData = this.model.addFilter(freq, q, gain, filterType);

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
        this.model.data.fd[filterData.id].F = setValue;
    }

    handleFilterQDialChange(value, filterData) {
        const min = FilterMinMax.Q.min;
        const max = FilterMinMax.Q.max;
        const setValue = (value / dialMax) * (max - min) + min;

        this.noiseSynth.updateFilter(setValue, filterData, "Q", false);
        this.model.data.fd[filterData.id].Q = setValue;
    }

    handleFilterGainDialChange(value, filterData) {
        const min = FilterMinMax.gain.min;
        const max = FilterMinMax.gain.max;
        const setValue = (value / dialMax) * (max - min) + min;

        this.noiseSynth.updateFilter(setValue, filterData, "gain", false);
        this.model.data.fd[filterData.id].G = setValue;
    }   

    handleFilterTypeChange(value, filterData) {
        this.noiseSynth.updateFilter(value, filterData, "filterType", false);
        this.model.data.fd[filterData.id].T = value;
    }   

    handleSaveButton() {
        this.saveAllValues();
    }

    handleLoadButton() {
        this.loadAllValues();
    }

    handleClearLocalStorageButton() {
        this.model.clearLocalStorage();
    }
     
    handleRemoveFilter(filterData) {
        this.noiseSynth.removeFilter(filterData);
        this.model.removeFilter(filterData);
    }

    saveAllValues() {
        this.model.saveValues();
    }

    loadAllValues() {
        this.noiseSynth.clear();
        this.model.loadValues();
        this.view.clearFilterControls();

        const keys = Object.keys(this.model.data.fd);
        keys.forEach(key => {
            const filterData = this.model.data.fd[key];
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
        this.view.updateAllDials(this.model.data);
    }


    initFromPreset() {
        const keys = Object.keys(this.model.data.fd);
        keys.forEach(key => {
            const filterData = this.model.data.fd[key];
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
        this.view.updateAllDials(this.model.data);
    }
}

export default Controller;
