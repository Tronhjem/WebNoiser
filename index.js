let audioContext;
let gainNode;
let filterNode;
// let biquadFilter;
// let noiseSource;

const minFrequency = 20;
const maxFrequency = 18000;

function getLogFrequency(value) 
{
    return minFrequency * Math.pow(maxFrequency / minFrequency, value);
}

async function StartAudio()
{
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    gainNode = audioContext.createGain();

    filterNode = audioContext.createBiquadFilter();
    filterNode.type = 'lowpass';
    filterNode.frequency.value = getLogFrequency(0.5); 

    await audioContext.audioWorklet.addModule('NoiseGenerator.js');
    noiseSource = new AudioWorkletNode(audioContext, 'NoiseGenerator');

    await audioContext.audioWorklet.addModule('BiquadFilter.js');
    biquadFilter = new AudioWorkletNode(audioContext, 'MyFilter');

    noiseSource.connect(biquadFilter);
    biquadFilter.connect(filterNode);
    filterNode.connect(gainNode);
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

document.getElementById('volume-slider').addEventListener('input', function() 
{
    if (gainNode) 
    {
        gainNode.gain.value = this.value;
    }
});


document.getElementById('filter-slider').addEventListener('input', function() 
{
    const frequency = getLogFrequency(this.value);
    filterNode.frequency.value = frequency;
});