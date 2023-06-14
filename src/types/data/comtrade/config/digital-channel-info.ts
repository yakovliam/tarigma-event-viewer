type DigitalChannelInfo = {
  /**
   * "Dn"
   * is the status channel index number. Critical, integer, numeric, minimum length = 1 character,
   * maximum length = 6 characters, minimum value = 1, maximum value = 999999. Leading
   * zeroes or spaces are not required. Sequential counter ranging from 1 to total number of status
   * channels (##D) without regard to recording device channel number.
   *
   * Re-labeled as "idx"
   */
  idx: number;

  /**
   * "ch_id"
   * is the channel name. Non-critical, alphanumeric, minimum length = 0 characters, maximum
   * length = 64 characters.
   *
   * Re-labeled as "label"
   */
  label: string;

  /**
   * "ph"
   * is the channel phase identification. Non-critical, alphanumeric, minimum length = 0 characters,
   * maximum length = 2 characters.
   *
   * Re-labeled as "phaseIdentification"
   */
  phaseIdentification: string;

  /**
   * "ccbm"
   * is the circuit component being monitored. Non-critical, alphanumeric, minimum length = 0
   * characters, maximum length = 64 characters.
   *
   * Re-labeled as "circuitComponent"
   */
  circuitComponent: string;

  /**
   * "y"
   * is the normal state of status channel (applies to status channels only), that is, the state of the
   * input when the primary apparatus is in the steady state “in service” condition. Critical, integer,
   * numeric, minimum length = 1 character, maximum length = 1 character, the only valid values
   * are 0 or 1.
   *
   * Re-labeled as "normal"
   */
  normal: number;
};

export default DigitalChannelInfo;
