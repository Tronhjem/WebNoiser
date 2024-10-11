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
export const constantFilterTypes = ["lowpass", "highpass", "bandpass", "notch", "allpass", "peaking", "lowshelf", "highshelf"];
export const MyBiquadFilterTypes = {
    LOWPASS: 0,
    HIGHPASS: 1,
}