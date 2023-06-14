import Config from './config/config';
import Header from './header/header';
import AnalogChannel from './channel/analog/analog-channel';
import DigitalChannel from './channel/digital/digital-channel';

type Comtrade = {
  // configuration
  config: Config;

  // header
  header: Header;

  // array of all analog channels
  analogChannels: AnalogChannel[];

  // array of all digital channels˝
  digitalChannels: DigitalChannel[];

  // a generated id used to identify the comtrade in-software
  id: string;

  // an incremented event id (first event is # 1, second is # 2) for use in-software
  eventId: number;
};

export default Comtrade;
