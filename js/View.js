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

    updateAllSliders(globalValueTree){
        this.butterworthSlider.value = globalValueTree.biquadFilter.frequency;
        this.onePoleSlider.value = globalValueTree.onePoleLowpass.frequency;
        this.volumeSlider.value = globalValueTree.volume;

        this.butterworthSlider.dispatchEvent(new Event('input'));
        this.onePoleSlider.dispatchEvent(new Event('input'));
        this.volumeSlider.dispatchEvent(new Event('input'));
    }

    createDial(min, max, value) {
        const container = document.createElement('div');
        container.classList.add('dial-container');

        const dial = document.createElement('div');
        dial.classList.add('dial');

        let isDragging = false;
        let startY = 0;
        const dialMin = 0;
        const dialMax = 100;

        const updateDial = () => {
            const dialValue = ((value - min) / (max - min)) * (dialMax - dialMin) + dialMin;
            dial.style.transform = `rotate(${dialValue * 3.6}deg)`;
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

    createFilterControls(filter) {
        const container = document.createElement('div');
        container.classList.add('filter-controls');

        const frequencyDial = this.createDial(20.0, 20000.0, filter.frequency.value);
        const qDial = this.createDial(0.1, 10, filter.Q.value);
        const gainDial = this.createDial(-25, 25, filter.gain.value);

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

        container.appendChild(frequencyDial);
        container.appendChild(qDial);
        container.appendChild(gainDial);
        container.appendChild(typeSelector);

        this.filterControlsContainer.appendChild(container);
        return container;
    }
}

export default View;