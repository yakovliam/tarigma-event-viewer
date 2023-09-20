import AnalogChannelInfo from "../../../../types/data/comtrade/config/analog-channel-info";

const parseAnalogChannelsContentToAnalogChannels = (
  analogChannelLines: Array<Array<string>>
): Array<AnalogChannelInfo> => {
  // create empty analog channel info array
  const analogChannelInfoArray: Array<AnalogChannelInfo> = [];

  // loop through each analog channel line
  analogChannelLines.forEach((lineArray) => {
    // print datatype of each lineArray element
    lineArray.forEach((element) => {
      console.log(typeof element);
    });

    const index: number = parseInt(lineArray[0], 10);
    const label: string = lineArray[1];
    const phaseIdentification: string = lineArray[2];
    const circuitComponent: string = lineArray[3];
    const units: string = lineArray[4];
    const multiplier: number = lineArray[5] as unknown as number;
    const offset: number = lineArray[6] as unknown as number;
    const skew: number = lineArray[7] as unknown as number;
    const min: number = lineArray[8] as unknown as number;
    const max: number = lineArray[9] as unknown as number;
    const primaryFactor: number = lineArray[10] as unknown as number;
    const secondaryFactor: number = lineArray[11] as unknown as number;
    const primarySecondaryIdentifier: string = lineArray[12];

    analogChannelInfoArray.push({
      idx: index,
      label,
      phaseIdentification,
      circuitComponent,
      units,
      multiplier,
      offset,
      skew,
      min,
      max,
      primaryFactor,
      secondaryFactor,
      primarySecondaryIdentifier,
    });
  });

  return analogChannelInfoArray;
};

export default parseAnalogChannelsContentToAnalogChannels;
