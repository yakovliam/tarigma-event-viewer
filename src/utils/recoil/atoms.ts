import { atom, selectorFamily } from "recoil";
import MosaicState from "../../types/mosaic/state";
import { BlueprintTheme } from "../../types/blueprint/theme";
import { MosaicTilesRepository } from "../../types/mosaic/tiles";
import CursorState from "../../types/cursor/cursor-state";
import Comtrade from "../../types/data/comtrade/comtrade";

const defaultBlueprintTheme: BlueprintTheme = "Blueprint" as BlueprintTheme;
const blueprintThemeRepository = atom({
  key: "blueprintTheme",
  default: defaultBlueprintTheme,
});

const mosaicRepositoryAtom = atom({
  key: "mosaicRepository",
  default: [] as MosaicTilesRepository,
});

// selector for getting a tile based on its id
const getTile = selectorFamily({
  key: "getTile",
  get:
    (id: string) =>
    ({ get }) => {
      const tiles = get(mosaicRepositoryAtom);
      return tiles.find((tile) => tile.viewId === id);
    },
});

const defaultMosaicState: MosaicState = {
  currentNode: null,
  currentTheme: "Blueprint" as BlueprintTheme,
};

const mosaicStateAtom = atom({
  key: "mosaicState",
  default: defaultMosaicState,
});

const cursorsStateAtom = atom({
  key: "cursorsState",
  default: [
    {
      id: "cursor-1",
      x: 200000,
      color: "green",
    },
    {
      id: "cursor-2",
      x: 100000,
      color: "red",
    },
  ] as CursorState[],
});

const eventsStateAtom = atom({
  key: "eventsState",
  default: [] as Comtrade[],
});

export {
  mosaicRepositoryAtom,
  mosaicStateAtom,
  blueprintThemeRepository,
  cursorsStateAtom,
  eventsStateAtom,
  getTile,
};
