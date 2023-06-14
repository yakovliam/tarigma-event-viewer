import DigitalChannelInfo from "../../../../types/data/comtrade/config/digital-channel-info";

const parseDigitalChannelsContentToDigitalChannels = (
  digitalChannelLines: Array<Array<any>>
): Array<DigitalChannelInfo> => {
  // create empty digital channel info array
  const digitalChannelInfoArray: Array<DigitalChannelInfo> = [];

  // loop through each digital channel line
  digitalChannelLines.forEach((lineArray) => {
    const index: number = parseInt(lineArray[0], 10);
    const label: string = lineArray[1];
    const phaseIdentification: string = lineArray[2];
    const circuitComponent: string = lineArray[3];
    const normal: number = lineArray[4];

    digitalChannelInfoArray.push({
      idx: index,
      label,
      phaseIdentification,
      circuitComponent,
      normal,
    });
  });

  return digitalChannelInfoArray;
};

export default parseDigitalChannelsContentToDigitalChannels;
