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
  VictoryLine,
  VictoryPolarAxis,
  VictoryTheme,
} from "victory";
import { Button, Card } from "@blueprintjs/core";

type PhaserType = "positive" | "negative" | "zero";

type PhasorArray = { angle: number; magnitude: number }[];

// const computePhasors = (cursorPosition) => {
//     // Find the relevant COMTRADE data using the cursor position
//     const comtradeData = ...;

//     // Compute the phasors using your existing logic
//     const newPhasors = ...;

//     // Update the phasor state
//     setPhasors(newPhasors);
// }

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
  const [phasorDiagram] = useState([
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

  const [cursorsState] = useRecoilState(cursorsStateAtom);

  const cursorPosition = cursorsState[1].x as number; // value in micro seconds

  const eventsState = useRecoilValue(eventsStateAtom);

  // TODO source picker

  //TODO don't crash when no sources selected
  const digitalDataSources = eventsState[0].digitalDataSources;
  const analogDataSources = eventsState[0].analogDataSources;

  const header = eventsState[0].header;

  // console.log("config", config);
  console.log("header", header);

  // analogDataSources[n].channel.info: label, max, min, multiplier, offset, primaryFactor, primarySecondaryIdentifier, secondaryFactor, skew, units
  // analogDataSources[n].channel.values[n]: timestamp (micro seconds), value (amps)

  //digitalDataSources[n].channel.info: idx, normal, label
  //digitalDataSources[n].channel.values[n]: timestamp (micro seconds), value (0 or 1)

  useEffect(() => {
    // Compute phasors each time cursorPosition changes
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

  const renderVictoryChart = (phasorIndices: number[]) => {
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
            x: phasrLocations[i].magnitude * Math.cos(phasrLocations[i].angle),
            y: phasrLocations[i].magnitude * Math.sin(phasrLocations[i].angle),
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
      charts = [renderVictoryChart([0, 1, 2])];
      break;
    case "allTogether":
      charts = [
        renderVictoryChart(
          Array.from({ length: phasrLocations.length }, (_, i) => i)
        ),
      ];
      break;
    case "groups":
      charts = [
        <div key="upper-group">
          {renderVictoryChart([0, 1, 2])}
          {renderVictoryChart([3, 4, 5])}
        </div>,
        <div key="lower-group">
          {renderVictoryChart([6, 7, 8])}
          {renderVictoryChart([9])}
        </div>,
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
