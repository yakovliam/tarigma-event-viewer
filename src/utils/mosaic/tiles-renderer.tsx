import { createInstance } from "./tiles";
import {
  ExpandButton,
  MosaicBranch,
  MosaicWindow,
} from "react-mosaic-component";
import {
  MosaicTileType,
  MosaicTilesRepository,
} from "../../types/mosaic/tiles";
import { v4 as uuidv4 } from "uuid";
import { MosaicTile } from "../../types/mosaic/tile";
import { Button } from "@blueprintjs/core";

export const initializeTiles = (): MosaicTilesRepository => {
  const tiles: MosaicTile[] = [];

  tiles.push(createInstance("events"));
  tiles.push(createInstance("analog"));
  tiles.push(createInstance("digital"));
  tiles.push(createInstance("symmetric-components"));


  return tiles;
};

export const renderTile = (
  id: string,
  element: JSX.Element,
  title: string,
  addTileAtPath: (
    viewId: string,
    tileType: MosaicTileType,
    path: MosaicBranch[]
  ) => void,
  removeTile: (viewId: string) => void
): CallableFunction => {
  return (path: MosaicBranch[]) => {
    return (
      <MosaicWindow
        toolbarControls={[
          <ExpandButton key={0} />,
          <Button
            minimal
            icon="add-column-right"
            key={1}
            onClick={() => {
              const idToCreateNewNode = uuidv4();
              addTileAtPath(idToCreateNewNode, "analog", path);
            }}
          />,
          <Button
            minimal
            icon="cross"
            key={2}
            onClick={() => {
              removeTile(id);
            }}
          />,
        ]}
        path={path}
        createNode={() => {
          throw new Error(
            "Should never create a new node for an existing tile using this method."
          );
          // const idToCreateNewNode = uuidv4();
          // addTile(idToCreateNewNode);
          // return idToCreateNewNode;
        }}
        title={title || "Untitled"}
      >
        {element}
      </MosaicWindow>
    );
  };
};
