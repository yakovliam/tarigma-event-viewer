import { useRecoilValue } from "recoil";
import { isDarkTheme } from "../../../../utils/types/blueprint/theme-utils";
import { blueprintThemeRepository } from "../../../../utils/recoil/atoms";
import PaneWrapper from "../PaneWrapper";
import {
  CanvasGroup,
  VictoryAxis,
  VictoryChart,
  VictoryLine,
  VictoryZoomContainer,
  DomainTuple,
} from "victory";
import { useEffect, useState } from "react";
import useDimensions from "react-cool-dimensions";

const leftPadding = 50;
const rightPadding = 20;

type PointerIcon = "default" | "ew-resize";

interface AnalogPaneProps {
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

const AnalogPane = (props: AnalogPaneProps) => {
  const blueprintTheme = useRecoilValue<string>(blueprintThemeRepository);

  const { observe, unobserve, width, height } = useDimensions();
  const [cursorX, setCursorX] = useState(5);
  const [zoomDomain, setZoomDomain] = useState({
    x: [0, 10],
    y: [-2.5, 2.5],
  } as {
    x: DomainTuple;
    y: DomainTuple;
  });
  const [initialPositionX, setInitialPositionX] = useState<number | null>(null);
  const [initialDomainX, setInitialDomainX] = useState<DomainTuple | null>(
    null
  );
  const [initialPositionY, setInitialPositionY] = useState<number | null>(null);
  const [initialDomainY, setInitialDomainY] = useState<DomainTuple | null>(
    null
  );
  const [cursorIsHooked, setCursorIsHooked] = useState(false);
  const [pointerIcon, setPointerIcon] = useState("default" as PointerIcon);
  const [canPan] = useState(true);

  // console.log(props.viewId);

  useEffect(() => {
    return () => {
      unobserve();
    };
  }, []);

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
    // console.log(domain);
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
          (initialDomainY[0] as number) - domainDy,
          (initialDomainY[1] as number) - domainDy,
        ],
        x: [
          // change x to y
          (initialDomainX[0] as number) - domainDx,
          (initialDomainX[1] as number) - domainDx,
        ], // change y to x
      });
      console.table(zoomDomain)
    }
    // console.log(cursorIsHooked)
    if (!cursorIsHooked) {
      return;
    }

    const paneWidthPixels = width;
    const graphXMinPixels = leftPadding;
    const graphXMaxPixels = paneWidthPixels - rightPadding;
    const mousePixelsOffsetX = e.nativeEvent.offsetX;

    // remember, x and y are flipped because it's a horizontal chart
    const graphXMin: number = zoomDomain.x[0] as number;
    const graphXMax: number = zoomDomain.x[1] as number;

    const x = pixelsToDomain(
      mousePixelsOffsetX,
      graphXMinPixels,
      graphXMaxPixels,
      graphXMin,
      graphXMax
    );

    setCursorX(x);
    console.log(x);
  };

  return (
    <PaneWrapper
      $isDark={isDarkTheme(blueprintTheme)}
      ref={observe}
      onMouseLeave={() => {
        unhookCursor();
        setInitialPositionX(null);
        setInitialDomainX(null);
        setInitialPositionY(null);
        setInitialDomainY(null);
      }}
      onMouseDown={(e) => {
        const relativeDomain = pixelsToDomain(
          e.nativeEvent.offsetX,
          leftPadding,
          width - rightPadding,
          zoomDomain.x[0] as number,
          zoomDomain.x[1] as number
        );

        const loggeddat = {
          name: "analog",
          relativedomain: relativeDomain,
          cursorx: cursorX,
          calc: relativeDomain - cursorX,
          "zoomdomain.y": zoomDomain.y,
          "zoomdomain.x": zoomDomain.x,
        };
        console.table(loggeddat);

        if (Math.abs(relativeDomain - cursorX) < 0.05) {
          console.log("hooked");
          hookCursor();
        } else {
          setInitialPositionX(e.clientX);
          setInitialDomainX(zoomDomain.y);
          setInitialPositionY(e.clientY);
          setInitialDomainY(zoomDomain.x);
        }
      }}
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
          top: 10,
          bottom: 33,
          left: leftPadding,
          right: rightPadding,
        }}
        minDomain={{ x: 0, y: -2.5 }}
        maxDomain={{ x: 10, y: 2.5 }}
        containerComponent={
          <VictoryZoomContainer
            allowPan={false}
            
            zoomDomain={zoomDomain}
            onZoomDomainChange={
              (domain: any) => handleZoomDomainChange(domain) //setZoomDomain(domain as { x: DomainTuple; y: DomainTuple })
            }
          />
        }
      >
        <VictoryAxis
          offsetY={30}
          style={{
            axis: { stroke: "#756f6a" },
            grid: {
              stroke: "#c5aeae",
            },
            ticks: { stroke: "gray", size: 8 },
            tickLabels: { fontSize: 15, padding: 0 },
          }}
          tickFormat={(x) => `${x} ms`}
        />
        <VictoryAxis
          label={"Voltage (V)"}
          style={{
            axis: { stroke: "#000000" },
            grid: {
              stroke: "#c5aeae",
            },
          }}
          dependentAxis
        />

        <VictoryLine
          groupComponent={<CanvasGroup />}
          interpolation={"natural"}
          style={{
            data: { stroke: "blue" },
          }}
          samples={1000}
          y={(d) => Math.sin(10 * Math.PI * d.x)}
        />
        <VictoryLine
          groupComponent={<CanvasGroup />}
          interpolation={"natural"}
          style={{
            data: { stroke: "red" },
          }}
          samples={1000}
          y={(d) => 2 * Math.sin(Math.PI + 10 * Math.PI * d.x)}
        />
        <VictoryLine
          groupComponent={<CanvasGroup />}
          interpolation={"natural"}
          style={{
            data: { stroke: "#ff9500" },
          }}
          samples={1000}
          y={(d) => 2.3 * Math.sin(0.33 * Math.PI + 10 * Math.PI * d.x)}
        />
        <VictoryLine
          groupComponent={<CanvasGroup />}
          x={() => cursorX}
          style={{
            data: {
              stroke: "green",
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

export default AnalogPane;
