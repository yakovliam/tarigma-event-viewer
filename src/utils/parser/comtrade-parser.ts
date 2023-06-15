import { v4 as uuidv4 } from "uuid";
import parseChannels from "./channels/comtrade-channels-parser";
import parseConfigContentsToConfig from "./config/config-parser";
import parseHeaderContentsToHeader from "./header/header-parser";
import Header from "../../types/data/comtrade/header/header";
import Comtrade from "../../types/data/comtrade/comtrade";
import Config from "../../types/data/comtrade/config/config";

const parseFileContentsToComtrade = (
  configContents: string,
  headerContents: string,
  dataContents: string,
  incrementedEventId: number
): Comtrade => {
  // TODO actually parse header
  const header: Header =
    headerContents === "" ? {} : parseHeaderContentsToHeader(headerContents);

  const config: Config = parseConfigContentsToConfig(configContents);

  // parse channel
  const { analogChannels, digitalChannels } = parseChannels(
    config,
    dataContents
  );

  // generate random id
  const id = uuidv4();

  return {
    config,
    header,
    analogChannels,
    digitalChannels,
    id,
    eventId: incrementedEventId,
  } as Comtrade;
};

export default parseFileContentsToComtrade;
