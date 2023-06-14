import AnalogChannelInfo from "./analog-channel-info";
import ChannelsInfo from "./channels-info";
import DigitalChannelInfo from "./digital-channel-info";

type Config = {
  /**
   * "station_name" is the name of the substation location. Non-critical, alphanumeric, minimum length = 0
   * characters, maximum length = 64 characters.
   *
   * Re-labeled as "stationName"
   */
  stationName: string;

  /**
   * "rec_dev_id"
   * is the identification number or name of the recording device. Non-critical, alphanumeric,
   * minimum length = 0 characters, maximum length = 64 characters.
   *
   * Re-labeled as "recordingDeviceId"
   */
  recordingDeviceId: string | undefined;

  /**
   * "rev_year" is the year of the standard revision, e.g. 1999, that identifies the COMTRADE file version.
   * Critical, numeric, minimum length = 4 characters, maximum length = 4 characters.
   * This field shall identify that the file structure differs from the file structure requirement
   * in the original IEEE Std C37.111-1991 COMTRADE Standard. Absence of the field or
   * an empty field is interpreted to mean that the file complies with the 1991 version of the
   * standard.
   *
   * Re-labeled as "revisionYear"
   */
  revisionYear: string;

  /**
   * Contains the information about channels, including amount of both analog and digital, as well
   * as both combined
   */
  channelsInfo: ChannelsInfo;

  /**
   * Contains information about each analog channel
   */
  analogChannelInfo: Array<AnalogChannelInfo>;

  /**
   * Contains information about each digital channel
   */
  digitalChannelInfo: Array<DigitalChannelInfo>;
};

export default Config;
