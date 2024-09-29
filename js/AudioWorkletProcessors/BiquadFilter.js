class MyBiquadFilter extends AudioWorkletProcessor 
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
        this.Fs = sampleRate;
        this.Q = 1.0;

        this.xz1 = 0.0;
        this.xz2 = 0.0;
        this.yz1 = 0.0;
        this.yz2 = 0.0;
        this.kSmallestPositiveFloatValue = 1.175494351e-38;
        this.kSmallestNegativeFloatValue = -1.175494351e-38;   
        this.MYPI  = 3.1415926535897932384626433832795028841971693993751058209749445923078164062;
        this.kSqrtTwo = Math.pow(2.0, 0.5);
        this.filterType = 0;
        this.setCoef();
    }

    static get parameterDescriptors() {
        return [
            {
                name: "freqency",
                defaultValue: 440.0,
                minValue: 20.0,
                maxValue: 20000.0
            },
            {
                name: "filterType",
                defaultValue: 0,
                minValue: 0,
                maxValue: 1
            }
        ];
    }

    setCoef()
    {
        // lowpass
        if(this.filterType == 0)
        {
            let theta = (this.MYPI * this.Fc) / this.Fs;
            let C = 1.0 /  Math.tan(theta);

            this.a0 = 1.0 / (1.0 + this.kSqrtTwo*C + C*C);
            this.a1 = 2.0 * this.a0;
            this.a2 = this.a0;
            this.b1 = 2.0 * this.a0 * (1.0 - C*C);
            this.b2 = this.a0 * (1.0 - this.kSqrtTwo * C + C * C);
        }
        // highpass
        else if(this.filterType == 1)
        {
            let theta_c = this.MYPI * this.Fc / this.Fs;
		    let C = Math.tan(theta_c);

		    this.a0 = 1.0 / (1.0 + this.kSqrtTwo * C + C * C);
		    this.a1 = -2.0 * this.a0;
		    this.a2 =  this.a0;
		    this.b1 = 2.0 * this.a0 * ( C * C - 1.0);
		    this.b2 =  this.a0 * (1.0 - this.kSqrtTwo * C + C * C);
        }
    }

    process(inputs, outputs, parameters) 
    {
        this.Fc = parameters.freqency[0];
        this.filterType = parameters.filterType[0];
        this.setCoef();
        const input = inputs[0];
        const output = outputs[0];

        for (let channel = 0; channel < output.length; channel++) {
            const inputChannel = input[channel];
            const outputChannel = output[channel];

            if (inputChannel) {
                for (let i = 0; i < inputChannel.length; i++) {
                outputChannel[i] = this.processSample(inputChannel[i]);
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

registerProcessor("MyBiquadFilter", MyBiquadFilter);