declare module "fft-js" {
  function fft(signal: number[]): Phasor[];
  function ifft(phasors: Phasor[]): number[];
  function dft(signal: number[]): Phasor[];
  function idft(phasors: Phasor[]): number[];
  // ... and so on for other functions you plan to use.

  const util: {
    fftFreq: (phasors: Phasor[], rate: number) => number[];
    fftMag: (phasors: Phasor[]) => number[];
    // ... and so on for other utility functions.
  };

  type Phasor = Array<number>;
}
