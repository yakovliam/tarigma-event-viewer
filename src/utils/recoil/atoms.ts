import { atom, selectorFamily } from "recoil";
import MosaicState from "../../types/mosaic/state";
import { BlueprintTheme } from "../../types/blueprint/theme";
import { MosaicTilesRepository } from "../../types/mosaic/tiles";
import CursorState from "../../types/cursor/cursor-state";
import Comtrade from "../../types/data/comtrade/comtrade";
import { TreeNodeInfo } from "@blueprintjs/core";
import AnalogChannel from "../../types/data/comtrade/channel/analog/analog-channel";
import DigitalChannel from "../../types/data/comtrade/channel/digital/digital-channel";

const defaultBlueprintTheme: BlueprintTheme = "Blueprint" as BlueprintTheme;
const blueprintThemeRepository = atom({
  key: "blueprintTheme",
  default: defaultBlueprintTheme,
});

const mosaicRepository = atom({
  key: "mosaicRepository",
  default: [] as MosaicTilesRepository,
});

// selector for getting a tile based on its id
const getTile = selectorFamily({
  key: "getTile",
  get:
    (id: string) =>
    ({ get }) => {
      const tiles = get(mosaicRepository);
      return tiles.find((tile) => tile.viewId === id);
    },
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

const eventsState = atom({
  key: "eventsState",
  default: [] as Comtrade[],
});

const selectedSources = atom({
  key: "selectedSources",
  default: { tree: [] as TreeNodeInfo[], comtradeSources: [] as unknown as AnalogChannel[] | DigitalChannel[]},
});

export {
  mosaicRepository,
  mosaicState,
  blueprintThemeRepository,
  cursorsState,
  eventsState,
  selectedSources,
  getTile,
};
