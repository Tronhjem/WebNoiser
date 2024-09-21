let audioContext  
let gainNode;
let analyser;
let bufferLength;
let dataArray; 
let filters = [];
let globalFilterIdCounter = 0;
const canvas = document.getElementById('frequency-canvas');
const canvasCtx = canvas ? canvas.getContext('2d') : null;

// Draw the frequency spectrum
function draw() {
    if (!canvasCtx){
        return;
    }
    requestAnimationFrame(draw);

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

    draw();
}

function fromRealValueToDialValue(value, min, max, dialMax)
{
    return (( value - min) / (max - min)) * dialMax;
}

function fromDialValueToRealValue(value, min, max, dialMax)
{
    return (value / dialMax) * (max - min) + min;
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

function createFilterControls(filter, index) {
    const container = document.createElement('div');
    container.classList.add('filter-controls');

    const frequencyDial = createDial(filter, 'frequency', 20.0, 20000.0, 1000.0, true);
    const qDial = createDial(filter, 'Q', 0.1, 10, 0);
    const gainDial = createDial(filter, 'gain', -25, 25, 0);

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
        const index = filters.indexOf(filter);
        filters.splice(index, 1);
        container.remove();
        updateAudioGraph();
    });

    container.appendChild(document.createTextNode(`Filter ${index + 1}`));
    container.appendChild(document.createElement('br'));
    container.appendChild(frequencyDial);
    container.appendChild(document.createTextNode(' Frequency'));
    // container.appendChild(document.createElement('br'));

    container.appendChild(qDial);
    container.appendChild(document.createTextNode(' Q'));
    // container.appendChild(document.createElement('br'));

    container.appendChild(gainDial);
    container.appendChild(document.createTextNode(' Gain'));
    container.appendChild(document.createElement('br'));

    container.appendChild(typeSelector);
    // container.appendChild(document.createElement('br'));

    container.appendChild(removeButton);
    container.appendChild(document.createElement('br'));

    document.getElementById('filter-controls-container').appendChild(container);
}

function addFilter() {
    const filter = audioContext.createBiquadFilter();
    globalFilterIdCounter++;
    filters.push(filter);
    updateAudioGraph();
    createFilterControls(filter, globalFilterIdCounter);
}

function updateAudioGraph() {
    pinkNoise.disconnect();
    onePoleLowpass.disconnect();
    biquadFilter.disconnect();
    analyser.disconnect();
    gainNode.disconnect();

    filters.forEach(filter => {
        filter.disconnect();
    });

    let previousNode = pinkNoise;
    filters.forEach(filter => {
        previousNode.connect(filter);
        previousNode = filter;
    });

    previousNode.connect(biquadFilter)
    biquadFilter.connect(onePoleLowpass);
    onePoleLowpass.connect(analyser);
    analyser.connect(gainNode); 
    gainNode.connect(audioContext.destination);
}

document.getElementById('play-button').addEventListener('click', async () => 
{
    if (!audioContext) 
    {
        await StartAudio();
    }
    audioContext.resume();
});

document.getElementById('add-filter-button').addEventListener('click', addFilter);

document.getElementById('volume-slider').addEventListener('input', function() 
{
    if (gainNode) 
    {
        gainNode.gain.value = this.value;
    }
});

document.getElementById('filter-slider-butterworth').addEventListener('input', function() 
{
    const frequency = getLogFrequency(this.value);
    biquadFilter.parameters.get("freqency").setValueAtTime(frequency, audioContext.currentTime)
});

document.getElementById('filter-slider-onepole').addEventListener('input', function() 
{
    const frequency = getLogFrequency(this.value);
    onePoleLowpass.parameters.get("freqency").setValueAtTime(frequency, audioContext.currentTime)
});