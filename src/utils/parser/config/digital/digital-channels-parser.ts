import DigitalChannelInfo from "../../../../types/data/comtrade/config/digital-channel-info";

const parseDigitalChannelsContentToDigitalChannels = (
  digitalChannelLines: Array<Array<string>>
): Array<DigitalChannelInfo> => {
  // create empty digital channel info array
  const digitalChannelInfoArray: Array<DigitalChannelInfo> = [];

  // loop through each digital channel line
  digitalChannelLines.forEach((lineArray) => {
    const index: number = parseInt(lineArray[0], 10);
    const label: string = lineArray[1];
    const phaseIdentification: string = lineArray[2];
    const circuitComponent: string = lineArray[3];

    // processing logic dictated by the IEEE standard
    const normal: number = lineArray[4] === "1" ? 1 : 0;

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
