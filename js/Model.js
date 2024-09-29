
class Model {
    constructor() {
        this.globalValueTree = {
            biquadLowPass: { frequency: 14000.0 },
            biquadHighPass: { frequency: 40.0 },
            onePoleLowpass: { frequency: 500.0 },
            volume: 0.2,
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

        localStorage.setItem("globalvalues", JSON.stringify(this.globalValueTree));
        
        console.log("Saved values: ");
        console.log(this.globalValueTree);
    }

    loadValues() {
        this.globalValueTree = JSON.parse(localStorage.getItem("globalvalues"));
        if(!this.globalValueTree){
            return;
        }

        this.filters = [];

        console.log("Loaded values: ");
        console.log(this.globalValueTree);
    }

    setFilters(newFilters) {
        this.filters = newFilters;
    }

    addFilter(filter){
        this.filters.push(filter);
        console.log("Filter added");
        console.log(this.filters);
    }

    removeFilter(filter){
        const index = this.filters.indexOf(filter);
        if (index > -1) {
            this.filters.splice(index, 1);
        }
        console.log("Filter removed");
        console.log(this.filters);
    }

    updateVolume(value) {
        this.globalValueTree.volume = value;
        console.log(`Volume updated to: ${value}`);
    }

    updateButterworthFrequency(value) {
        this.globalValueTree.biquadLowPass.frequency = value;
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