class PinkNoise extends AudioWorkletProcessor {
  constructor() {
    super();
    
    // Initialize variables for the pink noise generation (filtered white noise)
    this.b0 = 0;
    this.b1 = 0;
    this.b2 = 0;
    this.b3 = 0;
    this.b4 = 0;
    this.b5 = 0;
    this.b6 = 0;
  }

  process(inputs, outputs, parameters) {
    const output = outputs[0];
    const channel = output[0];

    // Pink noise generation using Paul Kellet's algorithm
    for (let i = 0; i < channel.length; i++) {
      const white = Math.random() * 2 - 1; // White noise between -1 and 1

      // Apply the pink noise filter coefficients
      this.b0 = 0.99886 * this.b0 + white * 0.0555179;
      this.b1 = 0.99332 * this.b1 + white * 0.0750759;
      this.b2 = 0.96900 * this.b2 + white * 0.1538520;
      this.b3 = 0.86650 * this.b3 + white * 0.3104856;
      this.b4 = 0.55000 * this.b4 + white * 0.5329522;
      this.b5 = -0.7616 * this.b5 - white * 0.0168980;

      const pink = this.b0 + this.b1 + this.b2 + this.b3 + this.b4 + this.b5 + this.b6 + white * 0.5362;
      this.b6 = white * 0.115926;

      // Output the pink noise
      channel[i] = pink * 0.11; // Adjusting gain to keep output level reasonable
    }

    return true; // Keep the processor alive
  }
}

// Register the processor so it can be used with an AudioWorkletNode
registerProcessor('PinkNoise', PinkNoise);