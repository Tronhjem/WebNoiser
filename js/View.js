import {FilterMinMax, dialMin, dialMax} from './Constants.js'

class View {
    constructor() {
        this.volumeSlider = document.getElementById('volume-slider');
        this.butterworthSlider = document.getElementById('filter-slider-butterworth');
        this.onePoleSlider = document.getElementById('filter-slider-onepole');
        this.playButton = document.getElementById('play-button');
        this.addFilterButton = document.getElementById('add-filter-button');
        this.saveButton = document.getElementById('save-button');
        this.loadButton = document.getElementById('load-button');
        this.clearLocalStorageButton = document.getElementById('clear-local-storage');
        this.filterControlsContainer = document.getElementById('filter-controls-container');
    }

    bindPlayButton(handler) {
        this.playButton.addEventListener('click', async event => {
            await handler(event.target.value);
        });
    }

    bindAddFilterButton(handler) {
        this.addFilterButton.addEventListener('click', event => {
            handler(event.target.value);
        });
    }

    bindSaveButton(handler) {
        this.saveButton.addEventListener('click', event => {
            handler(event.target.value);
        });
    }

    bindLoadButton(handler) {
        this.loadButton.addEventListener('click', event => {
            handler(event.target.value);
        });
    }

    bindClearLocalStorageButton(handler) {
        this.clearLocalStorageButton.addEventListener('click', event => {
            handler(event.target.value);
        });
    }

    bindVolumeSliderChange(handler) {
        this.volumeSlider.addEventListener('input', event => {
            handler(event.target.value);
        });
    }

    bindButterworthSliderChange(handler) {
        this.butterworthSlider.addEventListener('input', event => {
            handler(event.target.value);
        });
    }

    bindOnePoleSliderChange(handler) {
        this.onePoleSlider.addEventListener('input', event => {
            handler(event.target.value);
        });
    }

    clearFilterControls() {
        while (this.filterControlsContainer.firstChild) {
            this.filterControlsContainer.removeChild(filterControlsContainer.firstChild);
        }
    }

    updateAllSliders(globalValueTree, addFilterCallback) {
        this.butterworthSlider.value = globalValueTree.biquadFilter.frequency;
        this.onePoleSlider.value = globalValueTree.onePoleLowpass.frequency;
        this.volumeSlider.value = globalValueTree.volume;

        this.butterworthSlider.dispatchEvent(new Event('input'));
        this.onePoleSlider.dispatchEvent(new Event('input'));
        this.volumeSlider.dispatchEvent(new Event('input'));
    }

    createDial(min, max, initValue, isLog, changeCallback, filter) {
        const container = document.createElement('div');
        container.classList.add('dial-container');

        const dial = document.createElement('div');
        dial.classList.add('dial');

        const indicator = document.createElement('div');
        indicator.classList.add('dial-indicator');
        dial.appendChild(indicator);

        let isDragging = false;
        let startY = 0;
        
        let value = 0;
        if(isLog){
            value = (dialMax * Math.log(initValue / min)) / Math.log(max / min);
        }
        else{
            value = ( initValue - min) / (max - min) * dialMax;
        }

        const updateDial = () => {
            const angle = (value / dialMax ) * 270 - 135;
            indicator.style.transform = `translate(-50%, -100%) rotate(${angle}deg)`;
            changeCallback(value, filter)
        };

        dial.addEventListener('mousedown', (event) => {
            isDragging = true;
            startY = event.clientY;
            event.preventDefault();
        });

        document.addEventListener('mousemove', (event) => {
            if (isDragging) {
                const deltaY = startY - event.clientY;
                value += deltaY * 1;
                value = Math.max(dialMin, Math.min(dialMax, value));
                startY = event.clientY;
                updateDial();
            }
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });

        updateDial();
        container.appendChild(dial);
        return container;
    }

    createFilterControls(filter, changeFrequencyCallback, changeQCallback, changeGainCallback, OnRemoveFilter) {
        const container = document.createElement('div');
        container.classList.add('filter-controls');

        const frequencyDial = this.createDial(FilterMinMax.frequency.min, FilterMinMax.frequency.max, filter.frequency.value, true, changeFrequencyCallback, filter);
        const qDial = this.createDial(FilterMinMax.Q.min, FilterMinMax.Q.max, filter.Q.value, false, changeQCallback, filter);
        const gainDial = this.createDial(FilterMinMax.gain.min, FilterMinMax.gain.max, filter.gain.value, false, changeGainCallback, filter);

        const typeSelector = document.createElement('select');
        ['lowpass', 'highpass', 'bandpass', 'lowshelf', 'highshelf', 'peaking', 'notch', 'allpass'].forEach(type => {
            const option = document.createElement('option');
            option.value = type;
            option.textContent = type;
            if (filter.type === type) {
                option.selected = true;
            }
            typeSelector.appendChild(option);
        });

        typeSelector.addEventListener('change', (event) => {
            filter.type = event.target.value;
        });

        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remove';
        removeButton.addEventListener('click', (event) => {
            container.remove();
            OnRemoveFilter(filter);
        });

        container.appendChild(frequencyDial);
        container.appendChild(qDial);
        container.appendChild(gainDial);
        container.appendChild(typeSelector);
        container.appendChild(removeButton);

        this.filterControlsContainer.appendChild(container);
        return container;
    }
}

export default View;