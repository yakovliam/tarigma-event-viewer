import { atom } from "recoil";
import MosaicState from "../types/mosaic/state";
import { BlueprintTheme } from "../types/blueprint/theme";
import { MosaicTilesRepository } from "../types/mosaic/tiles";

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

export { mosaicRepository, mosaicState, blueprintThemeRepository };
