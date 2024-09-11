class MyFilter extends AudioWorkletProcessor 
{
    constructor()
    {
        super();
 
        this.a0 = 0.0;
        this.a1 = 0.0; 
        this.a2 = 0.0;
        this.b1 = 0.0; 
        this.b2 = 0.0;
        this.c0 = 0.0;
        this.d0 = 0.0;

        this.Fc = 5000.0;
        this.Fs = 44100;
        this.Q = 1.0;

        this.xz1 = 0.0;
        this.xz2 = 0.0;
        this.yz1 = 0.0;
        this.yz2 = 0.0;
        this.kSmallestPositiveFloatValue = 1.175494351e-38;
        this.kSmallestNegativeFloatValue = -1.175494351e-38;   
        this.MYPI  = 3.1415926535897932384626433832795028841971693993751058209749445923078164062;
        this.kSqrtTwo = Math.pow(2.0, 0.5);

        this.setCoef();
    }

    static get parameterDescriptors() {
    return [
        {
        name: "frequency",
        defaultValue: 440.0,
        minValue: 20.0,
        maxValue: 18000.0
        }
    ];
    }

    setCoef()
    {
        // if(type == Type::ButterworthLPF)
        // {
            let theta = (this.MYPI * this.Fc) / this.Fs;
            let C = 1.0 /  Math.tan(theta);

            this.a0 = 1.0 / (1.0 + this.kSqrtTwo*C + C*C);
            this.a1 = 2.0 * this.a0;
            this.a2 = this.a0;
            this.b1 = 2.0 * this.a0 * (1.0 - C*C);
            this.b2 = this.a0 * (1.0 - this.kSqrtTwo * C + C * C);
        // }
        // else if(type == Type::ButterworthHPF)
        // {
        //     double theta = MYPI * Fc / Fs;
        //     double C = tan(theta);

        //     a0 = 1.0 / (1.0 + kSqrtTwo*C + C*C);
        //     a1 = -2.0 * a0;
        //     a2 = a0;
        //     b1 = 2.0 * a0 * (C*C - 1.0);
        //     b2 = a0 * (1.0 - kSqrtTwo*C + C*C);
        // }
    }

    process(inputs, outputs, parameters) 
    {
        this.Fc = parameters.frequency[0];
        this.setCoef();

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
                    sampleOutArray[sample] = this.processSample(sampleInArray[sample]); 
                }
            }
        }

        return true;
    }

    processSample(inSample)
    {
        let yn = this.a0 * inSample  +
                    this.a1 * this.xz1 +
                    this.a2 * this.xz2 -
                    this.b1 * this.yz1 -
                    this.b2 * this.yz2;
        
        yn = this.checkFloatUnderflow(yn);
        
        this.xz2 = this.xz1;
        this.xz1 = inSample;
        
        this.yz2 = this.yz1;
        this.yz1 = yn;
        return yn;
    }
      
    checkFloatUnderflow(value)
    {
        let retValue = value;
        if (value > 0.0 && value < this.kSmallestPositiveFloatValue)
        {
            retValue = 0;
   
        }
        else if (value < 0.0 && value > this.kSmallestNegativeFloatValue)
        {
            retValue = 0;
        }
        return retValue;
    }
}

registerProcessor('MyFilter', MyFilter);