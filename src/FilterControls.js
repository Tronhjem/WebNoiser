import Dial from "./Dial.js";
import { FilterMinMax, constantFilterTypes } from "./Constants.js";

class FilterControls {
    constructor(filterData, changeFrequencyCallback, changeQCallback, changeGainCallback, changeTypeCallback, OnRemoveFilter) {
        this.container = document.createElement("div");
        this.container.classList.add("filter-controls");
        this.container.classList.add("row");

        const frequencyDial = new Dial(FilterMinMax.frequency.min, FilterMinMax.frequency.max, filterData.Frequency, true, changeFrequencyCallback, filterData, 0, "Freq", "Hz");
        const qDial = new Dial(FilterMinMax.Q.min, FilterMinMax.Q.max, filterData.Q, false, changeQCallback, filterData, 2, "Q", "");
        const gainDial = new Dial(FilterMinMax.gain.min, FilterMinMax.gain.max, filterData.Gain, false, changeGainCallback, filterData, 0, "Gain", "dB");

        const typeSelector = document.createElement("select");
        typeSelector.classList.add("filter-type-selector");
        constantFilterTypes.forEach(type => {
            const option = document.createElement("option");
            option.value = type;
            option.textContent = type;
            if (filterData.type === type) {
                option.selected = true;
            }
            typeSelector.appendChild(option);
        });

        typeSelector.addEventListener("change", (event) => {
            filterData.type = event.target.value;
            changeTypeCallback(event.target.value, filterData);
        });

        const removeButton = document.createElement("button");
        removeButton.classList.add("filter-button");
        removeButton.classList.add("my-button");
        removeButton.textContent = "Remove";
        removeButton.addEventListener("click", (event) => {
            this.container.remove();
            OnRemoveFilter(filterData);
        });

        this.container.appendChild(frequencyDial.getContainer());
        this.container.appendChild(qDial.getContainer());
        this.container.appendChild(gainDial.getContainer());
        this.container.appendChild(typeSelector);
        this.container.appendChild(removeButton);
    }

    getContainer() {
        return this.container;
    }
}

export default FilterControls;