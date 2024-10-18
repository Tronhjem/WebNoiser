export const dialMin = 0;
export const dialMax = 100;
export const FilterMinMax =
{
    frequency:
    {
        min: 20,
        max: 20000
    },
    Q:
    {
        min: 0.1,
        max: 10
    },
    gain:
    {
        min: -25,
        max: 25,
        mid: 0
    },
}
export const volumeMin = 0;
export const volumeMax = 1;
export const constantFilterTypes = ["lowpass", "highpass", "bandpass", "notch", "peaking", "lowshelf", "highshelf"];
export const MyBiquadFilterTypes = {
    LOWPASS: 0,
    HIGHPASS: 1,
}

// Filters
export const biquadLowPass = 15000.0;
export const biquadHighPass = 40.0;
export const lowShelfFreq = 300.0;
export const midFreq = 1000.0;
export const highShelfFreq = 5000.0;

export const saveParamsName = 'p';