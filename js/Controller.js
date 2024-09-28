import Model from './Model.js';
import View from './View.js';
import NoiseSynth from './NoiseSynth.js';
import './Constants.js';

class Controller {
    constructor() {
        this.model = new Model();
        this.view = new View();
        this.noiseSynth = new NoiseSynth();
        
        this.view.bindVolumeSliderChange(this.handleVolumeChange.bind(this));
        this.view.bindButterworthSliderChange(this.handleButterworthChange.bind(this));
        this.view.bindOnePoleSliderChange(this.handleOnePoleChange.bind(this));

        this.view.bindPlayButton(this.handlePlayButton.bind(this));
        this.view.bindAddFilterButton(this.handleAddFilterButton.bind(this));
        this.view.bindSaveButton(this.handleSaveButton.bind(this));
        this.view.bindLoadButton(this.handleLoadButton.bind(this));

        this.view.bindClearLocalStorageButton(this.handleClearLocalStorageButton.bind(this));
    }

    async startAudio(){
        if (!this.noiseSynth.audioContext) 
        {
            await this.noiseSynth.initialize();
        }
        this.noiseSynth.audioContext.resume();
    }

    handleVolumeChange(value) {
        this.model.updateVolume(value);
        this.noiseSynth.setVolume(value);
    }

    handleButterworthChange(value) {
        this.model.updateButterworthFrequency(value);
        this.noiseSynth.setBiqadFilterFrequency(value);
    }

    handleOnePoleChange(value) {
        this.model.updateOnePoleFrequency(value);
        this.noiseSynth.setOnePoleFrequency(value);
    }

    handlePlayButton() {
        this.startAudio();
    }

    handleAddFilterButton() {
        this.addFilter();
    }

    addFilter(filterType = "lowpass", frequency = 18000.0, Q = 0.0, gain = 0.0) {
        const filter = this.noiseSynth.addFilter();
        filter.type = filterType;
        filter.frequency.value = frequency;
        filter.Q.value = Q;
        filter.gain.value = gain;

        this.model.addFilter(filter);

        this.view.createFilterControls(filter, 
            this.handleFilterFrequencyChange.bind(this), 
            this.handleFilterQChange.bind(this), 
            this.handleFilterGainChange.bind(this),
            this.handleRemoveFilter.bind(this)
        );
    }

    handleFilterFrequencyChange(value, filter) {
        this.noiseSynth.updateFilter(value, filter, "frequency", true);
    }

    handleFilterQChange(value, filter) {
        this.noiseSynth.updateFilter(value, filter, "Q", false);
    }

    handleFilterGainChange(value, filter) {
        this.noiseSynth.updateFilter(value, filter, "gain", false);
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
     
    handleRemoveFilter(filter) {
        this.noiseSynth.removeFilter(filter);
        this.model.removeFilter(filter);
    }

    saveAllValues() {
        this.model.saveValues();
        console.log("Saved values");
    }

    loadAllValues() {
        this.noiseSynth.clear();

        this.model.loadValues();

        this.view.clearFilterControls();
        this.view.updateAllSliders(this.model.globalValueTree);

        this.model.globalValueTree.filterSettings.forEach(filter => {
            this.addFilter(filter.type, filter.frequency, filter.Q, filter.gain);
        });

        console.log("Loaded values");
    }
}

export default Controller;