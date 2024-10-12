import Model from "./Model.js";
import View from "./View.js";
import NoiseSynth from "./NoiseSynth.js";
import {dialMax, FilterMinMax} from "./Constants.js";

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

        this.view.createVolumeControl(this.handleVolumeChange.bind(this), this.model.globalValueTree.volume);
        this.view.createOnePoleControl(this.handleOnePoleChange.bind(this), this.model.globalValueTree.onePoleLowpass.frequency);
    }

    async startAudio(){
        if (!this.noiseSynth.isInitialized) 
        {
            await this.noiseSynth.initialize(this.model.globalValueTree.filterData);
            this.noiseSynth.setVolume(this.model.globalValueTree.volume);
            this.noiseSynth.setBiqadLowpassFilterFrequency(this.model.globalValueTree.biquadLowPass.frequency);
            this.noiseSynth.setBiqadHighpassFilterFrequency(this.model.globalValueTree.biquadHighPass.frequency);
            this.noiseSynth.setOnePoleFrequency(this.model.globalValueTree.onePoleLowpass.frequency);
        }
    }

    handleVolumeChange(value) {
            const volume = value / dialMax;
            this.model.updateVolume(volume);
            this.noiseSynth.setVolume(volume);
    }

    handleButterworthChange(value) {
            this.model.updateButterworthFrequency(value);
            this.noiseSynth.setBiqadLowpassFilterFrequency(value);
    }

    handleOnePoleChange(value) {
            let min = FilterMinMax.frequency.min;
            let max = FilterMinMax.frequency.max;

            const frequency = Math.pow(10, (value / dialMax) * (Math.log10(max) - Math.log10(min)) + Math.log10(min));
            this.model.updateOnePoleFrequency(frequency);
            this.noiseSynth.setOnePoleFrequency(frequency);
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
        this.noiseSynth.updateFilter(value, filterData, "frequency", true);
        this.model.globalValueTree.filterData[filterData.id].Frequency = value;
    }

    handleFilterQDialChange(value, filterData) {
        this.noiseSynth.updateFilter(value, filterData, "Q", false);
        this.model.globalValueTree.filterData[filterData.id].Q = value;
    }

    handleFilterGainDialChange(value, filterData) {
        this.noiseSynth.updateFilter(value, filterData, "gain", false);
        this.model.globalValueTree.filterData[filterData.id].Gain = value;
    }   

    handleFilterTypeChange(value, filterData) {
        this.noiseSynth.updateFilter(value, filterData, "filterType", false);
        this.model.globalValueTree.filterData[filterData.id].FilterType = value;
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

        Object.keys(this.model.globalValueTree.filterData).forEach(key => {
            const filter = this.model.globalValueTree.filterData[key];
            this.addFilter(filter.filterFype, filter.Frequency, filter.Q, filter.Gain);
        });

        this.view.createVolumeControl(this.handleVolumeChange.bind(this), this.model.globalValueTree.volume);
        this.view.createOnePoleControl(this.handleOnePoleChange.bind(this), this.model.globalValueTree.onePoleLowpass.frequency);
        this.noiseSynth.updateAudioGraph();
    }
}

export default Controller;