class NoiseProcessor extends AudioWorkletProcessor 
{
    process(inputs, outputs, parameters) 
    {
        const output = outputs[0];
        const channel = output[0];

        // Fill the output buffer with white noise
        for (let i = 0; i < channel.length; i++) 
        {
            channel[i] = (Math.random() * 2 - 1) * 0.2;
        }

        return true; // Keep the processor alive
    }
}

// Register the processor so it can be used in the AudioWorkletNode
registerProcessor('NoiseGeneator', NoiseProcessor);