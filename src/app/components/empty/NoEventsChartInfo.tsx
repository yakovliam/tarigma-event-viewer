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

/**
 * Wrapper for the empty state component.
 * @returns an empty state component to display when there are no data sources selected
 */
const NoEventsChartInfo = () => {
  const blueprintTheme = useRecoilValue<string>(blueprintThemeRepository);
  return (
    <EmptyStateWrapper $isDark={isDarkTheme(blueprintTheme)}>
      <NonIdealState
        icon="inbox-search"
        title="No events opened."
        description={
          "Open one to view grid-critical data."
        }
      />
    </EmptyStateWrapper>
  );
};

export default NoEventsChartInfo;
