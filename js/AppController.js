import Model from './Model.js';
import View from './View.js';
import NoiseSynth from './NoiseSynth.js';

class Controller {
    constructor() {
        this.gainNode = 
        this.model = new Model();
        this.view = new View();
        
        this.view.bindVolumeSliderChange(this.handleVolumeChange.bind(this));
        this.view.bindButterworthSliderChange(this.handleButterworthChange.bind(this));
        this.view.bindOnePoleSliderChange(this.handleOnePoleChange.bind(this));

        this.view.bindPlayButton(this.handlePlayButton.bind(this));
        this.view.bindAddFilterButton(this.handleAddFilterButton.bind(this));
        this.view.bindSaveButton(this.handleSaveButton.bind(this));
        this.view.bindLoadButton(this.handleLoadButton.bind(this));

        this.view.bindClearLocalStorageButton(this.handleClearLocalStorageButton.bind(this));

        this.noiseSynth = new NoiseSynth();
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
        const filter = this.noiseSynth.addFilter();
        this.model.addFilter(filter);
        this.view.createFilterControls(filter);
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

    disconnectAll() {
        // Implementation for disconnecting all filters
    }

    addFilterNoAudioUpdate(type, frequency, Q, gain) {
        // Implementation for adding a filter without audio update
    }

    saveAllValues() {
        this.model.saveValues();
        console.log("Saved values");
    }

    loadAllValues() {
        this.disconnectAll();
        // this.view.clearFilterControls();
        // this.model.setFilters([]);

        this.model.loadValues();
        this.view.updateAllSliders(this.model.globalValueTree);

        // this.model.globalValueTree.filterSettings.forEach(filter => {
        //     this.addFilterNoAudioUpdate(filter.type, filter.frequency, filter.Q, filter.gain);
        // });
        console.log("Loaded values");
    }
}

export default Controller;