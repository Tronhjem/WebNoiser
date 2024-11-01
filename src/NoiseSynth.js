import {MyBiquadFilterTypes, lowShelfFreq, midFreq, highShelfFreq} from "./Constants.js"

class NoiseSynth{
    constructor(){
        this.audioContext = null;
        this.gainNode = null;
        this.pinkNoise = null;
        this.biquadLowPassFilter = null;
        this.biquadHighPassFilter = null;
        this.onePoleLowpass = null;
        this.low = null;
        this.mid = null;
        this.high = null;
        this.speechFilters = [];
        this.analyser = null;
        this.bufferLength = 0;
        this.filters = {};
        this.isInitialized = false;

        this.dataArray = null;
        this.isPlaying = false;
    }

    setPlayState(play){
        if(play){
            this.audioContext.resume();
            this.isPlaying = true;
        }
        else{
            this.audioContext.suspend();
            this.isPlaying = false;
        }
    }

    async initialize(data){
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

        this.low = this.createFilter({T: 'lowshelf', F: lowShelfFreq, Q: 1, G: data.lo});
        this.mid = this.createFilter({T: 'peaking', F: midFreq, Q: 0.5, G: data.md});
        this.high = this.createFilter({T: 'highshelf', F: highShelfFreq, Q: 1, G: data.hi});

        // Speech Filters
        this.speechFilters.push(this.createFilter({T: 'peaking', F: 300, Q: 1.0, G: 0}));
        this.speechFilters.push(this.createFilter({T: 'peaking', F: 800, Q: 1.0, G: 0}));
        this.speechFilters.push(this.createFilter({T: 'peaking', F: 2000, Q: 1.0, G: 0}));

        Object.keys(data.fd).forEach(key => {
            const filter = data.fd[key];
            this.addFilterOffline(filter);
        });

        this.isInitialized = true;
        this.connectAll();
        this.isPlaying = true;
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
        filter.type = filterData.T;
        filter.frequency.value = filterData.F;
        filter.Q.value = filterData.Q;
        filter.gain.value = filterData.G;    
        
        return filter;
    }

    removeFilter(filter){
        if (!this.isInitialized) {
            return;
        }
        delete this.filters[filter.id];
        this.updateAudioGraph();
    }

    updateFilter(value, filterData, property){
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

    setLoShelfGain(value){
        if (!this.isInitialized) {
            return;
        }

        this.low['gain'].setValueAtTime(value, this.audioContext.currentTime);
    }

    setMidGain(value){
        if (!this.isInitialized) {
            return;
        }

        this.mid['gain'].setValueAtTime(value, this.audioContext.currentTime);
    }

    setHiShelfGain(value){
        if (!this.isInitialized) {
            return;
        }

        this.high['gain'].setValueAtTime(value, this.audioContext.currentTime);
    }
    
    setSpeechMaskGain(value){
        if (!this.isInitialized) {
            return;
        }

        for(let i = 0; i < this.speechFilters.length; i++){
            this.speechFilters[i]['gain'].setValueAtTime(value, this.audioContext.currentTime);
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


        for (let i = 0; i < this.speechFilters.length; i++){
            const speechFilter = this.speechFilters[i];
            previousNode.connect(speechFilter);
            previousNode = speechFilter;
        }

        previousNode.connect(this.onePoleLowpass);
        this.onePoleLowpass.connect(this.high);
        this.high.connect(this.low);
        this.low.connect(this.mid);
        this.mid.connect(this.biquadLowPassFilter);
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

        this.high.disconnect();
        this.low.disconnect();
        this.mid.disconnect();

        for (let i = 0; i < this.speechFilters.length; i++){
            this.speechFilters[i].disconnect();
        }

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