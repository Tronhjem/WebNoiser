let audioContext  
let gainNode;
let analyser;
let bufferLength;
let dataArray; 
let filters = [];
// const canvas = document.getElementById('frequency-canvas');
// const canvasCtx = canvas.getContext('2d');

// Draw the frequency spectrum
function draw() {
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

    // filterNode = audioContext.createBiquadFilter();
    // filterNode.type = 'lowpass';
    // filterNode.frequency.value = getLogFrequency(0.5); 

    // await audioContext.audioWorklet.addModule('NoiseGenerator.js');
    // noiseSource = new AudioWorkletNode(audioContext, 'NoiseGenerator');

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
    onePoleLowpass.connect(gainNode);
    gainNode.connect(audioContext.destination);
    // ================================================================

    // draw();
}

function createFilterControls(filter, index) {
    const container = document.createElement('div');
    container.classList.add('filter-controls');

    const frequencySlider = document.createElement('input');
    frequencySlider.type = 'range';
    frequencySlider.min = '20';
    frequencySlider.max = '20000';
    frequencySlider.step = '1';
    frequencySlider.value = filter.frequency.value;
    frequencySlider.addEventListener('input', () => {
        filter.frequency.setValueAtTime(frequencySlider.value, audioContext.currentTime);
    });

    const qSlider = document.createElement('input');
    qSlider.type = 'range';
    qSlider.min = '0.1';
    qSlider.max = '100';
    qSlider.step = '0.1';
    qSlider.value = filter.Q.value;
    qSlider.addEventListener('input', () => {
        filter.Q.setValueAtTime(qSlider.value, audioContext.currentTime);
    });

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

    container.appendChild(document.createTextNode(`Filter ${index + 1}`));
    container.appendChild(document.createElement('br'));
    container.appendChild(frequencySlider);
    container.appendChild(document.createTextNode(' Frequency'));
    container.appendChild(document.createElement('br'));
    container.appendChild(qSlider);
    container.appendChild(document.createTextNode(' Q'));
    container.appendChild(document.createElement('br'));
    container.appendChild(typeSelector);
    container.appendChild(document.createElement('br'));

    document.getElementById('filter-controls-container').appendChild(container);
}

function addFilter() {
    const filter = audioContext.createBiquadFilter();
    filters.push(filter);
    updateAudioGraph();
    createFilterControls(filter, filters.length - 1);
}

function removeFilter() {
    if (filters.length > 0) {
        filters.pop();
        updateAudioGraph();
        const container = document.getElementById('filter-controls-container');
        container.removeChild(container.lastChild);
    }
}

function updateAudioGraph() {
    pinkNoise.disconnect();
    onePoleLowpass.disconnect();
    biquadFilter.disconnect();
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
    onePoleLowpass.connect(gainNode);
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
document.getElementById('remove-filter-button').addEventListener('click', removeFilter);

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