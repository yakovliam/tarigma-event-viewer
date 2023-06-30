import { useRecoilState, useRecoilValue } from "recoil";
import { blueprintThemeRepository } from "../../../../utils/recoil/atoms";
import { isDarkTheme } from "../../../../types/blueprint/theme-utils";
import PaneWrapper from "../PaneWrapper";
import {
  JSXElementConstructor,
  ReactElement,
  ReactFragment,
  useEffect,
  useRef,
  useState,
} from "react";
import useDimensions from "react-cool-dimensions";
import {
  CanvasGroup,
  DomainTuple,
  VictoryAxis,
  VictoryBar,
  VictoryChart,
  VictoryLine,
  VictoryZoomContainer,
} from "victory";
import { MouseEvent } from "react";
import {
  domainToPixels,
  pixelsToDomain,
} from "../../../../utils/domain/domain-utils";
import { selectedDigitalSources as globalSelectedDigitalSources } from "../../../../utils/recoil/atoms";
import { cursorsState as cursorsStateAtom } from "../../../../utils/recoil/atoms";
import { Card } from "@blueprintjs/core/lib/esm/components/card/card";
import {
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
} from "@blueprintjs/core/lib/esm/components";
import SourcePickerDialogContent from "../../source/SourcePickerDialogContent";
import { clickSelectedSourceint } from "../../../../types/data/sourcesTree/analog/sourceTypes";
import DigitalChannelPointRangeMap from "../../../../types/data/comtrade/channel/digital/digital-channel-point-range-map";
import data from "../../../../utils/exampledata/data";
const leftPadding = 50;
const rightPadding = 20;
const minDomainX = 0;
let maxDomainX = 6;

const colors = [
  "tomato",
  "#1f77b4", // muted blue
  "teal",
  "orange",
  "gold",
  "#d62728", // brick red
  "#9467bd", // muted purple
  "#e377c2", // raspberry yogurt pink
  "#7f7f7f", // middle gray
  "#bcbd22", // curry yellow-green
  "#17becf", // blue-teal
  "#ff7f0e", // safety orange
  "#2ca02c", // cooked asparagus green
  "#8c564b", // chestnut brown
  "navy",
  "#ECEFF1",
];

type PointerIcon = "default" | "ew-resize";

interface DigitalPaneProps {
  viewId: string;
}

const DigitalPane = (props: DigitalPaneProps) => {
  const blueprintTheme = useRecoilValue<string>(blueprintThemeRepository);
  const { observe, unobserve, width, height } = useDimensions();

  const [sourcesIsOpen, setSourcesIsOpen] = useState(false);

  const [clickSelectedSource, setClickSelectedSource] =
    useState<clickSelectedSourceint>({
      text: "select a source",
      click: false,
    });

  const [selectedSources, setSelectedSources] = useRecoilState(
    globalSelectedDigitalSources
  );

  const digitalSources = selectedSources.comtradeSources;

  // convert digital channel point range map into data array
  const digitalChannelDataArray: Array<[number, number]> = [];

  let maxDataArray: number = 10 * 10000;

  let components = [];

  if (digitalSources && digitalSources.length > 0) {
    // create labels (timestamp values)SourcePickerDialogContent
    const labels: Array<string> = digitalSources.map((ch) => ch.info.label);

    // create data to calculate min & max
    const dataArray: Array<number> = digitalSources.flatMap((ch) =>
      ch.values.map((tv) => tv.timestamp)
    );

    console.log("dataArray: " + dataArray);

    // interpolate [ch: {timestamp, binary 0/1}, ch2: {...}] ==> [ch: [[100ms, 200ms], [300ms, 500ms]], ch2: [...]]
    const digitalChannelPointRangeMapArray: Array<
      DigitalChannelPointRangeMap<any, any>
    > = [];
    digitalSources.forEach((ch) => {
      const pointRangeMap: Array<[any, any]> = [];
      // loop through every timestamped value & interpolate with beginning/end var
      let startTime: any = -1;
      ch.values.forEach((timestampedValue) => {
        const value: number = Number(timestampedValue.value);

        if (startTime === -1) {
          if (value === 1) {
            startTime = timestampedValue.timestamp;
          }
        }

        if (startTime !== -1) {
          if (value === 0) {
            // save to range map
            pointRangeMap.push([startTime, timestampedValue.timestamp]);
            startTime = -1;
          }
        }
      });

      digitalChannelPointRangeMapArray.push({
        ranges: pointRangeMap,
      } as DigitalChannelPointRangeMap<any, any>);
    });

    digitalChannelPointRangeMapArray
      .flatMap(
        (digitalChannelPointRangeMap) => digitalChannelPointRangeMap.ranges
      )
      .forEach((flattenedPart: [number, number]) => {
        digitalChannelDataArray.push(flattenedPart);
      });

    const minDataArray = dataArray.reduce((a, b) => Math.min(a, b));
    maxDataArray = dataArray.reduce((a, b) => Math.max(a, b));

    console.log(digitalChannelDataArray);

    digitalChannelDataArray.length >= 3
      ? (maxDomainX = 0)
      : (maxDomainX = digitalChannelDataArray.length);

    for (let i = 0; i < digitalChannelDataArray.length; i++) {
      components.push(
        <VictoryBar
          horizontal
          groupComponent={<CanvasGroup />}
          style={{
            data: {
              fill: colors[i % colors.length],
              width:
                digitalChannelDataArray.length >= 3
                  ? 130 / digitalChannelDataArray.length
                  : 40,
            },
          }}
          data={
            digitalChannelDataArray[i] != undefined
              ? [
                  {
                    x: i + 0.5,
                    y0: digitalChannelDataArray[i][0] / 10000,
                    y: digitalChannelDataArray[i][1] / 10000,
                  },
                ]
              : [{ x: 1, y0: 0, y: 100 }]
          }
        />
      );
    }

    components.push(
      <VictoryAxis
        tickValues={labels.map((_, i) => i + 0.5)}
        tickFormat={labels}
        style={{ tickLabels: { angle: -45, textAnchor: "end" } }} // Rotate labels for better visibility if necessary
      />
    );
    components.push(<VictoryAxis dependentAxis tickCount={3}/>);
  }

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
        maxDomain={{
          x:
            digitalChannelDataArray.length <= 2
              ? 3
              : digitalChannelDataArray.length,
          y: maxDataArray / 10000,
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
        {components}
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
            isDigital={true}
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
              {JSON.stringify(clickSelectedSource)}
            </Button>
          }
        />
      </Dialog>
      <Card
        style={{
          padding: "4px",
        }}
      >
        <Button
          minimal
          icon="reset"
          onClick={() => {
            // TODO reset the zoom
            // setZoomDomain({ y: [minDomainX, maxDomainX], x: zoomDomain.y });
          }}
        />
      </Card>
    </PaneWrapper>
  );
};

export default DigitalPane;
