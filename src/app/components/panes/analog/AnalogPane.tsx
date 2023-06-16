import { useRecoilState, useRecoilValue } from "recoil";
import { isDarkTheme } from "../../../../types/blueprint/theme-utils";
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
import { cursorsState as cursorsStateAtom } from "../../../../utils/recoil/atoms";

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
  const [zoomDomain, setZoomDomain] = useState({
    x: [minDomainX, maxDomainX],
    y: [-2.5, 2.5],
  } as {
    x: DomainTuple;
    y: DomainTuple;
  });
  const [hookedCursor, setHookedCursor] = useState<string | null>(null);
  const [pointerIcon, setPointerIcon] = useState("default" as PointerIcon);
  const [cursorsState, setCursorsState] = useRecoilState(cursorsStateAtom);

  const paneRef = useRef<HTMLDivElement | null>(null);

  const updateCursorsState = (cursorId: string, x: number) => {
    setCursorsState((oldCursorsState) => {
      const newCursorsState = oldCursorsState.map((cursorState) => {
        if (cursorState.id === cursorId) {
          return {
            ...cursorState,
            x: x,
          };
        } else {
          return cursorState;
        }
      });

      return newCursorsState;
    });
  };

  useEffect(() => {
    return () => {
      unobserve();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hookCursor = (cursorId: string) => {
    setHookedCursor(cursorId);
  };

  const unhookCursor = () => {
    setHookedCursor(null);
  };

  const handleZoomDomainChange = (domain: {
    x: DomainTuple;
    y: DomainTuple;
  }) => {
    if (hookedCursor) {
      return;
    } // should be removable
    setZoomDomain(domain);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!hookedCursor) {
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

    const hookedCursorId: string = hookedCursor as string;
    updateCursorsState(hookedCursorId, x);
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
      {cursorsState
        .filter((cursor) => {
          return cursor.x !== null && cursor.x !== undefined;
        })
        .map((cursor) => {
          if (!cursor.x) {
            return null;
          }
          return (
            <div
              key={cursor.id}
              onMouseDown={(e) => {
                e.stopPropagation();
                hookCursor(cursor.id);
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
                  cursor.x >= (zoomDomain.x[0] as number) &&
                  cursor.x <= (zoomDomain.x[1] as number)
                    ? "block"
                    : "none",
                position: "absolute",
                left: `${domainToPixels(
                  cursor.x,
                  zoomDomain.x[0] as number,
                  zoomDomain.x[1] as number,
                  leftPadding,
                  width - rightPadding
                )}px`,
                top: "0px",
                height: "100%",
                width: "6px",
                backgroundColor: cursor.color,
                zIndex: 1,
              }}
            />
          );
        })}

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
