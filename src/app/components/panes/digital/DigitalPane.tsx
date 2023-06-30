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
import { DigitalDataSource } from "../../../../types/data/data-source";
import { useDigitalChartBoundsCalculator } from "../../../hooks/useDigitalChartBoundsCalculator";
import { ChartBounding } from "../../../../types/chart/chart-bounding";
import {
  Card,
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
} from "@blueprintjs/core";
import EmptyChartInfo from "../../empty/EmptyChartInfo";
import {
  DigitalSourceBarElement,
  DigitalSourceElement,
} from "../../../../types/chart/digital-source-element";
import TimestampedValue from "../../../../types/data/comtrade/channel/timestamped-value";
import DigitalSourcePickerDialogContent from "../../source/digital/DigitalSourcePickerDialogContent";

const leftPadding = 50;
const rightPadding = 20;
const initMinDomainY = 0;
const initMaxDomainY = 6;
const initMinDomainX = 0;
const initMaxDomainX = 10;

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

  const [minDomainX, setMinDomainX] = useState(initMinDomainX);
  const [maxDomainX, setMaxDomainX] = useState(initMaxDomainX);

  const [minDomainY, setMinDomainY] = useState(initMinDomainY);
  const [maxDomainY, setMaxDomainY] = useState(initMaxDomainY);

  const [zoomDomain, setZoomDomain] = useState({
    x: [initMinDomainY, initMaxDomainY],
    y: [initMinDomainX, initMaxDomainX],
  } as ChartBounding);

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

  const handleZoomDomainChange = (domain: ChartBounding) => {
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

  const [sourcesIsOpen, setSourcesIsOpen] = useState(false);
  const [selectedSources, setSelectedSources] = useState<DigitalDataSource[]>(
    []
  );
  const [selectedElements, setSelectedElements] = useState<
    DigitalSourceElement[]
  >([]);
  const calculateChartBounds = useDigitalChartBoundsCalculator();

  const updateSelectedSources = (sources: DigitalDataSource[]) => {
    setSelectedSources(sources);
  };

  useEffect(() => {
    // update selected elements from selected sources
    if (selectedSources.length === 0) {
      return;
    }

    // selectedSources.forEach((source) => {
    //   console.log(source.channel.values);
    // });

    const elements: DigitalSourceElement[] = selectedSources.map((source) => {
      const values: TimestampedValue[] = source.channel.values;
      const barElements: DigitalSourceBarElement[] = [];

      let startTime = -1;
      for (let i = 0; i < values.length; i++) {
        const value = Number(values[i].value);
        const timestamp = Number(values[i].timestamp);

        if (startTime === -1) {
          if (value === 1) {
            startTime = timestamp;
          }
        }

        if (startTime !== -1) {
          if (value === 0) {
            // save to range map (bar elements)
            barElements.push({
              start: startTime,
              end: timestamp,
            });
            startTime = -1;
          }
        }
      }

      // if no end was found, the entire range is selected
      if (startTime !== -1) {
        barElements.push({
          start: Number(startTime),
          end: Number(values[values.length - 1].timestamp),
        } as DigitalSourceBarElement);
      }

      return {
        sourceId: source.id,
        title: source.name,
        elements: barElements,
      } as DigitalSourceElement;
    });

    setSelectedElements(elements);
  }, [selectedSources]);

  useEffect(() => {
    // update min and max domain x and y
    if (selectedSources.length === 0) {
      return;
    }

    const { minX, maxX, minY, maxY } = calculateChartBounds(selectedSources);

    setMinDomainX(minY);
    setMaxDomainX(maxY);
    setMinDomainY(minX);
    setMaxDomainY(maxX);

    setZoomDomain({
      x: [minY, maxY],
      y: [minX, maxX],
    });
  }, [
    selectedSources,
    setZoomDomain,
    setMinDomainX,
    setMaxDomainX,
    setMinDomainY,
    setMaxDomainY,
  ]);

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
      {selectedSources.length > 0 ? (
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
            x: 20,
            y: 0,
          }}
          minDomain={{
            x: minDomainX,
            y: minDomainY,
          }}
          maxDomain={{
            x: maxDomainX,
            y: maxDomainY,
          }}
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
            // data={[
            //   { x: "TRIP", y0: 3, y: 80000 },
            //   { x: "AAA", y0: 4, y: 100000 },
            //   { x: "AAB", y0: 2, y: 80000 },
            //   { x: "AAC", y0: 1, y: 60000 },
            //   { x: "AAD", y0: 2, y: 80000 },
            // ]}
            data={selectedElements.flatMap((element) => {
              return element.elements.map((bar) => {
                return {
                  x: element.title,
                  y0: bar.start,
                  y: bar.end,
                };
              });
            })}
          />
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
          <DigitalSourcePickerDialogContent
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

export default DigitalPane;
