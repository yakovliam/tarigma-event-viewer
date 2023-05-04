import { MosaicTile } from "../types/mosaic/tile";
import { MosaicTileType } from "../types/mosaic/tiles";
import { v4 as uuidv4 } from "uuid";

const colorBasedOffofUUID = (uuid: string): string => {
  const first3 = uuid.slice(0, 3);
  const first3AsNumber = parseInt(first3, 16);
  const color = first3AsNumber % 360;
  return `hsl(${color}, 100%, 80%)`;
};

export const createInstance = (
  type: MosaicTileType,
  viewId?: string
): MosaicTile => {

  // create a new id
  const id = viewId || uuidv4();

  const first3 = id.slice(0, 3);

  // create a new instance of the tile
  const tileContent = (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        width: "100%",
        backgroundColor: colorBasedOffofUUID(id),
      }}
    >
      <h1>{first3}</h1>
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
