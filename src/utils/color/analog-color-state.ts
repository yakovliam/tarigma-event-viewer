export class AnalogColorState {
  private currentIndex = 0;

  private readonly colorOrder: Array<string>;

  constructor() {
    this.colorOrder = [
      "rgb(240,48,48)",
      "rgb(52,176,87)",
      "rgb(0,111,255)",
      "rgb(248,216,16)",
      "rgb(162,94,209)",
      "rgb(255,176,48)",
    ];
  }

  public getNextColor(): string {
    if (this.currentIndex >= this.colorOrder.length) {
      return AnalogColorState.randomRGB();
    }

    const color: string = this.colorOrder[this.currentIndex];
    this.currentIndex += 1;

    return color;
  }

  public reset() {
    this.currentIndex = 0;
  }

  private static randomRGB() {
    const o = Math.round;
    const r = Math.random;
    const s = 255;
    return `rgb(${o(r() * s)},${o(r() * s)},${o(r() * s)})`;
  }
}
