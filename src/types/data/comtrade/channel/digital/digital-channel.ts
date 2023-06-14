import DigitalChannelInfo from "../../config/digital-channel-info";
import TimestampedValue from "../timestamped-value";

type DigitalChannel = {
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
  info: DigitalChannelInfo;
};

export default DigitalChannel;
