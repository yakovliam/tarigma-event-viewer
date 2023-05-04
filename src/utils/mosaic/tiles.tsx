import { MosaicTile } from '../types/mosaic/tile';
import { MosaicTileType } from '../types/mosaic/tiles';
import { v4 as uuidv4 } from 'uuid';

export const createInstance = (type: MosaicTileType): MosaicTile => {
  // create a new unique id for the tile
  const randomUniqueId = uuidv4();
  const id = randomUniqueId;

  // create a new instance of the tile
  const tileContent = (
    <div>
      <p>Window type: {type}.</p>
      <br />
      <p>View Id: {id}</p>
    </div>
  );

  // create the object
  const tile: MosaicTile = {
    type: type,
    viewId: id,
    // capitalize the first letter of the tile type
    title: type.charAt(0).toUpperCase() + type.slice(1),
    element: tileContent,
  };

  return tile;
};
