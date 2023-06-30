import { v4 as uuidv4 } from "uuid";
import parseChannels from "./channels/comtrade-channels-parser";
import parseConfigContentsToConfig from "./config/config-parser";
import parseHeaderContentsToHeader from "./header/header-parser";
import Header from "../../types/data/comtrade/header/header";
import Comtrade from "../../types/data/comtrade/comtrade";
import Config from "../../types/data/comtrade/config/config";
import { AnalogColorState } from "../color/analog-color-state";
import {
  convertComtradeAnalogChannelToDataSource,
  convertComtradeDigitalChannelToDataSource,
} from "../sources/sources-converter-util";
import {
  AnalogDataSource,
  DigitalDataSource,
} from "../../types/data/data-source";

const parseFileContentsToComtrade = (
  configContents: string,
  headerContents: string | undefined,
  dataContents: string,
  incrementedEventId: number
): Comtrade => {
  // TODO actually parse header
  const header: Header = headerContents
    ? parseHeaderContentsToHeader(headerContents)
    : {};

  const config: Config = parseConfigContentsToConfig(configContents);

  // generate random id
  const id = uuidv4();

  // parse channel
  const { analogChannels, digitalChannels } = parseChannels(
    config,
    dataContents
  );

  const analogColorState: AnalogColorState = new AnalogColorState();

  // convert channels to data sources
  const analogDataSources: AnalogDataSource[] = analogChannels.map((channel) =>
    convertComtradeAnalogChannelToDataSource(
      channel,
      id,
      analogColorState.getNextColor()
    )
  );

  const digitalDataSources: DigitalDataSource[] = digitalChannels.map(
    (channel) => convertComtradeDigitalChannelToDataSource(channel, id)
  );

  return {
    config,
    header,
    analogDataSources,
    digitalDataSources,
    id,
    eventId: incrementedEventId,
  } as Comtrade;
};

export default parseFileContentsToComtrade;
