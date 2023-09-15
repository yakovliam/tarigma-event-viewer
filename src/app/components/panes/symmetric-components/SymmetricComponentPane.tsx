import { useRecoilState, useRecoilValue } from "recoil";
import {
  blueprintThemeRepository,
  cursorsStateAtom,
  eventsStateAtom,
} from "../../../../utils/recoil/atoms";
import { isDarkTheme } from "../../../../types/blueprint/theme-utils";
import PaneWrapper from "../PaneWrapper";
import {
  JSXElementConstructor,
  ReactElement,
  ReactFragment,
  useEffect,
  useState,
} from "react";
import useDimensions from "react-cool-dimensions";
import {
  CanvasGroup,
  VictoryChart,
  VictoryLabel,
  VictoryLine,
  VictoryPolarAxis,
  VictoryTheme,
} from "victory";
import { Button, Card } from "@blueprintjs/core";
import { dft, util } from "fft-js";

type PhaserType = "positive" | "negative" | "zero";

type PhasorArray = { angle: number; magnitude: number }[];

const getPhasorsAtCursor = (
  sourceIndex: number,
  cursorPosition: number,
  analogDataSources: any[]
): { angle: number; magnitude: number } => {
  if (
    !analogDataSources ||
    !analogDataSources[sourceIndex].channel.values.length
  ) {
    console.error("No data available in analogDataSources");
    return { angle: 0, magnitude: 0 };
  }

  const windowSize = 256;

  // Find the index of the timestamp closest to cursorPosition
  const closestIndex = analogDataSources[sourceIndex].channel.values.findIndex(
    (val: { timestamp: number }) =>
      Math.abs(val.timestamp - cursorPosition) <=
      (analogDataSources[sourceIndex].channel.values[1].timestamp -
        analogDataSources[sourceIndex].channel.values[0].timestamp) /
        2
  );

  if (closestIndex === -1) {
    console.error("Couldn't find a matching index for cursor position");
    return { angle: 0, magnitude: 0 };
  }

  const halfWindow = Math.floor(windowSize / 2);
  const startIndex = Math.max(0, closestIndex - halfWindow);
  const endIndex = Math.min(
    analogDataSources[sourceIndex].channel.values.length - 1,
    closestIndex + halfWindow
  );

  const waveformValues = analogDataSources[sourceIndex].channel.values
    .slice(startIndex, endIndex)
    .map(
      (val: { value: any }) =>
        (val.value + analogDataSources[sourceIndex].channel.info.offset) *
        analogDataSources[sourceIndex].channel.info.multiplier
    );
  console.log("cursorPosition:", cursorPosition);
  console.log("startIndex:", startIndex, "endIndex:", endIndex);
  console.log(
    "Data length:",
    analogDataSources[sourceIndex].channel.values.length
  );
  console.log(
    "Sample values:",
    analogDataSources[sourceIndex].channel.values.slice(0, 5)
  );

  if (!waveformValues.length) {
    console.error("No waveform values extracted");
    return { angle: 0, magnitude: 0 };
  }

  // Compute DFT of the waveform values
  const phasors = dft(waveformValues);

  if (!phasors.length) {
    console.error("DFT computation failed");
    return { angle: 0, magnitude: 0 };
  }

  // Find magnitude and frequency of dominant frequency component
  const magnitudes = util.fftMag(phasors);

  // Find the index of the dominant frequency (max magnitude)
  const dominantIndex = magnitudes.indexOf(Math.max(...magnitudes));
  // const dominantFrequency = frequencies[dominantIndex]; Maybe we can display this when hovering over phasor?
  const dominantMagnitude = magnitudes[dominantIndex];

  const dominantPhasor = phasors[dominantIndex];
  const phaseAngle = Math.atan2(dominantPhasor[1], dominantPhasor[0]); // atan2(imaginary part, real part)

  return { angle: phaseAngle, magnitude: dominantMagnitude };
};

function getRectangularCoordinates(phaser: {
  angle: number;
  magnitude: number;
}) {
  return {
    x: phaser.magnitude * Math.cos(phaser.angle),
    y: phaser.magnitude * Math.sin(phaser.angle),
  };
}

function rotatePhaser(
  phaser: { angle: number; magnitude: number },
  rotationAngle: number
) {
  return {
    ...phaser,
    angle: phaser.angle + rotationAngle,
  };
}

function sumPhasers(
  phasers: { angle: number; magnitude: number }[],
  phaserType: PhaserType
) {
  let sumX = 0;
  let sumY = 0;

  let rotationFactor = 4;
  if (phaserType === "positive") {
    rotationFactor = 4;
  } else if (phaserType === "negative") {
    rotationFactor = 2;
  } else if (phaserType === "zero") {
    rotationFactor = 0;
  } else {
    throw new Error(`Unknown phaser type: ${phaserType}`);
  }

  phasers.forEach((phaser, index) => {
    const coordinates = getRectangularCoordinates(
      rotatePhaser(phaser, ((index % 3) * rotationFactor * Math.PI) / 3)
    );
    sumX += coordinates.x;
    sumY += coordinates.y;
  });

  const magnitude = Math.sqrt(sumX ** 2 + sumY ** 2) / 3;
  const angle = Math.atan2(sumY, sumX);

  return { angle, magnitude };
}

const SymmetricComponentPane = () => {
  const [phasorDiagram, setPhasorDiagram] = useState([
    { angle: (1 * Math.PI) / 3, magnitude: 1 },
    { angle: (2 * Math.PI) / 3, magnitude: 1 },
    { angle: (4 * Math.PI) / 3, magnitude: 1 },
  ] as PhasorArray);

  const PhaserZero = sumPhasers(phasorDiagram, "zero");
  const PhaserPositive = sumPhasers(phasorDiagram, "positive");
  const PhaserNegative = sumPhasers(phasorDiagram, "negative");

  const phasrLocations = [
    { angle: phasorDiagram[0].angle, magnitude: phasorDiagram[0].magnitude },
    { angle: phasorDiagram[1].angle, magnitude: phasorDiagram[1].magnitude },
    { angle: phasorDiagram[2].angle, magnitude: phasorDiagram[2].magnitude },
    { angle: PhaserPositive.angle, magnitude: PhaserPositive.magnitude },
    {
      angle: rotatePhaser(PhaserPositive, (2 * Math.PI) / 3).angle,
      magnitude: PhaserPositive.magnitude,
    },
    {
      angle: rotatePhaser(PhaserPositive, (4 * Math.PI) / 3).angle,
      magnitude: PhaserPositive.magnitude,
    },
    { angle: PhaserNegative.angle, magnitude: PhaserNegative.magnitude },
    {
      angle: rotatePhaser(PhaserNegative, (2 * Math.PI) / 3).angle,
      magnitude: PhaserNegative.magnitude,
    },
    {
      angle: rotatePhaser(PhaserNegative, (4 * Math.PI) / 3).angle,
      magnitude: PhaserNegative.magnitude,
    },
    { angle: PhaserZero.angle, magnitude: PhaserZero.magnitude },
  ];

  const plottingMaxMagnitude = 1;
  const actualMaxMagnitude = Math.max(
    ...phasrLocations.map((phasor) => Math.abs(phasor.magnitude))
  );
  const scalingFactor = plottingMaxMagnitude / actualMaxMagnitude;

  const [cursorsState] = useRecoilState(cursorsStateAtom);

  const cursorPosition = cursorsState[1].x as number; // value in micro seconds

  const eventsState = useRecoilValue(eventsStateAtom);

  // TODO source picker

  //TODO don't crash when no sources selected
  const digitalDataSources = eventsState[0].digitalDataSources;
  const analogDataSources = eventsState[0].analogDataSources;

  // console.log("config", config);

  // analogDataSources[n].channel.info: label, max, min, multiplier, offset, primaryFactor, primarySecondaryIdentifier, secondaryFactor, skew, units
  // analogDataSources[n].channel.values[n]: timestamp (micro seconds), value (amps)

  //digitalDataSources[n].channel.info: idx, normal, label
  //digitalDataSources[n].channel.values[n]: timestamp (micro seconds), value (0 or 1)

  useEffect(() => {
    setPhasorDiagram([
      getPhasorsAtCursor(0, cursorPosition, analogDataSources),
      getPhasorsAtCursor(1, cursorPosition, analogDataSources),
      getPhasorsAtCursor(2, cursorPosition, analogDataSources),
    ]);
  }, [cursorPosition, analogDataSources, digitalDataSources]);

  const [displayMode, setDisplayMode] = useState<
    "firstThree" | "allTogether" | "groups"
  >("firstThree");

  const toggleLines = () => {
    switch (displayMode) {
      case "firstThree":
        setDisplayMode("allTogether");
        break;
      case "allTogether":
        setDisplayMode("groups");
        break;
      case "groups":
      default:
        setDisplayMode("firstThree");
        break;
    }
  };

  const blueprintTheme = useRecoilValue<string>(blueprintThemeRepository);
  const { observe } = useDimensions();
  const colors = ["red", "blue", "green"];
  const strokeWidth = [4, 3, 2.5, 2];

  const renderVictoryChart = (phasorIndices: number[], title: string) => {
    const components = phasorIndices.map((i) => (
      <VictoryLine
        key={`line-${i}`}
        style={{
          data: {
            stroke: colors[i % colors.length],
            strokeWidth: strokeWidth[i % 3],
          },
        }}
        domain={[-1, 1]}
        data={[
          { x: 0, y: 0 },
          {
            x:
              phasrLocations[i].magnitude *
              Math.cos(phasrLocations[i].angle) *
              scalingFactor,
            y:
              phasrLocations[i].magnitude *
              Math.sin(phasrLocations[i].angle) *
              scalingFactor,
          },
        ]}
      />
    ));

    return (
      <div style={{ width: "100%" }}>
        <VictoryChart
          theme={VictoryTheme.material}
          groupComponent={<CanvasGroup />}
        >
          <VictoryLabel
            x={175}
            y={20}
            textAnchor="middle"
            style={{ fontSize: 20, fill: "#333" }}
            text={title}
          />
          {components}
          <VictoryPolarAxis
            style={{
              axis: { stroke: "grey" },
              grid: { strokeWidth: 0 },
              tickLabels: { fontSize: 10, padding: 10 },
            }}
            labelPlacement="vertical"
            domain={[-1, 1]}
            width={400}
            height={400}
            theme={VictoryTheme.material}
            standalone={false}
          />
        </VictoryChart>
      </div>
    );
  };

  let charts:
    | string
    | number
    | boolean
    | JSX.Element[]
    | ReactElement<any, string | JSXElementConstructor<any>>
    | ReactFragment
    | null
    | undefined;
  switch (displayMode) {
    case "firstThree":
      charts = [
        renderVictoryChart([0, 1, 2], "Phasor diagram for IA, IB, and IC"),
      ];
      break;
    case "allTogether":
      charts = [
        renderVictoryChart(
          Array.from({ length: phasrLocations.length }, (_, i) => i),
          "Phasor diagram for IA, IB, and IC" // Adjust this title as required
        ),
      ];
      break;
    case "groups":
      charts = [
        <div key="left">{renderVictoryChart([0, 1, 2], "Input")}</div>,
        <div key="center-left">
          {renderVictoryChart([3, 4, 5], "Positive")}
        </div>,
        <div key="center-right">
          {renderVictoryChart([6, 7, 8], "Negative")}
        </div>,
        <div key="right">{renderVictoryChart([9], "Zero")}</div>,
      ];
      break;
    default:
      charts = [];
      break;
  }

  switch (displayMode) {
    case "firstThree":
      break;
    case "allTogether":
      break;
    case "groups":
    default:
      break;
  }

  return (
    <PaneWrapper $isDark={isDarkTheme(blueprintTheme)} ref={observe}>
      {charts}
      <Card
        style={{
          padding: "4px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Button minimal icon="social-media" onClick={toggleLines}>
          {/* {buttonText} */}
        </Button>
        <Button minimal icon="settings" />
      </Card>
    </PaneWrapper>
  );
};

export default SymmetricComponentPane;
