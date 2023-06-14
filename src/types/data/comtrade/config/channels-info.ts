type ChannelsInfo = {
  /**
   * "TT"
   * is the total number of channels. Critical, numeric, integer, minimum length = 1 character, maximum
   * length = 7 characters, minimum value = 1, maximum value = 999999, TT must equal the
   * sum of ##A and ##D below.
   *
   * Re-labeled as "totalChannels"
   */
  totalChannels: number;

  /**
   * "##A"
   * is the number of analog channels followed by identifier A. Critical, alphanumeric, minimum
   * length = 2 characters, maximum length = 7 characters, minimum value = 0A, maximum value = 999999A.
   *
   * Re-labeled as "analogChannels"
   */
  analogChannels: number;

  /**
   * ##D is the number of status channels followed by identifier D. Critical, alphanumeric, minimum
   * length = 2 characters, maximum length = 7 characters, minimum value = 0D, maximum value = 999999D.
   *
   * Re-labeled as "digitalChannels"
   */
  digitalChannels: number;
};

export default ChannelsInfo;
