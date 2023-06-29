import AnalogChannel from "../../types/data/comtrade/channel/analog/analog-channel";
import DigitalChannel from "../../types/data/comtrade/channel/digital/digital-channel";
import Comtrade from "../../types/data/comtrade/comtrade";
import AnalogDataSource from "../../types/data/data-source";

/**
 * Converts a Comtrade analog channel to a DataSource; DataSources are just a representation of a Comtrade channel
 * but with more information about the parent Comtrade file.
 * @param channel the Comtrade analog channel to convert
 * @param associatedComtrade the Comtrade file that the channel is associated with
 */
export const convertComtradeAnalogChannelToDataSource = (
  channel: AnalogChannel,
  associatedComtrade: Comtrade
): AnalogDataSource => {
  const dataSource: AnalogDataSource = {
    comtradeId: associatedComtrade.id,
    name: channel.info.label,
    channelType: "analog",
    channel: channel,
  };
  return dataSource;
};
