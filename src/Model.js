import { saveParamsName, initData } from "./Constants.js";

class Model {
    constructor() {
        this.data = {current: 'default', presets: {}};
        this.tempData = {...initData}
        this.loadValues();
        this.setCurrentPreset('default');
    }

    saveValues() {
        this.data.presets[this.data['current']] = {...this.getCurrentData()};

        localStorage.setItem("data", JSON.stringify(this.data));
        
        console.log("Saved values: ");
        console.log(this.data);
        console.log("Save link: ");
        console.log(this.getSaveLink());
    }
    
    initData() {
        this.data = {current: 'default', presets: {}};
        this.data.presets['default'] = {...initData};
        this.data['current'] = 'default';
        this.tempData = {...initData}
    }

    loadValues() {
        this.data = JSON.parse(localStorage.getItem("data"));
        if(!this.data || !this.data.presets) {
            this.initData();
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
        this.tempData = {...this.data.presets[value]};
    }

    getCurrentPreset() {
        return this.data.presets[this.data['current']];
    }

    getCurrentData() {
        return this.tempData;
    }

    getSaveLink(){
        const url = new URL(window.location);
        url.searchParams.set(saveParamsName, JSON.stringify(this.getCurrentData()));
        console.log(url.toString());
    }

    addFilterData(freq, q, gain, filterType){
        const filterDataEntry = {id: Date.now(), F: freq, Q: q, G: gain, T: filterType};
        this.getCurrentData().fd[filterDataEntry.id] = filterDataEntry;
        return filterDataEntry;
    }

    removeFilterData(filterData){
        delete this.getCurrentData().fd[filterData.id]
    }

    clearLocalStorage() {
        localStorage.clear();
    }
}

export default Model;