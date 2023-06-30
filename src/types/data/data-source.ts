import AnalogChannel from "./comtrade/channel/analog/analog-channel";
import DigitalChannel from "./comtrade/channel/digital/digital-channel";

/**
 * Represents an analog data source from a comtrade file;
 * applicable to a tile which can have multiple data sources.
 * E.g. Comtrade #1 :: Analog :: Channel #1 is a data source
 */
export type AnalogDataSource = {
  /**
   * Id of the analog data source (same as the idx of the channel)
   */
  id: number;
  /**
   * Id of the comtrade file
   */
  comtradeId: string;
  /**
   * Name of the data source on the comtrade file
   */
  name: string;
  /**
   * Channel of the data source on the comtrade file
   */
  channel: AnalogChannel;
  /**
   * Color of the data source on the chart
   */
  color: string;
};

/**
 * Represents a digital data source from a comtrade file;
 * applicable to a tile which can have multiple data sources.
 * E.g. Comtrade #1 :: Digital :: Channel #1 is a data source
 */
export type DigitalDataSource = {
  /**
   * Id of the digital data source (same as the idx of the channel)
   */
  id: number;
  /**
   * Id of the comtrade file
   */
  comtradeId: string;
  /**
   * Name of the data source on the comtrade file
   */
  name: string;
  /**
   * Channel of the data source on the comtrade file
   */
  channel: DigitalChannel;
};
