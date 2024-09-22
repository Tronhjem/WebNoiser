let audioContext; 
let gainNode;
let analyser;
let bufferLength;
let dataArray; 
// let filters = [];

let biquadFilter;
let onePoleLowpass;

let globalFilterIdCounter = 0;
const canvas = document.getElementById('frequency-canvas');
const canvasCtx = canvas ? canvas.getContext('2d') : null;

let globalValueTree = {
    biquadFilter: {
        frequency: 1,
    },
    onePoleLowpass: {
        frequency: 1
    },
    volume: 0.5,
    filters: []
};

function saveValues() {
    const json = JSON.stringify(globalValueTree);
    localStorage.setItem('globalvalues', JSON.stringify(globalValueTree));
    console.log(json);
}

function loadValues() {
    globalValueTree = JSON.parse(localStorage.getItem('globalvalues'));

    const butterworthSlider = document.getElementById('filter-slider-butterworth');
    const onePoleSlider = document.getElementById('filter-slider-onepole');
    const volumeSlider = document.getElementById('volume-slider');

    butterworthSlider.value = globalValueTree.biquadFilter.frequency;
    onePoleSlider.value = globalValueTree.onePoleLowpass.frequency;
    volumeSlider.value = globalValueTree.volume;

    // Dispatch input events to trigger event listeners
    butterworthSlider.dispatchEvent(new Event('input'));
    onePoleSlider.dispatchEvent(new Event('input'));
    volumeSlider.dispatchEvent(new Event('input'));
}

function onPageLoad() {
    localStorage.clear();
    // loadValues();
}

window.addEventListener('load', onPageLoad);

document.getElementById('play-button').addEventListener('click', async () => 
{
    if (!audioContext) 
    {
        await StartAudio();
    }
    audioContext.resume();
});

document.getElementById('add-filter-button').addEventListener('click', addFilter);
document.getElementById('save-button').addEventListener('click', saveValues);
document.getElementById('load-button').addEventListener('click', loadValues);

document.getElementById('filter-slider-butterworth').addEventListener('input', (event) => setButterWorthValues(event.target.value));
document.getElementById('filter-slider-onepole').addEventListener('input', (event) => setOnePoleValues(event.target.value));
document.getElementById('volume-slider').addEventListener('input', (event) => setVolume(event.target.value));

function setVolume(value)
{
    if (gainNode){
        gainNode.gain = this.value;
        globalValueTree.volume = value;
        console.log(globalValueTree.volume);
    }
}

function setButterWorthValues(value)
{
    if(biquadFilter){
        const frequency = getLogFrequency(value);
        biquadFilter.parameters.get("freqency").setValueAtTime(frequency, audioContext.currentTime)
        globalValueTree.biquadFilter.frequency = value;
        console.log(globalValueTree.biquadFilter.frequency);
    }
}

function setOnePoleValues(value)
{
    if(onePoleLowpass){
        const frequency = getLogFrequency(value);
        onePoleLowpass.parameters.get("freqency").setValueAtTime(frequency, audioContext.currentTime)
        globalValueTree.onePoleLowpass.frequency = value;
        console.log(globalValueTree.onePoleLowpass.frequency);
    }
}

function drawSpectrum() {
    if (!canvasCtx){
        return;
    }
    requestAnimationFrame(drawSpectrum);

    analyser.getByteFrequencyData(dataArray);

    canvasCtx.fillStyle = 'black';
    canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

    const barWidth = (canvas.width / bufferLength) * 2.5;
    let barHeight;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i];

        canvasCtx.fillStyle = 'rgb(' + (barHeight + 100) + ',50,50)';
        canvasCtx.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight / 2);

        x += barWidth + 1;
    }
}

function getLogFrequency(value) 
{
    const minFrequency = 20;
    const maxFrequency = 20000;
    return minFrequency * Math.pow(maxFrequency / minFrequency, value);
}

async function StartAudio()
{
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    gainNode = audioContext.createGain();
    analyser = audioContext.createAnalyser();

    // ================================================================
    // Node Setup
    // ================================================================

    await audioContext.audioWorklet.addModule('PinkNoise.js');
    pinkNoise = new AudioWorkletNode(audioContext, 'PinkNoise');

    await audioContext.audioWorklet.addModule('BiquadFilter.js');
    biquadFilter = new AudioWorkletNode(audioContext, 'MyFilter');
    
    await audioContext.audioWorklet.addModule('OnePoleLowpass.js');
    onePoleLowpass = new AudioWorkletNode(audioContext, 'OnePoleLowpass');

    analyser.fftSize = 2048;
    bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);

    // ================================================================
    // Connections
    // ================================================================

    // noiseSource.connect(biquadFilter);
    // filterNode.connect(gainNode);

    pinkNoise.connect(biquadFilter);
    biquadFilter.connect(onePoleLowpass);
    onePoleLowpass.connect(analyser);
    analyser.connect(gainNode);
    gainNode.connect(audioContext.destination);
    // ================================================================

    drawSpectrum();
}

function createDial(filter, property, min, max, initialValue, isLog = false) {
    const dialMax = 100.0;
    const dialMin = 0.0;
    const container = document.createElement('div');
    container.classList.add('dial-container');

    const dial = document.createElement('div');
    dial.classList.add('dial');

    const indicator = document.createElement('div');
    indicator.classList.add('dial-indicator');
    dial.appendChild(indicator);

    let value = ( initialValue - min) / (max - min) * dialMax;
    let isDragging = false;
    let startY = 0;
  
    function updateDial() {
        const angle = (value / dialMax ) * 270 - 135;
        indicator.style.transform = `translate(-50%, -100%) rotate(${angle}deg)`;

        if (isLog){
            let logValue = min * Math.pow(max / min, value / dialMax); 
            console.log(logValue);
            filter[property].setValueAtTime(logValue, audioContext.currentTime);
        }
        else{
            const setValue = (value / dialMax) * (max - min) + min; 
            filter[property].setValueAtTime(setValue, audioContext.currentTime);
        }
    }

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

function createFilterControls(filter) {
    const container = document.createElement('div');
    container.classList.add('filter-controls');

    const frequencyDial = createDial(filter, 'frequency', 20.0, 20000.0, filter.frequency.value, true);
    const qDial = createDial(filter, 'Q', 0.1, 10, filter.Q.value, false);
    const gainDial = createDial(filter, 'gain', -25, 25, filter.gain.value, false);

    const typeSelector = document.createElement('select');
    ['lowpass', 'highpass', 'bandpass', 'lowshelf', 'highshelf', 'peaking', 'notch', 'allpass'].forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = type;
        typeSelector.appendChild(option);
    });
    typeSelector.value = filter.type;
    typeSelector.addEventListener('change', () => {
        filter.type = typeSelector.value;
    });

    const removeButton = document.createElement('button');
    removeButton.textContent = 'Remove';
    removeButton.addEventListener('click', () => {
        const index = globalValueTree.filters.indexOf(filter);
        globalValueTree.filters.splice(index, 1);
        container.remove();
        updateAudioGraph();
    });

    container.appendChild(document.createElement('br'));
    
    container.appendChild(frequencyDial);
    container.appendChild(qDial);
    container.appendChild(gainDial);
    container.appendChild(typeSelector);
    container.appendChild(removeButton);
    container.appendChild(document.createElement('br'));

    container.appendChild(document.createTextNode(' Frequency'));
    container.appendChild(document.createTextNode(' Q'));
    container.appendChild(document.createTextNode(' Gain'));

    document.getElementById('filter-controls-container').appendChild(container);
}

function addFilter() {
    const filter = audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.Q.value = 1.0;
    filter.frequency.value = 18000.0;
    filter.gain.value = 0.0;    
    globalFilterIdCounter++;
    globalValueTree.filters.push(filter);
    updateAudioGraph();
    createFilterControls(filter);
}

function updateAudioGraph() {
    pinkNoise.disconnect();
    onePoleLowpass.disconnect();
    biquadFilter.disconnect();
    analyser.disconnect();
    gainNode.disconnect();

    globalValueTree.filters.forEach(filter => {
        filter.disconnect();
    });

    let previousNode = pinkNoise;
    globalValueTree.filters.forEach(filter => {
        previousNode.connect(filter);
        previousNode = filter;
    });

    previousNode.connect(biquadFilter)
    biquadFilter.connect(onePoleLowpass);
    onePoleLowpass.connect(analyser);
    analyser.connect(gainNode); 
    gainNode.connect(audioContext.destination);
}
