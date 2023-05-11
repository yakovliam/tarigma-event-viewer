import { Colors } from "@blueprintjs/core";
import { styled } from "styled-components";

type PaneWrapperProps = {
  $isDark: boolean;
};

const PaneWrapper = styled.div<PaneWrapperProps>`
  border: ${(props) =>
    props.$isDark ? "3px dashed" + Colors.DARK_GRAY5 : "none"};
  height: 100%;
  width: 100%;
  flex: 1;
`;

export default PaneWrapper;
