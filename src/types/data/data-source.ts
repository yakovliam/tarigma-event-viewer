import AnalogChannel from "./comtrade/channel/analog/analog-channel";
import { ChannelTypeAliasType } from "./comtrade/channel/channel-type";
import DigitalChannel from "./comtrade/channel/digital/digital-channel";

/**
 * Represents a data source from a comtrade file;
 * applicable to a tile which can have multiple data sources.
 * E.g. Comtrade #1 :: Analog :: Channel #1 is a data source
 */
type DataSource = {
  comtradeId: string;
  name: string;
  channelType: ChannelTypeAliasType;
  channel: DigitalChannel | AnalogChannel;
};

export default DataSource;
