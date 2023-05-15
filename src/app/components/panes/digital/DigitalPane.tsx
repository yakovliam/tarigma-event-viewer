import { useRecoilValue } from "recoil";
import { blueprintThemeRepository } from "../../../../utils/recoil/atoms";
import { isDarkTheme } from "../../../../utils/types/blueprint/theme-utils";
import PaneWrapper from "../PaneWrapper";
import { useEffect, useState } from "react";
import useDimensions from "react-cool-dimensions";
import {
  CanvasGroup,
  DomainTuple,
  Tuple,
  VictoryBar,
  VictoryChart,
  VictoryContainer,
  VictoryLine,
  VictoryZoomContainer,
} from "victory";
import { MouseEvent } from "react";

const leftPadding = 50;
const rightPadding = 20;

type PointerIcon = "default" | "ew-resize";

interface DigitalPaneProps {
  viewId: string;
}

const pixelsToDomain = (
  pixels: number,
  minPixels: number,
  maxPixels: number,
  minDomain: number,
  maxDomain: number
) => {
  return (
    ((pixels - minPixels) / (maxPixels - minPixels)) * (maxDomain - minDomain) +
    minDomain
  );
};

const domainToPixels = (
  domain: number,
  minDomain: number,
  maxDomain: number,
  minPixels: number,
  maxPixels: number
) => {
  return (
    ((domain - minDomain) / (maxDomain - minDomain)) * (maxPixels - minPixels) +
    minPixels
  );
};

const DigitalPane = (props: DigitalPaneProps) => {
  const blueprintTheme = useRecoilValue<string>(blueprintThemeRepository);

  const { observe, unobserve, width, height } = useDimensions();

  useEffect(() => {
    return () => {
      unobserve();
    };
  }, []);

  const [cursorIsHooked, setCursorIsHooked] = useState(false);
  const [cursorX, setCursorX] = useState(5);
  const [zoomDomain, setZoomDomain] = useState({ x: [0, 6], y: [0, 10] } as {
    x: DomainTuple;
    y: DomainTuple;
  });
  const [pointerIcon, setPointerIcon] = useState("default" as PointerIcon);
  const [canPan, setCanPan] = useState(true);

  const hookCursor = () => {
    setCanPan(false);
    setCursorIsHooked(true);
  };

  const unhookCursor = () => {
    if (cursorIsHooked) {
      setCursorIsHooked(false);
    }
    setCanPan(true);
  };

  const handleZoomDomainChange = (domain: {
    x: DomainTuple;
    y: DomainTuple;
  }) => {
    if (cursorIsHooked) {
      return;
    }
    setZoomDomain(domain);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!cursorIsHooked) {
      return;
    }

    const paneWidthPixels = width;
    const graphXMinPixels = leftPadding;
    const graphXMaxPixels = paneWidthPixels - rightPadding;
    const mousePixelsOffsetX = e.nativeEvent.offsetX;

    // remember, x and y are flipped because it's a horizontal chart
    const graphXMin: number = zoomDomain.y[0] as number;
    const graphXMax: number = zoomDomain.y[1] as number;

    const x = pixelsToDomain(
      mousePixelsOffsetX,
      graphXMinPixels,
      graphXMaxPixels,
      graphXMin,
      graphXMax
    );

    setCursorX(x);
  };

  useEffect(() => {
    if (cursorIsHooked) {
      console.log("cursor is hooked");
    } else {
      console.log("cursor is not hooked");
    }
  }, [cursorIsHooked]);

  return (
    <PaneWrapper
      $isDark={isDarkTheme(blueprintTheme)}
      ref={observe}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        unhookCursor();
      }}
      onMouseDown={(e: MouseEvent) => {
        const relativeDomain = pixelsToDomain(
          e.nativeEvent.offsetX,
          leftPadding,
          width - rightPadding,
          zoomDomain.y[0] as number,
          zoomDomain.y[1] as number
        );

        // if relative domain is nearby the cursor, hook the cursor
        if (Math.abs(relativeDomain - cursorX) < 0.08) {
          hookCursor();
        }
      }}
      onMouseUp={() => {
        unhookCursor();
      }}
    >
      <VictoryChart
        width={width}
        height={height}
        padding={{
          top: 15,
          bottom: 33,
          left: leftPadding,
          right: rightPadding,
        }}
        horizontal
        domainPadding={{
          x: 200,
          y: 0,
        }}
        minDomain={{ y: 0 }}
        maxDomain={{ y: 10, x: 6 }}
        groupComponent={<CanvasGroup />}
        containerComponent={
          <VictoryZoomContainer
            disable={!canPan}
            onZoomDomainChange={(domain) =>
              handleZoomDomainChange(
                domain as { x: DomainTuple; y: DomainTuple }
              )
            }
            responsive={true}
          />
        }
      >
        <VictoryBar
          groupComponent={<CanvasGroup />}
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
          groupComponent={<CanvasGroup />}
          y={() => cursorX}
          style={{
            data: {
              stroke: "red",
              strokeWidth: 8,
              cursor: pointerIcon,
            },
          }}
          events={[
            {
              target: "data",
              eventHandlers: {
                onMouseEnter: () => {
                  setPointerIcon("ew-resize");
                },
                onMouseLeave: () => {
                  setPointerIcon("default");
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
