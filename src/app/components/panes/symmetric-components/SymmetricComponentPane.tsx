import { useRecoilValue } from "recoil";
import { blueprintThemeRepository } from "../../../../utils/recoil/atoms";
import { isDarkTheme } from "../../../../types/blueprint/theme-utils";
import PaneWrapper from "../PaneWrapper";
import { useState } from "react";
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
import { clickSelectedSourceint } from "../../../../types/data/sourcesTree/analog/sourceTypes";

// Phasor types
type PhaserType = "positive" | "negative" | "zero";

// Array holding input phaser diagram details
const phaserDiagram = [
  { angle: (1 * Math.PI) / 3, magnitude: 0.9 },
  { angle: (2 * Math.PI) / 3, magnitude: 0.5 },
  { angle: (5 * Math.PI) / 3, magnitude: 0.5 },
];

// This function calculates the rectangular coordinates for a phaser
function getRectangularCoordinates(phaser: {
  angle: number;
  magnitude: number;
}) {
  return {
    x: phaser.magnitude * Math.cos(phaser.angle),
    y: phaser.magnitude * Math.sin(phaser.angle),
  };
}

// This function rotates a phaser by a certain angle
function rotatePhaser(
  phaser: { angle: number; magnitude: number },
  rotationAngle: number
) {
  return {
    ...phaser,
    angle: phaser.angle + rotationAngle,
  };
}

// Function to calculate sum of phasers depending on phaser type
function sumPhasers(
  phasers: { angle: number; magnitude: number }[],
  phaserType: PhaserType
) {
  let sumX = 0;
  let sumY = 0;

  let rotationFactor = 4;
  // Setting the rotation factor depending on the phaser type
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

const PhaserZero = sumPhasers(phaserDiagram, "zero");
const PhaserPositive = sumPhasers(phaserDiagram, "positive");
const PhaserNegative = sumPhasers(phaserDiagram, "negative");

// Array that holds all phasers

interface SymmetricComponentPaneProps {
  viewId: string;
}

const SymmetricComponentPane = (props: SymmetricComponentPaneProps) => {
  enum DisplayState {
    ShowFirstThree,
    ShowAll,
    ShowToCenter,
  }

  const [displayState, setDisplayState] = useState(DisplayState.ShowAll);

  function generatePhaserLocation(
    position: { x: number; y: number },
    phaser: { angle: number; magnitude: number },
    rotationAngle = 0
  ) {
    const rotatedPhaser = rotatePhaser(phaser, rotationAngle);
    const x = displayState === DisplayState.ShowAll ? 0 : position.x;
    const y = displayState === DisplayState.ShowAll ? 0 : position.y;

    return {
      x,
      y,
      angle: rotatedPhaser.angle,
      magnitude: rotatedPhaser.magnitude,
    };
  }

  const phasrLocations = [
    ...phaserDiagram.map((phaser) =>
      generatePhaserLocation({ x: 0, y: 0 }, phaser)
    ), //IA, IB, IC

    generatePhaserLocation({ x: 0, y: 0 }, PhaserPositive), //PA
    generatePhaserLocation({ x: 0, y: 0 }, PhaserPositive, (2 * Math.PI) / 3), //PB
    generatePhaserLocation({ x: 0, y: 0 }, PhaserPositive, (4 * Math.PI) / 3), //PC
    generatePhaserLocation(
      {
        x: PhaserPositive.magnitude * Math.cos(PhaserPositive.angle),
        y: PhaserPositive.magnitude * Math.sin(PhaserPositive.angle),
      },
      PhaserNegative
    ), //NA
    generatePhaserLocation(
      {
        x:
          rotatePhaser(PhaserPositive, (2 * Math.PI) / 3).magnitude *
          Math.cos(rotatePhaser(PhaserPositive, (2 * Math.PI) / 3).angle),
        y:
          rotatePhaser(PhaserPositive, (2 * Math.PI) / 3).magnitude *
          Math.sin(rotatePhaser(PhaserPositive, (2 * Math.PI) / 3).angle),
      },
      PhaserNegative,
      (4 * Math.PI) / 3
    ), //NB
    generatePhaserLocation(
      {
        x:
          rotatePhaser(PhaserPositive, (4 * Math.PI) / 3).magnitude *
          Math.cos(rotatePhaser(PhaserPositive, (4 * Math.PI) / 3).angle),
        y:
          rotatePhaser(PhaserPositive, (4 * Math.PI) / 3).magnitude *
          Math.sin(rotatePhaser(PhaserPositive, (4 * Math.PI) / 3).angle),
      },
      PhaserNegative,
      (2 * Math.PI) / 3
    ), //NC
    {
      x:
        displayState === DisplayState.ShowAll
          ? 0
          : PhaserPositive.magnitude * Math.cos(PhaserPositive.angle) +
            PhaserNegative.magnitude * Math.cos(PhaserNegative.angle),
      y:
        displayState === DisplayState.ShowAll
          ? 0
          : PhaserPositive.magnitude * Math.sin(PhaserPositive.angle) +
            PhaserNegative.magnitude * Math.sin(PhaserNegative.angle),
      angle: PhaserZero.angle,
      magnitude: PhaserZero.magnitude,
    }, //ZA
    {
      x:
        displayState === DisplayState.ShowAll
          ? 0
          : rotatePhaser(PhaserPositive, (2 * Math.PI) / 3).magnitude *
              Math.cos(rotatePhaser(PhaserPositive, (2 * Math.PI) / 3).angle) +
            rotatePhaser(PhaserNegative, (4 * Math.PI) / 3).magnitude *
              Math.cos(rotatePhaser(PhaserNegative, (4 * Math.PI) / 3).angle),
      y:
        displayState === DisplayState.ShowAll
          ? 0
          : rotatePhaser(PhaserPositive, (2 * Math.PI) / 3).magnitude *
              Math.sin(rotatePhaser(PhaserPositive, (2 * Math.PI) / 3).angle) +
            rotatePhaser(PhaserNegative, (4 * Math.PI) / 3).magnitude *
              Math.sin(rotatePhaser(PhaserNegative, (4 * Math.PI) / 3).angle),
      angle: PhaserZero.angle,
      magnitude: PhaserZero.magnitude,
    }, //ZB
    {
      x:
        displayState === DisplayState.ShowAll
          ? 0
          : rotatePhaser(PhaserPositive, (4 * Math.PI) / 3).magnitude *
              Math.cos(rotatePhaser(PhaserPositive, (4 * Math.PI) / 3).angle) +
            rotatePhaser(PhaserNegative, (2 * Math.PI) / 3).magnitude *
              Math.cos(rotatePhaser(PhaserNegative, (2 * Math.PI) / 3).angle),
      y:
        displayState === DisplayState.ShowAll
          ? 0
          : rotatePhaser(PhaserPositive, (4 * Math.PI) / 3).magnitude *
              Math.sin(rotatePhaser(PhaserPositive, (4 * Math.PI) / 3).angle) +
            rotatePhaser(PhaserNegative, (2 * Math.PI) / 3).magnitude *
              Math.sin(rotatePhaser(PhaserNegative, (2 * Math.PI) / 3).angle),
      angle: PhaserZero.angle,
      magnitude: PhaserZero.magnitude,
    }, //ZC
  ];

  const toggleLines = () => {
    switch (displayState) {
      case DisplayState.ShowAll:
        setDisplayState(DisplayState.ShowFirstThree);
        break;
      case DisplayState.ShowFirstThree:
        setDisplayState(DisplayState.ShowToCenter);
        break;
      case DisplayState.ShowToCenter:
      default:
        setDisplayState(DisplayState.ShowAll);
    }
  };

  //console.log(props.viewId);
  const blueprintTheme = useRecoilValue<string>(blueprintThemeRepository);

  const { observe } = useDimensions();

  let components = [];

  const colors = ["red", "blue", "green"];
  const strokeWidth = [3, 3, 2.5, 2];

  const [sourcesIsOpen, setSourcesIsOpen] = useState(false);

  const [clickSelectedSource, setClickSelectedSource] =
    useState<clickSelectedSourceint>({
      text: "select a source",
      click: false,
    });

  // Adds all phasers as victoryLines to an array of components
  const linesToDisplay =
    displayState === DisplayState.ShowFirstThree ? 3 : phasrLocations.length;

  for (let i = 0; i < linesToDisplay; i++) {
    components.push(
      <VictoryLine
        key={`line-${i}`}
        style={{
          labels: {
            fontSize: 4,
          },
          data: {
            stroke: colors[i % colors.length],
            strokeWidth: strokeWidth[i % 3],
          },
        }}
        domain={[-1, 1]}
        data={[
          { x: phasrLocations[i].x, y: phasrLocations[i].y },
          {
            x:
              phasrLocations[i].x +
              phasrLocations[i].magnitude * Math.cos(phasrLocations[i].angle),
            y:
              phasrLocations[i].y +
              phasrLocations[i].magnitude * Math.sin(phasrLocations[i].angle),
          },
        ]}
        labels={({ datum }) =>
          "(" +
          Math.floor(datum.x * 1000) / 1000 +
          ", " +
          Math.floor(datum.y * 1000) / 1000 +
          ")"
        }
        labelComponent={<VictoryLabel renderInPortal dy={-5} dx={-5} />}
      />
    );
  }

  return (
    <PaneWrapper $isDark={isDarkTheme(blueprintTheme)} ref={observe}>
      <Card
        style={{
          padding: "4px",
        }}
      >
        <Button minimal icon="pivot" onClick={toggleLines} />
      </Card>
      <VictoryChart
        theme={VictoryTheme.material}
        groupComponent={<CanvasGroup />}
      >
        {components}
        <VictoryPolarAxis
          style={{
            axis: { stroke: "grey" },
            grid: {
              strokeWidth: 0,
            },
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
    </PaneWrapper>
  );
};

export default SymmetricComponentPane;
