import AnalogChannelInfo from "../../config/analog-channel-info";
import TimestampedValue from "../timestamped-value";

type AnalogChannel = {
  label: any;
  /**
   * The index of the channel
   *
   * Referenced in the config
   */
  idx: number;

  /**
   * The values that the channel holds
   */
  values: Array<TimestampedValue>;

  /**
   * The associated info about the channel
   */
  info: AnalogChannelInfo;

  /**
   * An editable number that is multiplied by the values to get the final value
   * to display in the chart
   */
  multiplier: number;
};

export default AnalogChannel;
