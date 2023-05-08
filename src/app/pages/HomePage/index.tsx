import * as React from "react";
import {
  MosaicNode,
  MosaicWithoutDragDropContext,
} from "react-mosaic-component";

// Use mosaic styling
import "react-mosaic-component/react-mosaic-component.css";

import { useRecoilState } from "recoil";
import { THEMES } from "../../../utils/mosaic/theme";
import { renderTile } from "../../../utils/mosaic/tiles-renderer";
import mosaicRepository from "../../../utils/recoil/atoms";
import { Theme } from "../../../utils/types/mosaic/theme";
import { createInstance } from "../../../utils/mosaic/tiles";

interface MosaicState {
  currentNode: MosaicNode<string>;
  currentTheme: Theme;
}


export function HomePage() {
  const [repository, setRepository] = useRecoilState(mosaicRepository);

  const initialMosaicState = (): MosaicState => {
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
  
    return {
      currentNode: node,
      currentTheme: "Blueprint",
    };
  };

  const [mosaicState, setMosaicState] = React.useState(initialMosaicState());

  const addTile = (viewId: string) => {
    const tile = createInstance("analog", viewId);
    setRepository([...repository, tile]);
  };

  const removeTile = (viewId: string) => {
    setRepository((oldRespository) =>
      oldRespository.filter((tile) => tile.viewId !== viewId)
    );
  };

  const onChange = (newNode: MosaicNode<string> | null) => {
    if (newNode === null) {
      return;
    }

    setMosaicState({ ...mosaicState, currentNode: newNode });
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          width: "100%",
        }}
      >
        <MosaicWithoutDragDropContext<string>
          className={THEMES[mosaicState.currentTheme.toString()]}
          renderTile={(id, path) => {
            const element: JSX.Element | undefined = repository.find(
              (tile) => tile.viewId === id
            )?.element;
            const title: string | undefined = repository.find(
              (tile) => tile.viewId === id
            )?.title;

            if (!element || !title) {
              return <div>Tile not found</div>;
            }

            return renderTile(id, element, title, addTile, removeTile)(path);
          }}
          value={mosaicState.currentNode}
          onChange={(node) => onChange(node)}
          blueprintNamespace="bp4"
        />
      </div>
    </>
  );
}
