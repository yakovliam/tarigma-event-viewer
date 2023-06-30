import AnalogChannel from "../../types/data/comtrade/channel/analog/analog-channel";
import DigitalChannel from "../../types/data/comtrade/channel/digital/digital-channel";
import {
  AnalogDataSource,
  DigitalDataSource,
} from "../../types/data/data-source";

/**
 * Converts a Comtrade analog channel to a DataSource; DataSources are just a representation of a Comtrade channel
 * but with more information about the parent Comtrade file.
 * @param channel the Comtrade analog channel to convert
 * @param comtradeId the id of the Comtrade file
 * @param color the color of the data source on the chart
 */
export const convertComtradeAnalogChannelToDataSource = (
  channel: AnalogChannel,
  comtradeId: string,
  color: string
): AnalogDataSource => {
  const dataSource: AnalogDataSource = {
    comtradeId: comtradeId,
    name: channel.info.label,
    channel: channel,
    color: color,
  };
  return dataSource;
};

/**
 * Converts a Comtrade digital channel to a DataSource; DataSources are just a representation of a Comtrade channel
 * but with more information about the parent Comtrade file.
 * @param channel the Comtrade digital channel to convert
 * @param comtradeId the id of the Comtrade file
 */
export const convertComtradeDigitalChannelToDataSource = (
  channel: DigitalChannel,
  comtradeId: string
): DigitalDataSource => {
  const dataSource: DigitalDataSource = {
    comtradeId: comtradeId,
    name: channel.info.label,
    channel: channel,
  };
  return dataSource;
};
