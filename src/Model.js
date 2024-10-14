
class Model {
    constructor() {
        this.biquadLowPass = 14000.0
        this.biquadHighPass = 40.0;
        this.globalValueTree = {
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
            this.globalValueTree = {
                biquadLowPass: { frequency: 14000.0 },
                biquadHighPass: { frequency: 40.0 },
                onePoleLowpass: { frequency: 500.0 },
                volume: 0.2,
                filterData: {}
            };
            return;
        }

        this.filters = [];

        console.log("Loaded values: ");
        console.log(this.globalValueTree);
    }

    getSaveLink(){
        const url = new URL(window.location);
        url.searchParams.set("params", JSON.stringify(this.globalValueTree));
        console.log(url.toString());
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