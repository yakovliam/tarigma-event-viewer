import { Colors, NonIdealState } from "@blueprintjs/core";
import styled from "styled-components";
import { isDarkTheme } from "../../../types/blueprint/theme-utils";
import { useRecoilValue } from "recoil";
import { blueprintThemeRepository } from "../../../utils/recoil/atoms";

type EmptyStateWrapperProps = {
  $isDark: boolean;
};

const EmptyStateWrapper = styled.div<EmptyStateWrapperProps>`
  display: flex;
  flex-direction: row;
  flex-grow: 1;
  height: 100%;
  width: 100%;

  background: ${(props) => (props.$isDark ? Colors.DARK_GRAY4 : "white")};
`;

const EmptyUnknownTileInfo = () => {
  const blueprintTheme = useRecoilValue<string>(blueprintThemeRepository);
  return (
    <EmptyStateWrapper $isDark={isDarkTheme(blueprintTheme)}>
      <NonIdealState
        icon="help"
        title="Unknown tile type selected."
        description={
          "We're not sure how you got here, but you've selected an unknown tile type. Please contact the developer."
        }
      />
    </EmptyStateWrapper>
  );
};

export default EmptyUnknownTileInfo;
