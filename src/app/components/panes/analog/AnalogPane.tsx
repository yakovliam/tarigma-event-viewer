import { useRecoilState, useRecoilValue } from "recoil";
import { isDarkTheme } from "../../../../types/blueprint/theme-utils";
import { blueprintThemeRepository } from "../../../../utils/recoil/atoms";
import PaneWrapper from "../PaneWrapper";
import {
  VictoryAxis,
  VictoryChart,
  VictoryZoomContainer,
  DomainTuple,
  VictoryLine,
  CanvasGroup,
} from "victory";
import { MouseEvent, useEffect, useRef, useState } from "react";
import useDimensions from "react-cool-dimensions";
import {
  pixelsToDomain,
  domainToPixels,
} from "../../../../utils/domain/domain-utils";
import { cursorsState as cursorsStateAtom } from "../../../../utils/recoil/atoms";
import { selectedSources as globalSelectedSources } from "../../../../utils/recoil/atoms";
import {
  Button,
  Card,
  Dialog,
  DialogBody,
  DialogFooter,
} from "@blueprintjs/core";
import SourcePickerDialogContent from "../../source/SourcePickerDialogContent";
import React from "react";
import { numberToUniqueColor } from "../../../../utils/helpers/numberToUniqueColor";
import TimestampedValue from "../../../../types/data/comtrade/channel/timestamped-value";
import { clickSelectedSourceint } from "../../../../types/data/sourcesTree/analog/sourceTypes";

const leftPadding = 50;
const rightPadding = 20;
const minDomainX = 0;
const maxDomainX = 200;

type PointerIcon = "default" | "ew-resize";

interface AnalogPaneProps {
  viewId: string;
}

const AnalogPane = (props: AnalogPaneProps) => {
  const [initZoomDomainY, setInitZoomDomainY] = useState({
    min: -3000,
    max: 3000,
  });

  const blueprintTheme = useRecoilValue<string>(blueprintThemeRepository);
  const { observe, unobserve, width, height } = useDimensions();
  const paneRef = useRef<HTMLDivElement | null>(null);

  /**
   * CURSOR LOGIC -------------------------------------------------------------
   */

  const [zoomDomain, setZoomDomain] = useState({
    x: [minDomainX, maxDomainX],
    y: [initZoomDomainY.min, initZoomDomainY.max],
  } as {
    x: DomainTuple;
    y: DomainTuple;
  });
  const [hookedCursor, setHookedCursor] = useState<string | null>(null);
  const [pointerIcon, setPointerIcon] = useState("default" as PointerIcon);
  const [cursorsState, setCursorsState] = useRecoilState(cursorsStateAtom);
  const [selectedSources, setSelectedSources] = useRecoilState(
    globalSelectedSources
  );

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

  /**
   * END CURSOR LOGIC -------------------------------------------------------------
   */

  function calcmaxdomain(arr: TimestampedValue[]): number | null {
    // iterate over analog values until the changes between values is insignifigant too many times
    let acc = 0;
    let smallchanges = 0;
    for (let i = 0; i < arr.length; i++) {
      if (!Number.isNaN(Number(arr[i].value))) {
        const v = Number(arr[i].value);
        acc += v;
        if (acc - acc - v < 5) {
          smallchanges += 1;
        }
        if (smallchanges > 60) {
          return i;
        }
      }
    }
    return null;
  }

  const dynamicMinMaxRangeDomain = () => {
    const analogsources = selectedSources.comtradeSources;
    if (analogsources.length != 0) {
      const highestRange = analogsources.reduce((prev, current) =>
        prev.info.max > current.info.max ? prev : current
      );
      const min = Number(highestRange.info.min) - 500;
      const max = Number(highestRange.info.max) + 500;

      setInitZoomDomainY({ min: min, max: max });

      const maxdomain = calcmaxdomain(highestRange.values);
      if (maxdomain) {
        setZoomDomain({ x: [minDomainX, maxdomain], y: [min, max] });
      }
    }
    console.log(zoomDomain);

    return;
  };

  const [sourcesIsOpen, setSourcesIsOpen] = useState(false);

  const [clickSelectedSource, setClickSelectedSource] =
    useState<clickSelectedSourceint>({
      text: "select a source",
      click: false,
    });

  const [analogLines, setAnalogLines] = useState<JSX.Element[]>([]);

  const comtradeSourcesToVictoryLines = () => {
    const lines = [];

    const analogsources = selectedSources.comtradeSources;

    if (analogsources) {
      for (let i = 0; i < analogsources.length; i++) {
        const arr = analogsources[i].values;

        const data = [];

        let i2 = 0;
        for (const source of arr) {
          //hacky and bad, we really need to fix this type
          if (!Number.isNaN(Number(source.value)))
            data.push({ x: i2, y: Number(source.value) });
          i2++;
        }

        lines.push(
          <VictoryLine
            key={i}
            groupComponent={<CanvasGroup />}
            interpolation={"natural"}
            style={{
              data: { stroke: numberToUniqueColor(i) },
            }}
            data={data}
            samples={100}
          />
        );
      }
    }
    setAnalogLines(lines);
  };

  useEffect(() => {
    comtradeSourcesToVictoryLines();
    dynamicMinMaxRangeDomain();
  }, [selectedSources]);

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
        minDomain={{ x: minDomainX, y: initZoomDomainY.min }}
        maxDomain={{ x: maxDomainX, y: initZoomDomainY.max }}
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

        {analogLines}

        {/* <VictoryLine
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
        /> */}
      </VictoryChart>
      <Card
        style={{
          padding: "4px",
        }}
      >
        <Button
          minimal
          icon="database"
          onClick={() => {
            setSourcesIsOpen(!sourcesIsOpen);
          }}
        />
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
          <SourcePickerDialogContent
            viewId={props.viewId}
            sourcesButton={{
              selectedSources: clickSelectedSource,
              setSelectedSources: setClickSelectedSource,
            }}
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
          children={
            <Button
              intent="primary"
              onClick={() => {
                setClickSelectedSource({
                  ...clickSelectedSource,
                  click: !clickSelectedSource.click,
                });
              }}
            >
              {clickSelectedSource.text}
            </Button>
          }
        />
      </Dialog>
    </PaneWrapper>
  );
};

export default AnalogPane;
