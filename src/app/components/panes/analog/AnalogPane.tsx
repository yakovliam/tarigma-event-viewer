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
import { MouseEvent, useEffect, useRef, useState } from "react";
import useDimensions from "react-cool-dimensions";
import {
  pixelsToDomain,
  domainToPixels,
} from "../../../../utils/domain/domain-utils";
import useBus, { EventAction, dispatch } from "use-bus";
import { CURSOR_MOVE_EVENT } from "../../../../utils/bus/bus-constants";
import { CursorMoveEventPayload } from "../../../../utils/types/bus/cursor-move-event-payload";

const leftPadding = 50;
const rightPadding = 20;
const minDomainX = 0;
const maxDomainX = 10;

type PointerIcon = "default" | "ew-resize";

interface AnalogPaneProps {
  viewId: string;
}

const AnalogPane = (props: AnalogPaneProps) => {
  const blueprintTheme = useRecoilValue<string>(blueprintThemeRepository);

  const { observe, unobserve, width, height } = useDimensions();
  const [cursorX, setCursorX] = useState(5);
  const [zoomDomain, setZoomDomain] = useState({
    x: [minDomainX, maxDomainX],
    y: [-2.5, 2.5],
  } as {
    x: DomainTuple;
    y: DomainTuple;
  });
  const [cursorIsHooked, setCursorIsHooked] = useState(false);
  const [pointerIcon, setPointerIcon] = useState("default" as PointerIcon);
  const paneRef = useRef<HTMLDivElement | null>(null);

  const dispatchCursorMoveEvent = (x: number) => {
    dispatch({
      type: CURSOR_MOVE_EVENT,
      payload: {
        x: x,
        viewId: props.viewId,
      } as CursorMoveEventPayload,
    });
  };

  useBus(
    CURSOR_MOVE_EVENT,
    (event: EventAction) => {
      setCursorX(event.payload.cursorX);
    },
    [setCursorX]
  );

  useEffect(() => {
    return () => {
      unobserve();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hookCursor = () => {
    setCursorIsHooked(true);
  };

  const unhookCursor = () => {
    if (cursorIsHooked) {
      setCursorIsHooked(false);
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
    if (!cursorIsHooked) {
      return;
    }

    const paneWidthPixels = width;
    const graphXMinPixels = leftPadding;
    const graphXMaxPixels = paneWidthPixels - rightPadding;

    const bounding = paneRef.current?.getBoundingClientRect();
    if (!bounding) {
      return;
    }

    const mousePixelsOffsetX = (e.clientX - bounding?.left) as number;

    const graphXMin: number = zoomDomain.x[0] as number;
    const graphXMax: number = zoomDomain.x[1] as number;

    const x = pixelsToDomain(
      mousePixelsOffsetX,
      graphXMinPixels,
      graphXMaxPixels,
      graphXMin,
      graphXMax
    );

    dispatchCursorMoveEvent(x);
    setCursorX(x);
  };

  return (
    <PaneWrapper
      $isDark={isDarkTheme(blueprintTheme)}
      ref={(el) => {
        observe(el); // set the target element for measuring
        paneRef.current = el; // share the element for other purposes
      }}
      onMouseLeave={() => {
        unhookCursor();
      }}
      onMouseUp={() => {
        unhookCursor();
      }}
      onMouseMove={handleMouseMove}
    >
      <div
        onMouseDown={(e) => {
          e.stopPropagation();
          hookCursor();
        }}
        onMouseEnter={() => {
          setPointerIcon("ew-resize");
        }}
        onMouseLeave={() => {
          setPointerIcon("default");
        }}
        style={{
          cursor: pointerIcon,
          display:
            cursorX >= (zoomDomain.x[0] as number) &&
            cursorX <= (zoomDomain.x[1] as number)
              ? "block"
              : "none",
          position: "absolute",
          left: `${domainToPixels(
            cursorX,
            zoomDomain.x[0] as number,
            zoomDomain.x[1] as number,
            leftPadding,
            width - rightPadding
          )}px`,
          top: "0px",
          height: "100%",
          width: "6px",
          backgroundColor: "red",
          zIndex: 1,
        }}
      />
      <VictoryChart
        width={width}
        height={height}
        padding={{
          top: 10,
          bottom: 33,
          left: leftPadding,
          right: rightPadding,
        }}
        minDomain={{ x: minDomainX, y: -2.5 }}
        maxDomain={{ x: maxDomainX, y: 2.5 }}
        containerComponent={
          <VictoryZoomContainer
            zoomDomain={zoomDomain}
            zoomDimension="x"
            onZoomDomainChange={handleZoomDomainChange}
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
          samples={100}
          y={(d) => Math.sin(10 * Math.PI * d.x)}
        />
        <VictoryLine
          groupComponent={<CanvasGroup />}
          interpolation={"natural"}
          style={{
            data: { stroke: "red" },
          }}
          samples={100}
          y={(d) => 2 * Math.sin(Math.PI + 10 * Math.PI * d.x)}
        />
        <VictoryLine
          groupComponent={<CanvasGroup />}
          interpolation={"natural"}
          style={{
            data: { stroke: "#ff9c3f" },
          }}
          samples={100}
          y={(d) => 2.3 * Math.sin(0.33 * Math.PI + 10 * Math.PI * d.x)}
        />
      </VictoryChart>
    </PaneWrapper>
  );
};

export default AnalogPane;
