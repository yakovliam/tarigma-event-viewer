import { MosaicNode } from "react-mosaic-component";
import { BlueprintTheme } from "../blueprint/theme";

interface MosaicState {
  currentNode: MosaicNode<string> | null | undefined;
  currentTheme: BlueprintTheme;
}

export default MosaicState;
