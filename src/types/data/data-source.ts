import AnalogChannel from "./comtrade/channel/analog/analog-channel";

/**
 * Represents an analog data source from a comtrade file;
 * applicable to a tile which can have multiple data sources.
 * E.g. Comtrade #1 :: Analog :: Channel #1 is a data source
 */
type AnalogDataSource = {
  comtradeId: string;
  name: string;
  channel: AnalogChannel;
};

export default AnalogDataSource;
