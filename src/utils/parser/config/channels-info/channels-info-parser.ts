import ChannelsInfo from "../../../../types/data/comtrade/config/channels-info";

const parseChannelsInfoContentToChannelsInfo = (
  channelsInfoData: Array<string>
): ChannelsInfo => {
  // get total # of channels
  // ###
  const totalNumberOfChannelsString: string = channelsInfoData[0];
  const totalNumberOfChannels: number = parseInt(
    totalNumberOfChannelsString,
    10
  );

  // get # of analog channels
  // ##A
  const totalNumberOfAnalogChannelsString: string = channelsInfoData[1];
  const totalNumberOfAnalogChannels: number = parseInt(
    totalNumberOfAnalogChannelsString.replace("A", ""),
    10
  );

  // get # of digital channels
  // ###D
  const totalNumberOfDigitalChannelsString: string = channelsInfoData[2];
  const totalNumberOfDigitalChannels: number = parseInt(
    totalNumberOfDigitalChannelsString.replace("D", ""),
    10
  );

  return {
    totalChannels: totalNumberOfChannels,
    analogChannels: totalNumberOfAnalogChannels,
    digitalChannels: totalNumberOfDigitalChannels,
  };
};

export default parseChannelsInfoContentToChannelsInfo;
