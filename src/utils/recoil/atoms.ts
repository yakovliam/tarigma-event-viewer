import { atom } from "recoil";
import MosaicState from "../types/mosaic/state";
import { BlueprintTheme } from "../types/blueprint/theme";
import { MosaicTilesRepository } from "../types/mosaic/tiles";
import CursorState from "../types/cursor/cursor-state";

const defaultBlueprintTheme: BlueprintTheme = "Blueprint" as BlueprintTheme;
const blueprintThemeRepository = atom({
  key: "blueprintTheme",
  default: defaultBlueprintTheme,
});

const mosaicRepository = atom({
  key: "mosaicRepository",
  default: [] as MosaicTilesRepository,
});

const defaultMosaicState: MosaicState = {
  currentNode: null,
  currentTheme: "Blueprint" as BlueprintTheme,
};

const mosaicState = atom({
  key: "mosaicState",
  default: defaultMosaicState,
});

const cursorsState = atom({
  key: "cursorsState",
  default: [
    {
      id: "cursor-1",
      x: 5,
      color: "green",
    },
    {
      id: "cursor-2",
      x: 8,
      color: "red",
    },
  ] as CursorState[],
});

export {
  mosaicRepository,
  mosaicState,
  blueprintThemeRepository,
  cursorsState,
};
