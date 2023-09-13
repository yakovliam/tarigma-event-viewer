declare module 'fft-js' {
    function fft(signal: number[]): any[];
    function ifft(phasors: any[]): number[];
    function dft(signal: number[]): any[];
    function idft(phasors: any[]): number[];
    // add other functions if needed

    const util: {
        fftFreq: (phasors: any[], rate: number) => number[],
        fftMag: (phasors: any[]) => number[],
        // add other utility functions if needed
    };
}