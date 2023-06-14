import AnalogChannelInfo from "../../../../types/data/comtrade/config/analog-channel-info";

const parseAnalogChannelsContentToAnalogChannels = (
  analogChannelLines: Array<Array<any>>
): Array<AnalogChannelInfo> => {
  // create empty analog channel info array
  const analogChannelInfoArray: Array<AnalogChannelInfo> = [];

  // loop through each analog channel line
  analogChannelLines.forEach((lineArray) => {
    const index: number = parseInt(lineArray[0], 10);
    const label: string = lineArray[1];
    const phaseIdentification: string = lineArray[2];
    const circuitComponent: string = lineArray[3];
    const units: string = lineArray[4];
    const multiplier: number = lineArray[5];
    const offset: number = lineArray[6];
    const skew: number = lineArray[7];
    const min: number = lineArray[8];
    const max: number = lineArray[9];
    const primaryFactor: number = lineArray[10];
    const secondaryFactor: number = lineArray[11];
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
