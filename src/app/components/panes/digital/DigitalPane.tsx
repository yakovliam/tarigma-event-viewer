import { useRecoilState, useRecoilValue } from "recoil";
import { blueprintThemeRepository } from "../../../../utils/recoil/atoms";
import { isDarkTheme } from "../../../../types/blueprint/theme-utils";
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
import { cursorsStateAtom } from "../../../../utils/recoil/atoms";
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

  /**
   * CURSOR LOGIC -------------------------------------------------------------
   */

  const [zoomDomain, setZoomDomain] = useState({
    x: [minDomainX, maxDomainX],
    y: [0, 10],
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
    }
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
    const graphXMin: number = zoomDomain.y[0] as number;
    const graphXMax: number = zoomDomain.y[1] as number;

    const x = pixelsToDomain(
      mousePixelsOffsetX,
      graphXMinPixels,
      graphXMaxPixels,
      graphXMin,
      graphXMax
    );

    updateCursorsState(hookedCursor, x);
  };

  /**
   * END CURSOR LOGIC ---------------------------------------------------------
   */

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
                  cursor.x >= (zoomDomain.y[0] as number) &&
                  cursor.x <= (zoomDomain.y[1] as number)
                    ? "block"
                    : "none",
                position: "absolute",
                left: `${domainToPixels(
                  cursor.x,
                  zoomDomain.y[0] as number,
                  zoomDomain.y[1] as number,
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
