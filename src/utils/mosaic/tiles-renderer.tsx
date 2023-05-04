import { createInstance } from "./tiles";
import { MosaicBranch, MosaicWindow } from "react-mosaic-component";
import { MosaicTilesRepository } from "../types/mosaic/tiles";
import { v4 as uuidv4 } from "uuid";
import { MosaicTile } from "../types/mosaic/tile";

const createNewNode = (): string => {
  const randomUniqueId = uuidv4();
  return randomUniqueId;
};

export const initializeTiles = (): MosaicTilesRepository => {
  const tiles: MosaicTile[] = [];
  tiles.push(createInstance("analog"));
  tiles.push(createInstance("digital"));
  tiles.push(createInstance("analog"));

  return tiles;
};

export const renderTile = (
  id: string,
  tileRepository: MosaicTilesRepository
): CallableFunction => {
  // // use the repository to create a new instance of the tile
  let element: JSX.Element | undefined = tileRepository.find(
    (tile) => tile.viewId === id
  )?.element;
  let title: string | undefined = tileRepository.find(
    (tile) => tile.viewId === id
  )?.title;

  if (!element || !title) {
    const tile = createInstance("analog");
    element = tile.element;
    title = tile.title;
  }

  if (!element || !title) {
    throw new Error("Could not find tile to render");
  }

  return (path: MosaicBranch[]) => {
    return (
      <MosaicWindow
        path={path}
        createNode={() => createNewNode()}
        title={title || "Untitled"}
      >
        {element}
      </MosaicWindow>
    );
  };
};
