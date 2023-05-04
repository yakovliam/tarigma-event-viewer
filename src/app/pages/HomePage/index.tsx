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

interface MosaicState {
  currentNode: MosaicNode<string>;
  currentTheme: Theme;
}

export function HomePage() {
  const [repository] = useRecoilState(mosaicRepository);

  const initialState: MosaicState = {
    currentNode: {
      direction: "row",
      first: repository[0].viewId,
      second: {
        direction: "column",
        first: repository[1].viewId,
        second: repository[2].viewId,
      },
      splitPercentage: 40,
    },
    currentTheme: "Blueprint",
  };

  const [mosaicState, setMosaicState] = React.useState(initialState);
  const onChange = (newNode: MosaicNode<string> | null) => {
    if (newNode === null) {
      return;
    }

    // print prev and new node
    console.log("--------------------");
    console.log(mosaicState.currentNode);
    console.log(newNode);

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
        }}>
        <MosaicWithoutDragDropContext<string>
          className={THEMES[mosaicState.currentTheme.toString()]}
          renderTile={(id, path) => renderTile(id, repository)(path)}
          value={mosaicState.currentNode}
          onChange={(node) => onChange(node)}
          blueprintNamespace="bp4"
        />
      </div>
    </>
  );
}
