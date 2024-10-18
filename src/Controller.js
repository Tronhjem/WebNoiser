import Model from "./Model.js";
import View from "./View.js";
import NoiseSynth from "./NoiseSynth.js";
import {dialMax, FilterMinMax, biquadLowPass, biquadHighPass} from "./Constants.js";

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

        this.params = new URLSearchParams(window.location.search);
        if(this.params.has("params")){
            this.model.globalValueTree = JSON.parse(this.params.get("params"));
            this.initFromPreset();
        }
    }

    async startAudio(){
        if (!this.noiseSynth.isInitialized) 
        {
            await this.noiseSynth.initialize(this.model.globalValueTree.filterData);
            this.noiseSynth.setVolume(this.model.globalValueTree.volume);
            this.noiseSynth.setBiqadLowpassFilterFrequency(biquadLowPass);
            this.noiseSynth.setBiqadHighpassFilterFrequency(biquadHighPass);
            this.noiseSynth.setOnePoleFrequency(this.model.globalValueTree.onePoleLowpass.frequency);
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
        this.model.globalValueTree.filterData[filterData.id].Frequency = setValue;
    }

    handleFilterQDialChange(value, filterData) {
        const min = FilterMinMax.Q.min;
        const max = FilterMinMax.Q.max;
        const setValue = (value / dialMax) * (max - min) + min;

        this.noiseSynth.updateFilter(setValue, filterData, "Q", false);
        this.model.globalValueTree.filterData[filterData.id].Q = setValue;
    }

    handleFilterGainDialChange(value, filterData) {
        const min = FilterMinMax.gain.min;
        const max = FilterMinMax.gain.max;
        const setValue = (value / dialMax) * (max - min) + min;

        this.noiseSynth.updateFilter(setValue, filterData, "gain", false);
        this.model.globalValueTree.filterData[filterData.id].Gain = setValue;
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
    }

    saveAllValues() {
        this.model.saveValues();
    }

    loadAllValues() {
        this.noiseSynth.clear();
        this.model.loadValues();
        this.view.clearFilterControls();

        const keys = Object.keys(this.model.globalValueTree.filterData);
        keys.forEach(key => {
            const filterData = this.model.globalValueTree.filterData[key];
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
        this.view.updateAllDials(this.model.globalValueTree);
    }


    initFromPreset() {
        const keys = Object.keys(this.model.globalValueTree.filterData);
        keys.forEach(key => {
            const filterData = this.model.globalValueTree.filterData[key];
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
        this.view.updateAllDials(this.model.globalValueTree);
    }


}

export default Controller;
