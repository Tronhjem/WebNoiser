class MyFilter extends AudioWorkletProcessor 
{
    constructor()
    {
        super();
        this.coef = 0.02; 
        this.previous = 0;
    }

    process(inputs, outputs, parameters) 
    {
        for (let i = 0; i < outputs.length; i++)
        {
            let output = outputs[i];
            let input = inputs[i];
            for (let j = 0; j < output.length; j++)
            {
                let sampleOutArray = output[j];
                let sampleInArray = input[j];

                for (let sample = 0; sample < sampleOutArray.length; sample++)
                {
                    sampleOutArray[sample] = sampleInArray[sample] * 0.02; 
                }
            }
        }

        return true; // Keep the processor alive
    }
}

registerProcessor('MyFilter', MyFilter);