class NoiseSynth{
    constructor(){
        this.audioContext = null;
        this.gainNode = null;
        this.pinkNoise = null;
        this.biquadFilter = null;
        this.onePoleLowpass = null;
        this.analyser = null;
        this.gainNode = null;
        this.filters = [];
        this.dataArray = null;
        this.bufferLength = 0;
    }

    async initialize(){
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.gainNode = this.audioContext.createGain();

        await this.audioContext.audioWorklet.addModule('js/AudioWorkletProcessors/PinkNoise.js');
        this.pinkNoise = new AudioWorkletNode(this.audioContext, 'PinkNoise');

        await this.audioContext.audioWorklet.addModule('js/AudioWorkletProcessors/BiquadFilter.js');
        this.biquadFilter = new AudioWorkletNode(this.audioContext, 'MyBiquadFilter');
        
        await this.audioContext.audioWorklet.addModule('js/AudioWorkletProcessors/OnePoleLowpass.js');
        this.onePoleLowpass = new AudioWorkletNode(this.audioContext, 'OnePoleLowpass');

        // this.analyser.fftSize = 2048;
        // this.bufferLength = analyser.frequencyBinCount;
        // this.dataArray = new Uint8Array(bufferLength);

        this.pinkNoise.connect(this.biquadFilter);
        this.biquadFilter.connect(this.onePoleLowpass);
        this.onePoleLowpass.connect(this.gainNode);
        // this.analyser.connect(this.gainNode);
        this.gainNode.connect(this.audioContext.destination);
    }

    getLogFrequency(value) {
        const minFrequency = 20;
        const maxFrequency = 20000;
        return minFrequency * Math.pow(maxFrequency / minFrequency, value);
    }

    setVolume(value){
        this.gainNode.gain.value = value;
    }

    setOnePoleFrequency(value){
        const frequency = this.getLogFrequency(value);
        this.onePoleLowpass.parameters.get("freqency").setValueAtTime(frequency, this.audioContext.currentTime)
    }

    setBiqadFilterFrequency(value){
        const frequency = this.getLogFrequency(value);
        this.biquadFilter.parameters.get("freqency").setValueAtTime(frequency, this.audioContext.currentTime)
    }
    
    addFilter(filterType="lowpass", frequency=18000.0, Q=0.5, gain=0.0)
    {
        const filter = this.audioContext.createBiquadFilter();
        filter.type = filterType;
        filter.frequency.value = frequency;
        filter.Q.value = Q;
        filter.gain.value = gain;    
        
        this.filters.push(filter);
        this.updateAudioGraph();

        return filter;
    }

    updateFilter(filter, property, isLogarithmi){
        if (isLogarithmic) {
            const setValue = Math.pow(10, (value / dialMax) * (Math.log10(max) - Math.log10(min)) + Math.log10(min));
            filter[property].setValueAtTime(setValue, this.audioContext.currentTime);
        } else {
            const setValue = (value / dialMax) * (max - min) + min;
            filter[property].setValueAtTime(setValue, this.audioContext.currentTime);
        }
    }

    connectAll() {
        let previousNode = this.pinkNoise;
        this.filters.forEach(filter => {
            previousNode.connect(filter);
            previousNode = filter;
        });

        previousNode.connect(this.biquadFilter);
        this.biquadFilter.connect(this.onePoleLowpass);
        this.onePoleLowpass.connect(this.gainNode);
        this.gainNode.connect(this.audioContext.destination);
    }

    disconnectAll() {
        this.pinkNoise.disconnect();
        this.onePoleLowpass.disconnect();
        this.biquadFilter.disconnect();
        this.gainNode.disconnect();

        this.filters.forEach(filter => {
            filter.disconnect();
        });
    }

    updateAudioGraph() {
        this.disconnectAll();
        this.connectAll();
    }

    drawSpectrum() {
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
}

export default NoiseSynth;