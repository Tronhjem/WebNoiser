import Dial from "./Dial.js";
import { FilterMinMax, constantFilterTypes } from "./Constants.js";

class FilterControls {
    constructor(filterData, changeFrequencyCallback, changeQCallback, changeGainCallback, changeTypeCallback, OnRemoveFilter) {
        this.container = document.createElement("div");
        this.container.classList.add("filter-controls");
        this.container.classList.add("row");
        this.filterData = filterData;

        this.frequencyDial = new Dial(FilterMinMax.frequency.min, FilterMinMax.frequency.max, this.filterData.F, true, changeFrequencyCallback, this.filterData, 0, "Freq", "Hz");
        this.qDial = new Dial(FilterMinMax.Q.min, FilterMinMax.Q.max, this.filterData.Q, false, changeQCallback, this.filterData, 2, "Q", "");
        this.gainDial = new Dial(FilterMinMax.gain.min, FilterMinMax.gain.max, this.filterData.G, false, changeGainCallback, this.filterData, 0, "Gain", "dB");

        const typeSelector = document.createElement("select");
        typeSelector.classList.add("filter-type-selector");
        constantFilterTypes.forEach(type => {
            const option = document.createElement("option");
            option.value = type;
            option.textContent = type;
            if (this.filterData.T === type) {
                option.selected = true;
            }
            typeSelector.appendChild(option);
        });

        typeSelector.addEventListener("change", (event) => {
            this.filterData.T = event.target.value;
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
        switch (this.filterData.T) {
            case "lowpass":
            case "highpass":
                this.frequencyDial.setActive(true);
                this.qDial.setActive(false);
                this.gainDial.setActive(false);
                break;

            case "bandpass":
            case "notch":
                this.frequencyDial.setActive(true);
                this.qDial.setActive(true);
                this.gainDial.setActive(false);
                break;
                
            case "lowshelf":
            case "highshelf":
                this.frequencyDial.setActive(true);
                this.qDial.setActive(false);
                this.gainDial.setActive(true);
                break;

            case "peaking":
            default:
                this.frequencyDial.setActive(true);
                this.qDial.setActive(true);
                this.gainDial.setActive(true);
                break;
        }
    }

    getContainer() {
        return this.container;
    }
}

export default FilterControls;