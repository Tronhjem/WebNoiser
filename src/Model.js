import { saveParamsName, initData } from "./Constants.js";

class Model {
    constructor() {
        this.data = {};
        this.tempData = {};
        this.loadValues();
        this.setCurrentPreset(this.data['current']);
    }

    saveValues() {
        this.data.presets[this.data['current']] = this.deepCopy(this.getCurrentData());

        localStorage.setItem("data", JSON.stringify(this.data));
        
        console.log("Saved values: ");
        console.log(this.data);
        console.log("Save link: ");
        console.log(this.getSaveLink());
    }

    deepCopy(obj) {
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }

        if (Array.isArray(obj)) {
            const copy = [];
            for (let i = 0; i < obj.length; i++) {
                copy[i] = this.deepCopy(obj[i]);
            }
            return copy;
        }

        const copy = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                copy[key] = this.deepCopy(obj[key]);
            }
        }
        return copy;
    }
    
    initData() {
        this.data = {current: 'default', presets: {}};
        this.data.presets['default'] = this.deepCopy(initData);
        this.data['current'] = 'default';
        this.tempData = this.deepCopy(initData);
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
        this.data['current'] = name;
        this.data.presets[name] = this.deepCopy(this.getCurrentData());
    }
    
    removePreset(name){
        delete this.data.presets[name];
        this.data['current'] = 'default';
        this.tempData = this.deepCopy(this.data.presets['default']);
    }

    setCurrentPreset(value) {
        this.data['current'] = value;
        this.tempData = this.deepCopy(this.data.presets[value]);
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
        return url.toString();
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
