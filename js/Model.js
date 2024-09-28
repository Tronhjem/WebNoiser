
class Model {
    constructor() {
        this.globalValueTree = {
            biquadFilter: { frequency: 1 },
            onePoleLowpass: { frequency: 1 },
            volume: 0.5,
            filterSettings: []
        };
        this.filters = [];
    }

    saveValues() {
        this.globalValueTree.filterSettings = [];

        this.globalValueTree.filterSettings = this.filters.map(filter => {
            return {
                type: filter.type,
                frequency: filter.frequency.value,
                Q: filter.Q.value,
                gain: filter.gain.value
            };
        });

        localStorage.setItem('globalvalues', JSON.stringify(this.globalValueTree));
    }

    loadValues() {
        this.globalValueTree = JSON.parse(localStorage.getItem('globalvalues'));
        if(!this.globalValueTree){
            return;
        }

        this.filters = [];

        // globalValueTree.filterSettings.forEach(filter => {
        //     addFilterNoAudioUpdate(filter.type, filter.frequency, filter.Q, filter.gain);
        // });

        console.log("Loaded values: ");
        console.log(this.globalValueTree);
    }

    setFilters(newFilters) {
        this.filters = newFilters;
    }

    addFilter(filter){
        this.filters.push(filter);
        console.log("Filter added");
    }

    updateVolume(value) {
        this.globalValueTree.volume = value;
        console.log(`Volume updated to: ${value}`);
    }

    updateButterworthFrequency(value) {
        this.globalValueTree.biquadFilter.frequency = value;
        console.log(`Butterworth frequency updated to: ${value}`);
    }

    updateOnePoleFrequency(value) {
        this.globalValueTree.onePoleLowpass.frequency = value;
        console.log(`One Pole frequency updated to: ${value}`);
    }

    clearLocalStorage() {
        localStorage.clear();
        console.log("Local storage cleared");
    }
}

export default Model;