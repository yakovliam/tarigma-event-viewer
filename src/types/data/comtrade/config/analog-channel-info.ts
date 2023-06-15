type AnalogChannelInfo = {
  normal: ReactNode;
  /**
   * "An"
   * is the analog channel index number. Critical, numeric, integer, minimum length = 1 character,
   * maximum length = 6 characters, minimum value = 1, maximum value = 999999. Leading
   * zeroes or spaces are not required. Sequential counter from 1 to total number of analog channels
   * (##A) without regard to recording device channel number.
   *
   * Re-labeled as "idz"
   */
  idx: number;

  /**
   * "ch_id"
   * is the channel identifier. Non-critical, alphanumeric, minimum length = 0 characters, maxi-
   * mum length = 64 characters.
   *
   * Re-labeled as "label"
   */
  label: string;

  /**
   * "ph"
   * is the channel phase identification. Non-critical, alphanumeric, minimum length = 0 charac-
   * ters, maximum length = 2 characters.
   *
   * Re-labeled as "phaseIdentification"
   */
  phaseIdentification: string;

  /**
   * "ccbm"
   * is the circuit component being monitored. Non-critical, alphanumeric, minimum length =
   * 0 characters, maximum length = 64 characters.
   *
   * Re-labeled as "circuitComponent"
   */
  circuitComponent: string;

  /**
   * "uu"
   * are the channel units (e.g., kV, V, kA, A). Critical, alphabetical, minimum length = 1 character,
   * maximum length = 32 characters. Units of physical quantities shall use the standard nomenclature
   * or abbreviations specified in IEEE Std 260.1–1993 [B4] or IEEE Std 280–1985 (R1996)
   * [B5], if such standard nomenclature exists. Numerical multipliers shall not be included. Standard
   * multiples such as k (thousands), m (one thousandth), M (millions), etc. may be used.
   *
   * Re-labeled as "units"
   */
  units: string;

  /**
   * "a"
   * is the channel multiplier. Critical, real, numeric, minimum length = 1 character, maximum
   * length = 32 characters. Standard floating point notation may be used (Kreyszig [B7]).
   *
   * Re-labeled as "multiplier"
   */
  multiplier: number;

  /**
   * "b"
   * is the channel offset adder. Critical, real, numeric, minimum length = 1 character, maximum
   * length = 32 characters. Standard floating point notation may be used (Kreyszig [B7]).
   *
   * Re-labeled as "offset"
   */
  offset: number;

  /**
   * "skew"
   * is the channel time skew (in μs) from start of sample period. Non-critical, real number, minimum
   * length = 1 character, maximum length = 32 characters. Standard floating point notation
   * may be used (Kreyszig [B7]).
   *
   * The field provides information on time differences between sampling of channels within the
   * sample period of a record. For example, in an eight-channel device with one A/D converter
   * without synchronized sample and hold running at a 1 ms sample rate, the first sample will
   * be, at the time, represented by the timestamp; the sample times for successive channels
   * within each sample period could be up to 125 μs behind each other. In such cases the skew
   * for successive channels will be 0; 125; 250; 375...; etc.
   */
  skew: number;

  /**
   * "min"
   * is the range minimum data value (lower limit of possible data value range) for data values of
   * this channel. Critical, integer, numeric, minimum length = 1 character, maximum length =
   * 6 characters, minimum value = –99999, maximum value = 99999 (in binary data files the
   * range of data values is limited to –32767 to 32767).
   */
  min: number;

  /**
   * "max"
   * is the range maximum data value (upper limit of possible data value range) for data values
   * of this channel. Critical, integer, numeric, minimum length = 1 character, maximum length = 6 characters,
   * minimum value = –99999, maximum value = 99999 (in binary data files the
   * range of data values is limited to –32767 to 32767).
   */
  max: number;

  /**
   * "primary"
   * is the channel voltage or current transformer ratio primary factor. Critical, real, numeric,
   * minimum length = 1 character, maximum length = 32 characters.
   *
   * Re-labeled as "primaryFactor"
   */
  primaryFactor: number;

  /**
   * "secondary"
   * is the channel voltage or current transformer ratio secondary factor. Critical, real, numeric,
   * minimum length = 1 character, maximum length = 32 characters.
   *
   * Re-labeled as "secondaryFactor"
   */
  secondaryFactor: number;

  /**
   * "PS"
   * is the primary or secondary data scaling identifier. The character specifies whether the value
   * received from the channel conversion factor equation ax+b will represent a primary (P) or
   * secondary (S) value. Critical, alphabetical, minimum length = 1 character, maximum length = 1 character.
   * The only valid characters are: p,P,s,S.
   *
   * Re-labeled as "primarySecondaryIdentifier"
   */
  primarySecondaryIdentifier: string;
};

export default AnalogChannelInfo;
