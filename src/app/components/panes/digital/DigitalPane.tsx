import { useRecoilValue } from "recoil";
import { blueprintThemeRepository } from "../../../../utils/recoil/atoms";
import { isDarkTheme } from "../../../../utils/types/blueprint/theme-utils";
import PaneWrapper from "../PaneWrapper";
import { useEffect, useState } from "react";
import useDimensions from "react-cool-dimensions";
import {
  CanvasGroup,
  DomainTuple,
  VictoryBar,
  VictoryChart,
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

// const domainToPixels = (
//   domain: number,
//   minDomain: number,
//   maxDomain: number,
//   minPixels: number,
//   maxPixels: number
// ) => {
//   return (
//     ((domain - minDomain) / (maxDomain - minDomain)) * (maxPixels - minPixels) +
//     minPixels
//   );
// };

const DigitalPane = (props: DigitalPaneProps) => {
  console.log(props.viewId);
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

  const [initialPositionX, setInitialPositionX] = useState<number | null>(null);
  const [initialDomainX, setInitialDomainX] = useState<DomainTuple | null>(
    null
  );
  const [initialPositionY, setInitialPositionY] = useState<number | null>(null);
  const [initialDomainY, setInitialDomainY] = useState<DomainTuple | null>(
    null
  );

  const [initialPositionX, setInitialPositionX] = useState<number | null>(null);
  const [initialDomainX, setInitialDomainX] = useState<DomainTuple | null>(
    null
  );
  const [initialPositionY, setInitialPositionY] = useState<number | null>(null);
  const [initialDomainY, setInitialDomainY] = useState<DomainTuple | null>(
    null
  );

  const hookCursor = () => {
    setCursorIsHooked(true);
    console.log("cursor hooked");
  };

  const unhookCursor = () => {
    if (cursorIsHooked) {
      setCursorIsHooked(false);
      console.log("cursor unhooked");
    }
  };

  const handleZoomDomainChange = (domain: {
    x: DomainTuple;
    y: DomainTuple;
  }) => {
    if (cursorIsHooked) {
      return;
    } // should be removable
    setZoomDomain(domain);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (
      initialPositionX !== null &&
      initialDomainX !== null &&
      initialPositionY !== null &&
      initialDomainY !== null &&
      canPan
    ) {
      const dy = e.clientY - initialPositionY;
      const dx = e.clientX - initialPositionX;
      const domainWidth =
        (initialDomainX[1] as number) - (initialDomainX[0] as number);
      const domainHeight =
        (initialDomainY[1] as number) - (initialDomainY[0] as number);
      let domainDx = (domainWidth * dx) / width;
      let domainDy = (-1 * (domainHeight * dy)) / height;

      if ((initialDomainX[0] as number) - domainDx < 0)
        domainDx = initialDomainX[0] as number;
      if ((initialDomainY[0] as number) - domainDy < 0)
        domainDy = initialDomainY[0] as number;
      setZoomDomain({
        y: [
          // change x to y
          (initialDomainX[0] as number) - domainDx,
          (initialDomainX[1] as number) - domainDx,
        ],
        x: [
          // change x to y
          (initialDomainY[0] as number) - domainDy,
          (initialDomainY[1] as number) - domainDy,
        ], // change y to x
      });
    }

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

  return (
    <PaneWrapper
      $isDark={isDarkTheme(blueprintTheme)}
      ref={observe}
      // onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        unhookCursor();
        setInitialPositionX(null);
        setInitialDomainX(null);
        setInitialPositionY(null);
        setInitialDomainY(null);
      }}
      // On mouse down, store the initial position and domain
      onMouseDown={(e) => {
        const relativeDomain = pixelsToDomain(
          e.nativeEvent.offsetX,
          leftPadding,
          width - rightPadding,
          zoomDomain.y[0] as number,
          zoomDomain.y[1] as number
        );

        if (Math.abs(relativeDomain - cursorX) < 0.05) hookCursor();
        else {
          setInitialPositionX(e.clientX);
          setInitialDomainX(zoomDomain.y);
          setInitialPositionY(e.clientY);
          setInitialDomainY(zoomDomain.x);
        }
      }}
      // On mouse up, clear the initial position and domain
      onMouseUp={() => {
        console.log("MOUSE UP");
        unhookCursor();
        setInitialPositionX(null);
        setInitialDomainX(null);
        setInitialPositionY(null);
        setInitialDomainY(null);
      }}
      // On mouse move, if the mouse is down, update the domain
      onMouseMove={handleMouseMove}
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
          <VictoryZoomContainer // zoom and pan
            allowPan={false}
            zoomDomain={zoomDomain}
            onZoomDomainChange={
              (domain) => handleZoomDomainChange(domain) //setZoomDomain(domain as { x: DomainTuple; y: DomainTuple })
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
