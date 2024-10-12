
class Model {
    constructor() {
        this.globalValueTree = {
            biquadLowPass: { frequency: 14000.0 },
            biquadHighPass: { frequency: 40.0 },
            onePoleLowpass: { frequency: 500.0 },
            volume: 0.2,
            filterData: {}
        };
    }

    saveValues() {
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

    addFilter(freq, q, gain, filterType){
        const filterDataEntry = {id: Date.now(), Frequency: freq, Q: q, Gain: gain, FilterType: filterType};
        this.globalValueTree.filterData[filterDataEntry.id] = filterDataEntry;
        return filterDataEntry;
    }

    removeFilter(filterData){
        delete this.globalValueTree.filterData[filterData.id]
    }

    updateVolume(value) {
        this.globalValueTree.volume = value;
    }

    updateButterworthFrequency(value) {
        this.globalValueTree.biquadLowPass.frequency = value;
    }

    updateOnePoleFrequency(value) {
        this.globalValueTree.onePoleLowpass.frequency = value;
    }

    clearLocalStorage() {
        localStorage.clear();
    }
}

export default Model;