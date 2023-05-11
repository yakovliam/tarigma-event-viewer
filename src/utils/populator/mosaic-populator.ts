import { MosaicNode } from "react-mosaic-component";
import MosaicState from "../types/mosaic/state";
import { useRecoilValue } from "recoil";
import {mosaicRepository} from "../recoil/atoms";

const MosaicStatePopulator = (): MosaicState => {
  const repository = useRecoilValue(mosaicRepository);

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

export default MosaicStatePopulator;
