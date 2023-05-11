import { MosaicNode } from "react-mosaic-component";
import { MosaicTheme } from "../blueprint/theme";

interface MosaicState {
  currentNode: MosaicNode<string> | null | undefined;
  currentTheme: MosaicTheme;
}

export default MosaicState;
