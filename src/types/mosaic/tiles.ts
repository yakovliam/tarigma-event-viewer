import { IconName } from "@blueprintjs/icons";
import { MosaicTile } from "./tile";
import { MaybeElement } from "@blueprintjs/core";
export type MosaicTilesRepository = MosaicTile[];
export type MosaicTileType =
  | "analog"
  | "digital"
  | "events"
  | "symmetric-components";

type UserFriendlyTileMapContent = {
  key: MosaicTileType;
  name: string;
  icon: IconName | MaybeElement;
};

export const userFriendlyTypeMap: UserFriendlyTileMapContent[] = [
  {
    key: "analog",
    name: "Analog",
    // icon: "waves",
    icon: "pulse",
  },
  {
    key: "digital",
    name: "Digital",
    icon: "grid-view",
  },
  {
    key: "events",
    name: "Events",
    icon: "flow-linear",
  },
  {
    key: "symmetric-components",
    name: "Symmetric Components",
    icon: "layout-auto",
  },
];
