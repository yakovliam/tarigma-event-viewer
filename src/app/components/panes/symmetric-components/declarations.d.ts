declare module 'fft-js' {
    function fft(signal: number[]): any[];
    function ifft(phasors: any[]): number[];
    function dft(signal: number[]): any[];
    function idft(phasors: any[]): number[];
    // ... and so on for other functions you plan to use.

    const util: {
        fftFreq: (phasors: any[], rate: number) => number[],
        fftMag: (phasors: any[]) => number[],
        // ... and so on for other utility functions.
    };
}