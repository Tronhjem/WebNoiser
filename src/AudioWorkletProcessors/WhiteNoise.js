class NoiseGenerator extends AudioWorkletProcessor 
{
    process(inputs, outputs, parameters) 
    {
        outputs.forEach((output) => {
            output.forEach((channel) => {
                for (let i = 0; i < channel.length; i++) 
                {
                    channel[i] = (Math.random() * 2 - 1) * 0.2;
                }
            });
        })

        return true; // Keep the processor alive
    }
}

// Register the processor so it can be used in the AudioWorkletNode
registerProcessor("NoiseGenerator", NoiseGenerator);