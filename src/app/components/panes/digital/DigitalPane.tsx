import { useRecoilValue } from "recoil";
import { blueprintThemeRepository } from "../../../../utils/recoil/atoms";
import { isDarkTheme } from "../../../../utils/types/blueprint/theme-utils";
import PaneWrapper from "../PaneWrapper";
import { useEffect } from "react";
import useDimensions from "react-cool-dimensions";
import {
  Bar,
  VictoryBar,
  VictoryChart,
  VictoryLine,
  VictoryZoomContainer,
} from "victory";

interface DigitalPaneProps {
  viewId: string;
}

const DigitalPane = (props: DigitalPaneProps) => {
  const blueprintTheme = useRecoilValue<string>(blueprintThemeRepository);

  const { observe, unobserve, width, height } = useDimensions();

  useEffect(() => {
    return () => {
      unobserve();
    };
  }, []);

  return (
    <PaneWrapper $isDark={isDarkTheme(blueprintTheme)} ref={observe}>
      <VictoryChart
        width={width}
        height={height}
        padding={{
          top: 15,
          bottom: 33,
          left: 50,
          right: 20,
        }}
        horizontal
        domainPadding={{
          x: 200,
          y: 0,
        }}
        minDomain={{ y: 0 }}
        maxDomain={{ y: 10, x: 6 }}
        // containerComponent={<VictoryZoomContainer responsive={true} />}
      >
        <VictoryBar
          style={{
            data: {
              fill: "gray",
            },
          }}
          data={[
            { x: 1, y0: 3, y: 8 },
            { x: 2, y0: 4, y: 10 },
            { x: 3, y0: 2, y: 8 },
            { x: 4, y0: 1, y: 6 },
            { x: 5, y0: 2, y: 8 },
          ]}
        />
        <VictoryLine
          y={() => 2.5}
          style={{
            data: {
              stroke: "red",
              strokeWidth: 5,
            },
          }}
          events={[
            {
              target: "data",
              eventHandlers: {
                onClick: () => {
                  console.log("click");
                  return props;
                },
                onDragStart: () => {
                  console.log("drag start");
                  return props;
                },
                onDrag: () => {
                  console.log("drag");
                  return props;
                },
              },
            },
          ]}
        />
      </VictoryChart>
    </PaneWrapper>
  );
};

export default DigitalPane;
