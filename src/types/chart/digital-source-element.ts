/**
 * Represents a digital source element, which is
 * a single digital source (1 title/row) that can
 * have multiple bar elements.
 * Digital sources are essentially Gantt charts,
 * so we have to calculate the start and end timestamps of
 * each digital (1 or 0) bar.
 */
export type DigitalSourceElement = {
  /**
   * The id of the digital source element
   */
  sourceId: number;
  /**
   * The bar elements of the digital source element
   */
  elements: DigitalSourceBarElement[];
  /**
   * The title of the digital source element
   * (e.g. "Digital Source 1")
   * This is the same as the title of the row.
   */
  title: string;
};

/**
 * Represents a single bar element of a digital source.
 * A digital source can have multiple of these bar elements.
 * A bar element has a start and end timestamp.
 */
export type DigitalSourceBarElement = {
  /**
   * The start timestamp of the bar element
   */
  start: number;
  /**
   * The end timestamp of the bar element
   */
  end: number;
};
