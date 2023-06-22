import * as papa from 'papaparse';
import { ParseResult } from 'papaparse';
import AnalogChannel from '../../../types/data/comtrade/channel/analog/analog-channel';
import DigitalChannel from '../../../types/data/comtrade/channel/digital/digital-channel';
import TimestampedValue from '../../../types/data/comtrade/channel/timestamped-value';
import AnalogChannelInfo from '../../../types/data/comtrade/config/analog-channel-info';
import Config from '../../../types/data/comtrade/config/config';
import DigitalChannelInfo from '../../../types/data/comtrade/config/digital-channel-info';

interface ParseChannelsReturnType {
  analogChannels: AnalogChannel[];
  digitalChannels: DigitalChannel[];
}

const shiftArray = (arr: Array<Array<any>>): Array<Array<any>> =>
  arr.map((row) => {
    row.shift();
    return row;
  });

const getColumnArray = (arr: Array<Array<string>>, n: number): Array<any> =>
  arr.map((x) => x[n]);

const parseChannels = (
  config: Config,
  dataContents: string
): ParseChannelsReturnType => {
  // todo add support for binary files

  // get number of each type of channel
  const numberOfAnalogChannels = config.channelsInfo.analogChannels;
  const numberOfDigitalChannels = config.channelsInfo.digitalChannels;

  // create array of analog channel
  const analogChannels: AnalogChannel[] = [];

  // create array of digital channel
  const digitalChannels: DigitalChannel[] = [];

  // parse data into json
  const jsonData: ParseResult<Array<string>> = papa.parse(dataContents);

  let { data } = jsonData;

  // create array of indexes
  const indexes = getColumnArray(data, 0).map(Number);

  // remove first column (indexes of samples)
  data = shiftArray(data);

  // create array of timestamps
  // loop through only first column (now only timestamps) to gather timestamps
  const timestamps = getColumnArray(data, 0) as Array<number>;

  // shift again to remove timestamps
  data = shiftArray(data);

  // get analog channel data
  for (let i = 0; i < numberOfAnalogChannels; i += 1) {
    const analogValues = getColumnArray(data, i);

    const output: Array<TimestampedValue> = analogValues.map((value, index) => {
      const valuePair: TimestampedValue = {
        timestamp:
          timestamps[index] !== undefined ? (timestamps[index] as number) : -1,
        value,
      };
      return valuePair;
    });

    // get associated info
    const info: AnalogChannelInfo | undefined = config.analogChannelInfo.find(
      (c) => c.idx === indexes[i]
    );

    if (info !== undefined) {
      // create analog channel
      const analogChannel: AnalogChannel = {
        idx: indexes[i],
        values: output,
        info,
        multiplier: 1,
        label: undefined
      };

      analogChannels.push(analogChannel);
    }
  }

  // loop through digital channel
  for (
    let i = numberOfAnalogChannels;
    i < numberOfDigitalChannels + numberOfAnalogChannels;
    i += 1
  ) {
    const digitalValues = getColumnArray(data, i);

    const output: Array<TimestampedValue> = digitalValues.map(
      (value, index) => {
        const valuePair: TimestampedValue = {
          timestamp:
            timestamps[index] !== undefined
              ? (timestamps[index] as number)
              : -1,
          value,
        };
        return valuePair;
      }
    );

    // get associated info
    const info: DigitalChannelInfo | undefined = config.digitalChannelInfo.find(
      (c) => c.idx === indexes[i]
    );

    if (info !== undefined) {
      // create digital channel
      const digitalChannel: DigitalChannel = {
        idx: indexes[i],
        values: output,
        info,
      };

      digitalChannels.push(digitalChannel);
    }
  }

  return { analogChannels, digitalChannels };
};

export default parseChannels;
