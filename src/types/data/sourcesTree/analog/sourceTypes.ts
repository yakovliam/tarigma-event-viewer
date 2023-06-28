import { TreeNodeInfo } from "@blueprintjs/core";
import { Dispatch, SetStateAction } from "react";

export interface clickSelectedSourceint {
  text:
    | "select a source"
    | "click to remove this source"
    | "click to add this source";
  click: boolean;
}

export interface sourcesButtonState {
  selectedSources: clickSelectedSourceint;
  setSelectedSources: Dispatch<SetStateAction<clickSelectedSourceint>>;
}

export interface selectedSourceState {
  selectedSources: TreeNodeInfo | undefined;
  setSelectedSources: Dispatch<SetStateAction<TreeNodeInfo | undefined>>;
}
