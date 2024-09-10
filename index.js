let audioContext;
let gainNode;
let filterNode;

const minFrequency = 20;
const maxFrequency = 18000;

function getLogFrequency(value) 
{
    return minFrequency * Math.pow(maxFrequency / minFrequency, value);
}

async function StartAudio()
{
    // if (audioContext) 
    // {
    //     return;
    // }

    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    gainNode = audioContext.createGain();

    filterNode = audioContext.createBiquadFilter();
    filterNode.type = 'lowpass';
    filterNode.frequency.value = getLogFrequency(0.5); 

    const bufferSize = 2 * audioContext.sampleRate;
    const channels = 2;
    const noiseBuffer = audioContext.createBuffer(channels, bufferSize, audioContext.sampleRate);

    for (let channel = 0; channel < channels; channel++) 
    {
        const output = noiseBuffer.getChannelData(channel);

        for (let i = 0; i < bufferSize; i++) 
        {
            output[i] = (Math.random() * 2 - 1) * 0.2;
        }
    }

    const noiseSource = audioContext.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    // ===== worklet stuff ==== 
    // await audioContext.audioWorklet.addModule('NoiseGenerator.js');
    // // Create an instance of the AudioWorkletNode
    // noiseSource = new AudioWorkletNode(audioContext, 'NoiseGenerator');
    // ===== worklet stuff ==== 

    noiseSource.connect(filterNode);
    filterNode.connect(gainNode);
    gainNode.connect(audioContext.destination);

    noiseSource.start();
}

document.getElementById('play-button').addEventListener('click', StartAudio);

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