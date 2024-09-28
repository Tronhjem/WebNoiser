// let analyser;
// let bufferLength;
// let dataArray; 
// let filters = [];

const canvas = document.getElementById('frequency-canvas');
const canvasCtx = canvas ? canvas.getContext('2d') : null;

function onPageLoad() {
    // loadValues();
}

window.addEventListener('load', onPageLoad);

import Controller from './AppController.js';
const AppController = new Controller();

// function addFilter(filterType = 'lowpass', frequency = 18000.0, Q = 1.0, gain = 0.0) {
//     const filter = audioContext.createBiquadFilter();
//     filter.type.value = filterType;
//     filter.frequency.value = frequency;
//     filter.Q.value = Q;
//     filter.gain.value = gain;    
    
//     filters.push(filter);
    
//     updateAudioGraph();
//     createFilterControls(filter);
// }

// function addFilterNoAudioUpdate(type = 'lowpass', frequency = 18000.0, Q = 1.0, gain = 0.0) {
//     const filter = audioContext.createBiquadFilter();
//     filter.type = type;
//     filter.frequency.value = frequency;
//     filter.Q.value = Q;
//     filter.gain.value = gain;    

//     filters.push(filter);
//     createFilterControls(filter);
// }
