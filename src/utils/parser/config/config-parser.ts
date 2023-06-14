import { ParseResult, parse } from "papaparse";
import parseAnalogChannelsContentToAnalogChannels from "./analog/analog-channels-parser";
import parseChannelsInfoContentToChannelsInfo from "./channels-info/channels-info-parser";
import parseDigitalChannelsContentToDigitalChannels from "./digital/digital-channels-parser";
import AnalogChannelInfo from "../../../types/data/comtrade/config/analog-channel-info";
import ChannelsInfo from "../../../types/data/comtrade/config/channels-info";
import Config from "../../../types/data/comtrade/config/config";
import DigitalChannelInfo from "../../../types/data/comtrade/config/digital-channel-info";

const parseConfigContentsToConfig = (configContents: string): Config => {
  // parse from csv to json
  const jsonData: ParseResult<Array<string>> = parse(configContents);
  const { data } = jsonData;

  // get data
  const stationName: string = data[0][0];
  const recordingDeviceId: string | undefined = data[0][1];
  const revisionYear: string = data[0][2];

  // create channels info
  const channelsInfo: ChannelsInfo = parseChannelsInfoContentToChannelsInfo(
    data[1] as Array<string>
  );

  // get the rows of data that are analog/digital channels
  const analogChannelLines: Array<Array<any>> = data.slice(
    2,
    2 + channelsInfo.analogChannels - 1
  );
  const digitalChannelLines: Array<Array<any>> = data.slice(
    2 + channelsInfo.analogChannels,
    1 + channelsInfo.analogChannels + channelsInfo.digitalChannels
  );

  // create analog channel info
  const analogChannelInfo: Array<AnalogChannelInfo> =
    parseAnalogChannelsContentToAnalogChannels(analogChannelLines);
  // create digital channel info
  const digitalChannelInfo: Array<DigitalChannelInfo> =
    parseDigitalChannelsContentToDigitalChannels(digitalChannelLines);

  return {
    stationName,
    recordingDeviceId,
    revisionYear,
    channelsInfo,
    analogChannelInfo,
    digitalChannelInfo,
  } as Config;
};

export default parseConfigContentsToConfig;
