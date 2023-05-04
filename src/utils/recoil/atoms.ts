import { atom } from 'recoil';
import { initializeTiles } from '../mosaic/tiles-renderer';

const mosaicRepository = atom({
  key: 'mosaicRepository', // unique ID (with respect to other atoms/selectors)
  default: initializeTiles(),
});

export default mosaicRepository;
