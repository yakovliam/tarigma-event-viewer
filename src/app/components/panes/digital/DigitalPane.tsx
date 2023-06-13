import { useRecoilValue } from "recoil";
import { blueprintThemeRepository } from "../../../../utils/recoil/atoms";
import { isDarkTheme } from "../../../../utils/types/blueprint/theme-utils";
import PaneWrapper from "../PaneWrapper";
import { useEffect, useRef, useState } from "react";
import useDimensions from "react-cool-dimensions";
import {
  CanvasGroup,
  DomainTuple,
  VictoryBar,
  VictoryChart,
  VictoryZoomContainer,
} from "victory";
import { MouseEvent } from "react";
import {
  domainToPixels,
  pixelsToDomain,
} from "../../../../utils/domain/domain-utils";
import useBus, { EventAction, dispatch } from "use-bus";
import { CURSOR_MOVE_EVENT } from "../../../../utils/bus/bus-constants";
import { CursorMoveEventPayload } from "../../../../utils/types/bus/cursor-move-event-payload";

const leftPadding = 50;
const rightPadding = 20;
const minDomainX = 0;
const maxDomainX = 6;

type PointerIcon = "default" | "ew-resize";

interface DigitalPaneProps {
  viewId: string;
}

const DigitalPane = (props: DigitalPaneProps) => {
  const blueprintTheme = useRecoilValue<string>(blueprintThemeRepository);

  const { observe, unobserve, width, height } = useDimensions();
  const [cursorX, setCursorX] = useState(5);
  const [zoomDomain, setZoomDomain] = useState({
    x: [minDomainX, maxDomainX],
    y: [0, 10],
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

    const bounding = paneRef.current?.getBoundingClientRect();
    if (!bounding) {
      return;
    }

    const mousePixelsOffsetX = (e.clientX - bounding?.left) as number;
    const graphXMin: number = zoomDomain.y[0] as number;
    const graphXMax: number = zoomDomain.y[1] as number;

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
            cursorX >= (zoomDomain.y[0] as number) &&
            cursorX <= (zoomDomain.y[1] as number)
              ? "block"
              : "none",
          position: "absolute",
          left: `${domainToPixels(
            cursorX,
            zoomDomain.y[0] as number,
            zoomDomain.y[1] as number,
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
            allowPan={true}
            zoomDomain={zoomDomain}
            onZoomDomainChange={(domain) => handleZoomDomainChange(domain)}
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
      </VictoryChart>
    </PaneWrapper>
  );
};

export default DigitalPane;
