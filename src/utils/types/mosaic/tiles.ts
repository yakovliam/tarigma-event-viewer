import { MosaicTile } from './tile';
export type MosaicTilesRepository = MosaicTile[];
export type MosaicTileType =
  | 'analog'
  | 'digital'
  | 'events'
  | 'symmetric-components';
