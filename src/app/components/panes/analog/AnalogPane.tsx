import { useRecoilState, useRecoilValue } from "recoil";
import { isDarkTheme } from "../../../../types/blueprint/theme-utils";
import { blueprintThemeRepository } from "../../../../utils/recoil/atoms";
import PaneWrapper from "../PaneWrapper";
import {
  VictoryAxis,
  VictoryChart,
  VictoryZoomContainer,
  DomainTuple,
  CanvasGroup,
  VictoryLine,
  VictoryScatter,
  createContainer,
  VictoryTooltip,
} from "victory";
import { MouseEvent, useEffect, useRef, useState } from "react";
import useDimensions from "react-cool-dimensions";
import {
  pixelsToDomain,
  domainToPixels,
} from "../../../../utils/domain/domain-utils";
import { cursorsStateAtom } from "../../../../utils/recoil/atoms";
import {
  Button,
  Card,
  Dialog,
  DialogBody,
  DialogFooter,
} from "@blueprintjs/core";
import AnalogSourcePickerDialogContent from "../../source/analog/AnalogSourcePickerDialogContent";
import { AnalogDataSource } from "../../../../types/data/data-source";
import EmptyChartInfo from "../../empty/EmptyChartInfo";
import useAnalogChartTitleCalculator from "../../../hooks/useAnalogChartTitleCalculator";
import { ChartBounding } from "../../../../types/chart/chart-bounding";
import { useAnalogChartBoundsCalculator } from "../../../hooks/useAnalogChartBoundsCalculator";
import { round } from "lodash";

const leftPadding = 55;
const rightPadding = 0;
const initMinDomainX = 0;
const initMaxDomainX = 10;
const initMinDomainY = -1000;
const initMaxDomainY = 1000;

type PointerIcon = "default" | "ew-resize";

interface AnalogPaneProps {
  viewId: string;
}

const AnalogPane = (props: AnalogPaneProps) => {
  const blueprintTheme = useRecoilValue<string>(blueprintThemeRepository);

  const { observe, unobserve, width, height } = useDimensions();
  const paneRef = useRef<HTMLDivElement | null>(null);

  const [minDomainX, setMinDomainX] = useState(initMinDomainX);
  const [maxDomainX, setMaxDomainX] = useState(initMaxDomainX);

  const [minDomainY, setMinDomainY] = useState(initMinDomainY);
  const [maxDomainY, setMaxDomainY] = useState(initMaxDomainY);

  const [zoomDomain, setZoomDomain] = useState({
    x: [initMinDomainX, initMaxDomainX],
    y: [initMinDomainY, initMaxDomainY],
  } as ChartBounding);

  const calculateZoomRange = (zoomDomain: { x: any; y?: DomainTuple }) => {
    if (
      typeof zoomDomain.x[0] === "number" &&
      typeof zoomDomain.x[1] === "number"
    ) {
      return zoomDomain.x[1] - zoomDomain.x[0];
    } else {
      // If not numbers, treat as dates
      return (
        (zoomDomain.x[1] as Date).getTime() -
        (zoomDomain.x[0] as Date).getTime()
      );
    }
  };

  /**
   * CURSOR LOGIC -------------------------------------------------------------
   */

  const [hookedCursor, setHookedCursor] = useState<string | null>(null);
  const [pointerIcon, setPointerIcon] = useState("default" as PointerIcon);
  const [cursorsState, setCursorsState] = useRecoilState(cursorsStateAtom);

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

  /**
   * END CURSOR LOGIC -------------------------------------------------------------
   */

  const [sourcesIsOpen, setSourcesIsOpen] = useState(false);
  const [selectedSources, setSelectedSources] = useState<AnalogDataSource[]>(
    []
  );

  const calculateTitle = useAnalogChartTitleCalculator();
  const calculateChartBounds = useAnalogChartBoundsCalculator();

  const updateSelectedSources = (sources: AnalogDataSource[]) => {
    setSelectedSources(sources);
  };

  useEffect(() => {
    // update min and max domain x and y
    if (selectedSources.length === 0) {
      return;
    }

    const { minX, maxX, minY, maxY } = calculateChartBounds(selectedSources);

    setMinDomainX(minX);
    setMaxDomainX(maxX);
    setMinDomainY(minY);
    setMaxDomainY(maxY);

    setZoomDomain({
      x: [minX, maxX],
      y: [minY, maxY],
    });
  }, [
    selectedSources,
    setZoomDomain,
    setMinDomainX,
    setMaxDomainX,
    setMinDomainY,
    setMaxDomainY,
  ]);

  const VictoryZoomVoronoiContainer = createContainer("zoom", "voronoi");

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
      onMouseDown={(e: MouseEvent) => {
        e.stopPropagation();
      }}
      onMouseMove={handleMouseMove}
    >
      {selectedSources.length > 0 &&
        cursorsState
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
                onMouseDown={(e: MouseEvent) => {
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
                    // the minus 40 accounts for the width of the card
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
      {selectedSources.length > 0 ? (
        <VictoryChart
          width={width}
          height={height}
          padding={{
            top: 10,
            bottom: 33,
            left: leftPadding,
            right: rightPadding,
          }}
          minDomain={{ x: minDomainX, y: minDomainY }}
          maxDomain={{ x: maxDomainX, y: maxDomainY }}
          containerComponent={
            <VictoryZoomVoronoiContainer
              zoomDomain={zoomDomain}
              zoomDimension="x"
              onZoomDomainChange={handleZoomDomainChange}
              // downsample
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
            tickFormat={(x) => `${x} μs`}
          />
          <VictoryAxis
            label={calculateTitle(selectedSources)}
            style={{
              grid: {
                stroke: "#c8c8c8",
              },
            }}
            dependentAxis
          />
          {selectedSources.map((source) => {
            const zoomRange = calculateZoomRange(zoomDomain);
            // console.log(zoomRange);
            if (zoomRange <= 32000) {
              return (
                <VictoryScatter
                  key={source.name}
                  style={{ data: { fill: source.color } }}
                  x={(d) => parseFloat(d.timestamp)}
                  y={(d) => parseFloat(d.value)}
                  data={sampleBetween(
                    source.channel.values,
                    zoomDomain.x[0] as number,
                    zoomDomain.x[1] as number
                  )}
                  labels={({ datum }) =>
                    `Name: ${source.name}\nTimestamp: ${datum.timestamp}\nValue: ${datum.value}`
                  }
                  labelComponent={
                    <VictoryTooltip
                      flyoutStyle={{ fill: "black", stroke: "rgba(0,0,0,0.5)" }}
                      style={{ fill: "white", fontSize: 12 }}
                      cornerRadius={5}
                      pointerLength={10}
                      flyoutPadding={{
                        top: 10,
                        right: 15,
                        bottom: 10,
                        left: 15,
                      }}
                    />
                  }
                />
              );
            } else {
              return (
                <VictoryLine
                  key={source.name}
                  groupComponent={<CanvasGroup />}
                  interpolation={"natural"}
                  style={{
                    data: { stroke: source.color },
                  }}
                  samples={source.channel.values.length}
                  x={(d) => parseFloat(d.timestamp)}
                  y={(d) => parseFloat(d.value)}
                  data={sampleBetween(
                    source.channel.values,
                    zoomDomain.x[0] as number,
                    zoomDomain.x[1] as number
                  )} // TODO apply the Ramer-Douglas-Peucker algorithm
                  labels={({ datum }) =>
                    `Name: ${source.name}\nTimestamp: ${datum.timestamp}\nValue: ${datum.value}`
                  }
                  labelComponent={
                    <VictoryTooltip
                      flyoutStyle={{ fill: "black", stroke: "rgba(0,0,0,0.5)" }}
                      style={{ fill: "white", fontSize: 12 }}
                      cornerRadius={5}
                      pointerLength={10}
                      flyoutPadding={{
                        top: 10,
                        right: 15,
                        bottom: 10,
                        left: 15,
                      }}
                    />
                  }
                />
              );
            }
          })}
        </VictoryChart>
      ) : (
        <EmptyChartInfo />
      )}
      <Card
        style={{
          padding: "4px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Button
          minimal
          icon="database"
          onClick={() => {
            setSourcesIsOpen(!sourcesIsOpen);
          }}
        />
        <Button minimal icon="settings" />
      </Card>
      <Dialog
        title="Sources"
        isOpen={sourcesIsOpen}
        icon="database"
        onClose={() => {
          setSourcesIsOpen(false);
        }}
        style={{
          // override blueprint style
          width: "700px",
        }}
      >
        <DialogBody useOverflowScrollContainer>
          <AnalogSourcePickerDialogContent
            selectedSources={selectedSources}
            updateSelectedSources={updateSelectedSources}
          />
        </DialogBody>
        <DialogFooter
          actions={
            <Button
              intent="primary"
              onClick={() => {
                setSourcesIsOpen(false);
              }}
            >
              Close
            </Button>
          }
        />
      </Dialog>
    </PaneWrapper>
  );
};

interface DataPoint {
  timestamp: number;
  value: number;
}

function getDistance(point: DataPoint, line: DataPoint[]): number {
  const [start, end] = line;
  const numerator = Math.abs(
    (end.value - start.value) * point.timestamp -
      (end.timestamp - start.timestamp) * point.value +
      end.timestamp * start.value -
      end.value * start.timestamp
  );
  const denominator = Math.sqrt(
    Math.pow(end.value - start.value, 2) +
      Math.pow(end.timestamp - start.timestamp, 2)
  );
  return numerator / denominator;
}

function downsample(points: DataPoint[], epsilon: number): DataPoint[] {
  const start = points[0];
  const end = points[points.length - 1];
  let index = -1;
  let maxDistance = 0;

  for (let i = 1; i < points.length - 1; i++) {
    const distance = getDistance(points[i], [start, end]);
    if (distance > maxDistance) {
      index = i;
      maxDistance = distance;
    }
  }

  if (maxDistance > epsilon) {
    const results1 = downsample(points.slice(0, index + 1), epsilon);
    const results2 = downsample(points.slice(index), epsilon);
    return results1.slice(0, results1.length - 1).concat(results2);
  } else {
    return [start, end];
  }
}

function sampleBetween(array: any[], start: number, end: number) {
  //only samples data between endpoints
  return array.filter(
    (point) => point.timestamp >= start && point.timestamp <= end
  );
}

export default AnalogPane;
