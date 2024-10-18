import { saveParamsName, initData } from "./Constants.js";

class Model {
    constructor() {
        this.data = {current: 'default', presets: {}};
        this.loadValues();
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
        if(!this.data || !this.data.presets) {
            this.data = {current: 'default', presets: {}};
            this.data.presets['default'] = {...initData};
            this.data['current'] = 'default';

            return;
        }

        console.log("Load values: ");
        console.log(this.data);
    }

    newPreset(name){
        this.data.presets[name] = {...this.getCurrentData()};
        this.setCurrentPreset(name);
    }

    setCurrentPreset(value) {
        this.data['current'] = value;
    }

    setData(property, value) {
        this.data.presets[this.currentPreset][property] = value;
    }

    setFilterData(property, filter, value) {
        this.getCurrentData().fd[filter.id][property] = value;
    }

    getCurrentData() {
        return this.data.presets[this.data['current']];
    }

    getSaveLink(){
        const url = new URL(window.location);
        url.searchParams.set(saveParamsName, JSON.stringify(this.getCurrentData()));
        console.log(url.toString());
    }

    addFilter(freq, q, gain, filterType){
        const filterDataEntry = {id: Date.now(), F: freq, Q: q, G: gain, T: filterType};
        this.getCurrentData().fd[filterDataEntry.id] = filterDataEntry;
        return filterDataEntry;
    }

    removeFilter(filterData){
        delete this.getCurrentData().fd[filterData.id]
    }

    updateVolume(value) {
        this.getCurrentData().vol = value;
    }

    updateOnePoleFrequency(value) {
        this.getCurrentData().lpf1p = value;
    }

    clearLocalStorage() {
        localStorage.clear();
    }
}

export default Model;