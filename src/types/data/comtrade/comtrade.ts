import Config from './config/config';
import Header from './header/header';
import { AnalogDataSource, DigitalDataSource } from '../data-source';

type Comtrade = {
  // configuration
  config: Config;

  // header
  header: Header;

  // analog data sources
  analogDataSources: AnalogDataSource[];

  // digital data sources
  digitalDataSources: DigitalDataSource[];

  // a generated id used to identify the comtrade in-software
  id: string;

  // an incremented event id (first event is # 1, second is # 2) for use in-software
  eventId: number;
};

export default Comtrade;
