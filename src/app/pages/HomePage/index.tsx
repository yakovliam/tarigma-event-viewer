import { useEffect, useState } from "react";
import {
  MosaicBranch,
  MosaicNode,
  MosaicWithoutDragDropContext,
  createRemoveUpdate,
  updateTree,
} from "react-mosaic-component";
import "react-mosaic-component/react-mosaic-component.css";
import { useRecoilState, useRecoilValue } from "recoil";
import { initializeTiles } from "../../../utils/mosaic/tiles-renderer";
import {
  blueprintThemeRepository,
  mosaicRepositoryAtom,
  mosaicStateAtom,
} from "../../../utils/recoil/atoms";
import { createInstance } from "../../../utils/mosaic/tiles";
import styled from "styled-components";
import { THEMES } from "../../../types/mosaic/theme";
import {
  addAtPath,
  addToTopRight,
  getPathById,
} from "../../../utils/mosaic/leaf-utils";
import EmptyMosaicInfo from "../../components/empty/EmptyMosaicInfo";
import { MosaicTileType } from "../../../types/mosaic/tiles";
import useTileRenderer from "../../hooks/useTileRenderer";

export function HomePage() {
  const [repository, setRepository] = useRecoilState(mosaicRepositoryAtom);
  const [mosaicState, setMosaicState] = useRecoilState(mosaicStateAtom);
  const blueprintTheme = useRecoilValue(blueprintThemeRepository);
  const [shouldInitializeTiles, setShouldInitializeTiles] =
    useState<boolean>(false);

  /**
   * Initialize the tile repository on first load.
   */
  useEffect(() => {
    if (!shouldInitializeTiles) {
      setRepository(initializeTiles());
    }
    setShouldInitializeTiles(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Initialize the tiles AFTER the repository has been initialized.
   */
  useEffect(() => {
    if (!shouldInitializeTiles) {
      return;
    }
    // initialize tiles
    const node: MosaicNode<string> = {
      direction: "row",
      first: {
        direction: "column",
        first: {
          direction: "column",
          first: repository[1].viewId,
          second: repository[2].viewId,
          splitPercentage: 50,
        },
        second: repository[3].viewId,
        splitPercentage: 66,
      },
      second: repository[0].viewId,
      splitPercentage: 75,
    };

    // update the mosaic state with the initialized layout
    setMosaicState({ ...mosaicState, currentNode: node });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldInitializeTiles]);

  /**
   *
   * @param viewId
   * @param path
   */
  const addTileAtPath = (
    viewId: string,
    tileType: MosaicTileType,
    path: MosaicBranch[]
  ) => {
    addTile(viewId, tileType);

    // add the tile at the specified path
    const currentNode: MosaicNode<string> | null =
      mosaicState.currentNode as MosaicNode<string> | null;
    setMosaicState({
      ...mosaicState,
      currentNode: addAtPath(currentNode, viewId, path, "row"),
    });
  };

  /**
   * Add a tile to the repository of available tiles.
   * @param viewId the viewId of the tile to add to the repository
   * @param tileType the type of tile to add to the repository
   */
  const addTile = (viewId: string, tileType: MosaicTileType) => {
    const tile = createInstance(tileType, viewId);
    setRepository([...repository, tile]);
  };

  /**
   * Remove a tile from the repository of available tiles AND the mosaic state.
   * @param viewId the viewId of the tile to remove from the repository and the mosaic state
   */
  const removeTile = (viewId: string) => {
    const newRepository = repository.filter((tile) => tile.viewId !== viewId);
    setRepository(newRepository);
    purgeTileFromMosaic(viewId);
  };

  /**
   * Handles when any changes to the mosaic state occur.
   * @param newNode the new node in the mosaic state (if any)
   */
  const onChange = (newNode: MosaicNode<string> | null) => {
    if (newNode === null) {
      return;
    }

    setMosaicState({ ...mosaicState, currentNode: newNode });
  };

  /**
   *
   * @param viewId the viewId of the tile to add to the top right corner
   */
  const addTileToCorner = (viewId: string) => {
    const currentNode: MosaicNode<string> | null =
      mosaicState.currentNode as MosaicNode<string> | null;
    setMosaicState({
      ...mosaicState,
      currentNode: addToTopRight(currentNode, viewId),
    });
  };

  /**
   * Remove a tile from the mosaic state.
   * @param viewId the viewId of the tile to remove from the mosaic state
   */
  const purgeTileFromMosaic = (viewId: string) => {
    let currentNode: MosaicNode<string> | null =
      mosaicState.currentNode as MosaicNode<string> | null;

    if (!currentNode) {
      return;
    }

    // get path to leaf
    const path = getPathById(viewId, currentNode);

    if (path.length > 0) {
      const update = createRemoveUpdate(currentNode, path);
      currentNode = updateTree(currentNode, [update]);
    } else {
      currentNode = null;
    }

    setMosaicState({ ...mosaicState, currentNode });
  };

  const { renderTile } = useTileRenderer(addTileAtPath, removeTile);

  return (
    <>
      <CenteredFlexWrapper>
        {/* If there are any available tiles, show them with the mosaic wrapper */}
        {repository.length > 0 ? (
          <MosaicWithoutDragDropContext<string>
            className={THEMES[blueprintTheme]}
            renderTile={(id, path) => {
              const element: JSX.Element | undefined = repository.find(
                (tile) => tile.viewId === id
              )?.element;
              const title: string | undefined = repository.find(
                (tile) => tile.viewId === id
              )?.title;

              if (!element || !title) {
                console.log("repo: " + repository);
                console.log("element: " + element);
                console.log("title: " + title);
                console.log("Rendering tile with ID:", id);
                const foundTile = repository.find((tile) => tile.viewId === id);
                console.log("Found tile:", foundTile);
                return <div>Tile not found</div>;
              }

              return renderTile(
                id,
                element,
                title,
                addTileAtPath,
                removeTile
              )(path);
            }}
            value={mosaicState.currentNode || null}
            onChange={(node) => onChange(node)}
            blueprintNamespace="bp4"
          />
        ) : (
          // If there are no available tiles, show the empty state (with the option to add tiles)
          <EmptyMosaicInfo
            addTile={addTile}
            addTileToCorner={addTileToCorner}
          />
        )}
      </CenteredFlexWrapper>
    </>
  );
}

const CenteredFlexWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;

  justify-content: center;
  align-items: center;
`;
