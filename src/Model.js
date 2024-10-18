import { saveParamsName } from "./Constants.js";

class Model {
    constructor() {
        this.data = {
            vol: 0.2,
            lpf1p: { f: 500.0 },
            lo: {g: 0.0},
            md: {g: 0.0},
            hi: {g: 0.0},
            fd: {
            }
        };

    }

    saveValues() {
        localStorage.setItem("data", JSON.stringify(this.data));
        
        console.log("Saved values: ");
        console.log(this.data);
        console.log("Save link: ");
        console.log(this.getSaveLink());
    }

    loadValues() {
        this.data = JSON.parse(localStorage.getItem("data"));
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
        url.searchParams.set(saveParamsName, JSON.stringify(this.data));
        console.log(url.toString());
    }

    addFilter(freq, q, gain, filterType){
        const filterDataEntry = {id: Date.now(), F: freq, Q: q, G: gain, T: filterType};
        this.data.fd[filterDataEntry.id] = filterDataEntry;
        return filterDataEntry;
    }

    removeFilter(filterData){
        delete this.data.fd[filterData.id]
    }

    updateVolume(value) {
        this.data.vol = value;
    }

    updateOnePoleFrequency(value) {
        this.data.lpf1p.f = value;
    }

    clearLocalStorage() {
        localStorage.clear();
    }
}

export default Model;