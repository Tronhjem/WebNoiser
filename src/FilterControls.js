import Dial from "./Dial.js";
import { FilterMinMax, constantFilterTypes } from "./Constants.js";

class FilterControls {
    constructor(filterData, changeFrequencyCallback, changeQCallback, changeGainCallback, changeTypeCallback, OnRemoveFilter) {
        this.container = document.createElement("div");
        this.container.classList.add("filter-controls");
        this.container.classList.add("row");
        this.filterData = filterData;

        this.frequencyDial = new Dial(FilterMinMax.frequency.min, FilterMinMax.frequency.max, this.filterData.Frequency, true, changeFrequencyCallback, this.filterData, 0, "Freq", "Hz");
        this.qDial = new Dial(FilterMinMax.Q.min, FilterMinMax.Q.max, this.filterData.Q, false, changeQCallback, this.filterData, 2, "Q", "");
        this.gainDial = new Dial(FilterMinMax.gain.min, FilterMinMax.gain.max, this.filterData.Gain, false, changeGainCallback, this.filterData, 0, "Gain", "dB");

        const typeSelector = document.createElement("select");
        typeSelector.classList.add("filter-type-selector");
        constantFilterTypes.forEach(type => {
            const option = document.createElement("option");
            option.value = type;
            option.textContent = type;
            if (this.filterData.type === type) {
                option.selected = true;
            }
            typeSelector.appendChild(option);
        });

        typeSelector.addEventListener("change", (event) => {
            this.filterData.type = event.target.value;
            changeTypeCallback(event.target.value, this.filterData);
            this.updateDialVisibilty();
        });

        const removeButton = document.createElement("button");
        removeButton.classList.add("filter-button");
        removeButton.classList.add("my-button");
        removeButton.textContent = "Remove";
        removeButton.addEventListener("click", (event) => {
            this.container.remove();
            OnRemoveFilter(this.filterData);
        });

        this.updateDialVisibilty();

        this.container.appendChild(this.frequencyDial.getContainer());
        this.container.appendChild(this.qDial.getContainer());
        this.container.appendChild(this.gainDial.getContainer());
        this.container.appendChild(typeSelector);
        this.container.appendChild(removeButton);
    }

    updateDialVisibilty(){
        switch (this.filterData.FilterType) {
            case "lowpass":
            case "highpass":
                this.frequencyDial.isVisible(true);
                this.qDial.isVisible(false);
                this.gainDial.isVisible(false);
                break;

            case "bandpass":
            case "notch":
                this.frequencyDial.isVisible(true);
                this.qDial.isVisible(true);
                this.gainDial.isVisible(true);
                break;
                
            case "lowshelf":
            case "highshelf":
                this.frequencyDial.isVisible(true);
                this.qDial.isVisible(false);
                this.gainDial.isVisible(true);
                break;

            case "peaking":
            default:
                this.frequencyDial.isVisible(true);
                this.qDial.isVisible(true);
                this.gainDial.isVisible(true);
                break;
        }
    }

    getContainer() {
        return this.container;
    }
}

export default FilterControls;