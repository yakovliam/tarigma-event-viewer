import { createInstance } from "./tiles";
import {
  ExpandButton,
  MosaicBranch,
  MosaicWindow,
  RemoveButton,
  SplitButton,
} from "react-mosaic-component";
import { MosaicTilesRepository } from "../types/mosaic/tiles";
import { v4 as uuidv4 } from "uuid";
import { MosaicTile } from "../types/mosaic/tile";

export const initializeTiles = (): MosaicTilesRepository => {
  const tiles: MosaicTile[] = [];

  tiles.push(createInstance("events"));
  tiles.push(createInstance("analog"));
  tiles.push(createInstance("analog"));
  tiles.push(createInstance("digital"));

  return tiles;
};

export const renderTile = (
  id: string,
  element: JSX.Element,
  title: string,
  addTile: (viewId: string) => void,
  removeTile: (viewId: string) => void
): CallableFunction => {
  return (path: MosaicBranch[]) => {
    return (
      <MosaicWindow
        toolbarControls={[
          <ExpandButton key={0} />,
          <SplitButton key={1} />,
          <RemoveButton
            key={2}
            onClick={() => {
              removeTile(id);
            }}
          />,
        ]}
        path={path}
        createNode={() => {
          const idToCreateNewNode = uuidv4();
          addTile(idToCreateNewNode);
          return idToCreateNewNode;
        }}
        title={title || "Untitled"}
      >
        {element}
      </MosaicWindow>
    );
  };
};
