import { useRecoilValue } from "recoil";
import { blueprintThemeRepository } from "../../../../utils/recoil/atoms";
import { isDarkTheme } from "../../../../utils/types/blueprint/theme-utils";
import PaneWrapper from "../PaneWrapper";
import { Tag, Text } from "@blueprintjs/core";
import { styled } from "styled-components";

interface EventsPaneProps {
  viewId: string;
}

const TemporaryTextWrapper = styled(Text)`
  display: flex;
  flex-direction: row;
  flex-grow: 1;
  height: 100%;
  width: 100%;
  gap: 10px;
  align-items: center;
  justify-content: center;
`;

const EventsPane = (props: EventsPaneProps) => {
  const blueprintTheme = useRecoilValue<string>(blueprintThemeRepository);
  return (
    <PaneWrapper $isDark={isDarkTheme(blueprintTheme)}>
      <TemporaryTextWrapper>
        Events Pane (viewId: {props.viewId})<Tag>Implementation</Tag>
      </TemporaryTextWrapper>
    </PaneWrapper>
  );
};

export default EventsPane;
