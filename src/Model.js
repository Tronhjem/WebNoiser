import { saveParamsName, initData } from "./Constants.js";

class Model {
    constructor() {
        this.data = {...initData};
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
            this.data = { ...initData };

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
        this.data.lpf1p = value;
    }

    clearLocalStorage() {
        localStorage.clear();
    }
}

export default Model;