
class Model {
    constructor() {
        this.data = {
            lpf1p: { f: 500.0 },
            vol: 0.2,
            fd: {}
        };

    }

    saveValues() {
        localStorage.setItem("globalvalues", JSON.stringify(this.data));
        
        console.log("Saved values: ");
        console.log(this.data);
    }

    loadValues() {
        this.data = JSON.parse(localStorage.getItem("globalvalues"));
        if(!this.data){
            this.data = {
                lpf1p: { f: 500.0 },
                vol: 0.2,
                fd: {}
            };
            return;
        }

        this.filters = [];

        console.log("Loaded values: ");
        console.log(this.data);
    }

    getSaveLink(){
        const url = new URL(window.location);
        url.searchParams.set("params", JSON.stringify(this.data));
        console.log(url.toString());
    }

    addFilter(freq, q, gain, filterType){
        const filterDataEntry = {id: Date.now(), Frequency: freq, Q: q, Gain: gain, FilterType: filterType};
        this.data.fd[filterDataEntry.id] = filterDataEntry;
        return filterDataEntry;
    }

    removeFilter(filterData){
        delete this.data.fd[filterData.id]
    }

    updateVolume(value) {
        this.data.vol = value;
    }

    updateButterworthFrequency(value) {
        this.data.biquadLowPass.frequency = value;
    }

    updateOnePoleFrequency(value) {
        this.data.lpf1p.f = value;
    }

    clearLocalStorage() {
        localStorage.clear();
    }
}

export default Model;