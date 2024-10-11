import Model from "./Model.js";
import View from "./View.js";
import NoiseSynth from "./NoiseSynth.js";
import {dialMax, FilterMinMax} from "./Constants.js";

class Controller {
    constructor() {
        this.model = new Model();
        this.view = new View();
        this.noiseSynth = new NoiseSynth();
        this.audioIsInit = false;
        
        this.view.bindPlayButton(this.handlePlayButton.bind(this));
        this.view.bindAddFilterButton(this.handleAddFilterButton.bind(this));
        this.view.bindSaveButton(this.handleSaveButton.bind(this));
        this.view.bindLoadButton(this.handleLoadButton.bind(this));

        this.view.bindClearLocalStorageButton(this.handleClearLocalStorageButton.bind(this));

        this.view.createVolumeControl(this.handleVolumeChange.bind(this), this.model.globalValueTree.volume);
        this.view.createOnePoleControl(this.handleOnePoleChange.bind(this), this.model.globalValueTree.onePoleLowpass.frequency);
    }

    async startAudio(){
        if (!this.noiseSynth.audioContext) 
        {
            await this.noiseSynth.initialize();
            this.audioIsInit = true;
            this.noiseSynth.setVolume(this.model.globalValueTree.volume);
            this.noiseSynth.setBiqadLowpassFilterFrequency(this.model.globalValueTree.biquadLowPass.frequency);
            this.noiseSynth.setBiqadHighpassFilterFrequency(this.model.globalValueTree.biquadHighPass.frequency);
            this.noiseSynth.setOnePoleFrequency(this.model.globalValueTree.onePoleLowpass.frequency);
        }
    }

    handleVolumeChange(value) {
            const volume = value / dialMax;
            this.model.updateVolume(volume);
        if(this.audioIsInit){
            this.noiseSynth.setVolume(volume);
        }
    }

    handleButterworthChange(value) {
            this.model.updateButterworthFrequency(value);
        if(this.audioIsInit){
            this.noiseSynth.setBiqadLowpassFilterFrequency(value);
        }
    }

    handleOnePoleChange(value) {
            let min = FilterMinMax.frequency.min;
            let max = FilterMinMax.frequency.max;

            const frequency = Math.pow(10, (value / dialMax) * (Math.log10(max) - Math.log10(min)) + Math.log10(min));
            this.model.updateOnePoleFrequency(frequency);
        if(this.audioIsInit){
            this.noiseSynth.setOnePoleFrequency(frequency);
        }
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

        if (this.audioIsInit) {
            this.noiseSynth.addFilter(filterData);
        }

        this.view.createFilterControls(filterData, 
            this.handleFilterFrequencyDialChange.bind(this), 
            this.handleFilterQDialChange.bind(this), 
            this.handleFilterGainDialChange.bind(this),
            this.handleRemoveFilter.bind(this)
        );
    }

    handleFilterFrequencyDialChange(value, filter) {
        this.noiseSynth.updateFilter(value, filter, "frequency", true);
        this.model.filterData[filter.id].Frequency = value;
    }

    handleFilterQDialChange(value, filter) {
        this.noiseSynth.updateFilter(value, filter, "Q", false);
        this.model.filterData[filter.id].Q = value;
    }

    handleFilterGainDialChange(value, filter) {
        this.noiseSynth.updateFilter(value, filter, "gain", false);
        this.model.filterData[filter.id].Gain = value;
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
        console.log(this.model.filterData);
    }

    saveAllValues() {
        this.model.saveValues();
        console.log("Saved values");
    }

    loadAllValues() {
        this.noiseSynth.clear();
        this.model.loadValues();
        this.view.clearFilterControls();

        this.model.globalValueTree.filterSettings.forEach(filter => {
            this.addFilter(filter.type, filter.frequency, filter.Q, filter.gain);
        });

        this.view.createVolumeControl(this.handleVolumeChange.bind(this), this.model.globalValueTree.volume);
        this.view.createOnePoleControl(this.handleOnePoleChange.bind(this), this.model.globalValueTree.onePoleLowpass.frequency);
        this.noiseSynth.updateAudioGraph();
    }
}

export default Controller;