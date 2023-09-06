import { useRecoilValue } from "recoil";
import { blueprintThemeRepository } from "../../../../utils/recoil/atoms";
import { isDarkTheme } from "../../../../types/blueprint/theme-utils";
import PaneWrapper from "../PaneWrapper";
import { useState } from "react";
import useDimensions from "react-cool-dimensions";
import {
  CanvasGroup,
  VictoryChart,
  VictoryLine,
  VictoryPolarAxis,
  VictoryTheme,
} from "victory";
import { Button } from "@blueprintjs/core";

type PhaserType = "positive" | "negative" | "zero";

// Array holding input phaser diagram details
const phaserDiagram = [
  { angle: (1 * Math.PI) / 3, magnitude: 1 },
  { angle: (2 * Math.PI) / 3, magnitude: 1 },
  { angle: (4 * Math.PI) / 3, magnitude: 1 },
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
const phasrLocations = [
  { angle: phaserDiagram[0].angle, magnitude: phaserDiagram[0].magnitude }, // IA
  { angle: phaserDiagram[1].angle, magnitude: phaserDiagram[1].magnitude }, // IB
  { angle: phaserDiagram[2].angle, magnitude: phaserDiagram[2].magnitude }, // IC
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

const SymmetricComponentPane = () => {
  const [showOnlyFirstThree, setShowOnlyFirstThree] = useState(false);

  const toggleLines = () => {
    setShowOnlyFirstThree(!showOnlyFirstThree);
  };

  //console.log(props.viewId);
  const blueprintTheme = useRecoilValue<string>(blueprintThemeRepository);

  const { observe } = useDimensions();

  let components = [];

  const colors = ["red", "blue", "green"];
  const strokeWidth = [4, 3, 2.5, 2];

  // Adds all phasers as victoryLines to an array of components
  for (let i = 0; i < (showOnlyFirstThree ? 3 : phasrLocations.length); i++) {
    components.push(
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
              Math.cos(phasrLocations[i].angle / 1),
            y:
              phasrLocations[i].magnitude *
              Math.sin(phasrLocations[i].angle / 1),
          },
        ]}
      />
    );
  }

  return (
    <PaneWrapper $isDark={isDarkTheme(blueprintTheme)} ref={observe}>
      <Button onClick={toggleLines}>
        {showOnlyFirstThree ? "Show All Lines" : "Show First Three Lines"}
      </Button>
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
