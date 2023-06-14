import { Colors, NonIdealState, Button } from "@blueprintjs/core";
import styled from "styled-components";
import { isDarkTheme } from "../../../types/blueprint/theme-utils";
import { useRecoilValue } from "recoil";
import { blueprintThemeRepository } from "../../../utils/recoil/atoms";
import { v4 as uuidv4 } from "uuid";

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

type EmptyMosaicInfoProps = {
  addTile: (viewId: string) => void;
  addTileToCorner: (viewId: string) => void;
};

/**
 * Wrapper for the empty state component.
 * @returns an empty state component to display when there are no tiles open
 */
const EmptyMosaicInfo = ({
  addTile,
  addTileToCorner,
}: EmptyMosaicInfoProps) => {
  const blueprintTheme = useRecoilValue<string>(blueprintThemeRepository);
  return (
    <EmptyStateWrapper $isDark={isDarkTheme(blueprintTheme)}>
      <NonIdealState
        icon="inbox-search"
        title="No events open."
        description={
          "You've closed all of the events. Open one to view mission-critical data."
        }
        action={
          <Button
            rightIcon="open-application"
            text="Open Events"
            onClick={() => {
              const viewId = uuidv4();
              addTile(viewId);
              addTileToCorner(viewId);
            }}
          />
        }
      />
    </EmptyStateWrapper>
  );
};

export default EmptyMosaicInfo;
