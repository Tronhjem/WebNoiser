import {FilterMinMax, dialMin, dialMax, MyBiquadFilterTypes} from "./Constants.js"

class NoiseSynth{
    constructor(){
        this.audioContext = null;
        this.gainNode = null;
        this.pinkNoise = null;
        this.biquadLowPassFilter = null;
        this.biquadHighPassFilter = null;
        this.onePoleLowpass = null;
        this.analyser = null;
        this.gainNode = null;
        this.dataArray = null;
        this.bufferLength = 0;
        this.filters = {};
        this.isInitialized = false;
    }

    async initialize(filterList){
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.gainNode = this.audioContext.createGain();

        await this.audioContext.audioWorklet.addModule("src/AudioWorkletProcessors/PinkNoise.js");
        this.pinkNoise = new AudioWorkletNode(this.audioContext, "PinkNoise");

        await this.audioContext.audioWorklet.addModule("src/AudioWorkletProcessors/BiquadFilter.js");
        this.biquadLowPassFilter = new AudioWorkletNode(this.audioContext, "MyBiquadFilter");

        await this.audioContext.audioWorklet.addModule("src/AudioWorkletProcessors/BiquadFilter.js");
        this.biquadHighPassFilter = new AudioWorkletNode(this.audioContext, "MyBiquadFilter");

        await this.audioContext.audioWorklet.addModule("src/AudioWorkletProcessors/OnePoleLowpass.js");
        this.onePoleLowpass = new AudioWorkletNode(this.audioContext, "OnePoleLowpass");

        // this.analyser.fftSize = 2048;
        // this.bufferLength = analyser.frequencyBinCount;
        // this.dataArray = new Uint8Array(bufferLength);

        this.biquadHighPassFilter.parameters.get("filterType").setValueAtTime(MyBiquadFilterTypes.HIGHPASS, this.audioContext.currentTime);

        Object.keys(filterList).forEach(key => {
            const filter = filterList[key];
            this.addFilterOffline(filter);
        });

        this.isInitialized = true;
        this.connectAll();
    }
    
    clear(){
        if (!this.isInitialized) {
            return;
        }
        this.disconnectAll();
        this.filters = {};
    }

    getLogFrequency(value) {
        const minFrequency = 20;
        const maxFrequency = 20000;
        return minFrequency * Math.pow(maxFrequency / minFrequency, value);
    }

    setVolume(value){
        if (!this.isInitialized) {
            return;
        }
        this.gainNode.gain.value = value;
    }

    setOnePoleFrequency(value){
        if (!this.isInitialized) {
            return;
        }
        this.onePoleLowpass.parameters.get("freqency").setValueAtTime(value, this.audioContext.currentTime);
    }

    setBiqadLowpassFilterFrequency(value){
        if (!this.isInitialized) {
            return;
        }
        this.biquadLowPassFilter.parameters.get("freqency").setValueAtTime(value, this.audioContext.currentTime);
    }

    setBiqadHighpassFilterFrequency(value){
        if (!this.isInitialized) {
            return;
        }
        this.biquadHighPassFilter.parameters.get("freqency").setValueAtTime(value, this.audioContext.currentTime);
    }
    
    addFilterRuntime(filterData)
    {
        if (!this.isInitialized) {
            return;
        }

        const filter = this.createFilter(filterData);

        this.disconnectAll();
        this.filters[filterData.id] = filter;
        this.connectAll();

        return filter;
    }

    addFilterOffline(filterData){
        if (!this.audioContext){
            return;
        }
        const filter = this.createFilter(filterData);
        this.filters[filterData.id] = filter;
    }

    createFilter(filterData){
        const filter = this.audioContext.createBiquadFilter();
        filter.type = filterData.FilterType;
        filter.frequency.value = filterData.Frequency;
        filter.Q.value = filterData.Q;
        filter.gain.value = filterData.Gain;    
        
        return filter;
    }

    removeFilter(filter){
        if (!this.isInitialized) {
            return;
        }
        delete this.filters[filter.id];
        this.updateAudioGraph();
    }

    updateFilter(value, filterData, property, isLogarithmic){
        if (!this.isInitialized) {
            return;
        }

        if (property != "filterType") {
            this.filters[filterData.id][property].setValueAtTime(value, this.audioContext.currentTime);
        }
        else{
            this.filters[filterData.id].type = value;
        }
    }

    connectAll() {
        if (!this.isInitialized) {
            return;
        }

        let previousNode = this.pinkNoise;

        Object.keys(this.filters).forEach(key => {
            const filter = this.filters[key];
            previousNode.connect(filter);
            previousNode = filter;
        });

        previousNode.connect(this.onePoleLowpass);
        this.onePoleLowpass.connect(this.biquadHighPassFilter);
        this.biquadHighPassFilter.connect(this.biquadLowPassFilter);
        this.biquadLowPassFilter.connect(this.gainNode);
        this.gainNode.connect(this.audioContext.destination);
    }

    disconnectAll() {
        if (!this.isInitialized) {
            return;
        }

        this.pinkNoise.disconnect();
        this.onePoleLowpass.disconnect();
        this.biquadLowPassFilter.disconnect();
        this.biquadHighPassFilter.disconnect();
        this.gainNode.disconnect();

        Object.keys(this.filters).forEach(key => {
            const filter = this.filters[key];
            filter.disconnect();
        });
    }

    updateAudioGraph() {
        if (!this.isInitialized) {
            return;
        }
        this.disconnectAll();
        this.connectAll();
    }

    drawSpectrum() {
        if (!this.isInitialized) {
            return;
        }
        if (!canvasCtx){
            return;
        }
        requestAnimationFrame(drawSpectrum);

        analyser.getByteFrequencyData(dataArray);

        canvasCtx.fillStyle = "black";
        canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

        const barWidth = (canvas.width / bufferLength) * 2.5;
        let barHeight;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
            barHeight = dataArray[i];

            canvasCtx.fillStyle = "rgb(" + (barHeight + 100) + ",50,50)";
            canvasCtx.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight / 2);

            x += barWidth + 1;
        }
    }
}

export default NoiseSynth;