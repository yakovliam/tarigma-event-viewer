import AnalogDataSource from "../data/data-source";
import { MosaicTileType } from "./tiles";

export type MosaicTile = {
  viewId: string;
  type: MosaicTileType;
  element: JSX.Element;
  title: string;
  dataSources: AnalogDataSource[];
};
