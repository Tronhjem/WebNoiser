class OnePoleLowpass extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      {
        name: 'freqency',
        defaultValue: 1000,
        minValue: 20.0,
        maxValue: 20000.0,
        automationRate: 'a-rate'
      }
    ];
  }

  constructor() {
    super();
    this.previousSample = 0.0;
    this.sampleRate = sampleRate; // The audio context sample rate (e.g., 44100 or 48000)
  }

  // Method to compute the alpha coefficient based on the cutoff frequency
  computeAlpha(cutoffFrequency) {
    const wc = 2 * Math.PI * cutoffFrequency; // Angular frequency
    return wc / (wc + this.sampleRate); // Alpha coefficient
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    const output = outputs[0];

    const cutoffFreq = parameters.freqency;

    for (let channel = 0; channel < output.length; channel++) {
      const inputChannel = input[channel];
      const outputChannel = output[channel];

      if (inputChannel) {
        for (let i = 0; i < inputChannel.length; i++) {
          // Compute the alpha value, based on the current cutoff frequency
          const alpha = this.computeAlpha(cutoffFreq[0]);

          // Apply the one-pole filter equation
          const currentSample = inputChannel[i];
          this.previousSample = (1 - alpha) * this.previousSample + alpha * currentSample;

          // Output the filtered sample
          outputChannel[i] = this.previousSample;
        }
      }
    }

    return true; // Keep processor alive
  }
}

registerProcessor('OnePoleLowpass', OnePoleLowpass);
