import { VictoryThemeDefinition } from "victory";

// Strokes
const strokeLinecap = "round";
const strokeLinejoin = "round";

// Put it all together...
export const VictoryTheme = (isDark: boolean): VictoryThemeDefinition => {
  const colors = [
    "#252525",
    "#525252",
    "#737373",
    "#969696",
    "#bdbdbd",
    "#d9d9d9",
    "#f0f0f0",
  ];
  let primaryColor = "#252525";
  if (isDark) {
    primaryColor = "#f6f7f9"
    console.log("dark")
  }
  const grey = "#969696";

  const gridColor = "#c5aeae"

  // Typography
  const sansSerif = "'Gill Sans', 'Seravek', 'Trebuchet MS', sans-serif";
  const letterSpacing = "normal";
  const fontSize = 14;

  // Layout
  const baseProps = {
    width: 450,
    height: 300,
    padding: 50,
    colorScale: colors,
  };

  // Labels
  const baseLabelStyles = {
    fontFamily: sansSerif,
    fontSize,
    letterSpacing,
    padding: 10,
    fill: primaryColor,
    stroke: "transparent",
  };

  const assign = Object.assign;

  const centeredLabelStyles = assign({ textAnchor: "middle" }, baseLabelStyles);

  return {
    area: assign(
      {
        style: {
          data: {
            fill: primaryColor,
          },
          labels: baseLabelStyles,
        },
      },
      baseProps
    ),
    axis: assign(
      {
        style: {
          axis: {
            fill: "transparent",
            stroke: gridColor,
            strokeWidth: 1,
            strokeLinecap,
            strokeLinejoin,
          },
          axisLabel: assign({}, centeredLabelStyles, {
            padding: 25,
          }),
          grid: {
            fill: "none",
            stroke: gridColor,
            pointerEvents: "painted",
          },
          ticks: {
            fill: "transparent",
            size: 8,
            padding: 0,
            stroke: gridColor,
          },
          tickLabels: baseLabelStyles,
        },
      },
      baseProps
    ),
    bar: assign(
      {
        style: {
          data: {
            fill: primaryColor,
            padding: 8,
            strokeWidth: 0,
          },
          labels: baseLabelStyles,
        },
      },
      baseProps
    ),
    boxplot: assign(
      {
        style: {
          max: { padding: 8, stroke: primaryColor, strokeWidth: 1 },
          maxLabels: assign({}, baseLabelStyles, { padding: 3 }),
          median: { padding: 8, stroke: primaryColor, strokeWidth: 1 },
          medianLabels: assign({}, baseLabelStyles, { padding: 3 }),
          min: { padding: 8, stroke: primaryColor, strokeWidth: 1 },
          minLabels: assign({}, baseLabelStyles, { padding: 3 }),
          q1: { padding: 8, fill: grey },
          q1Labels: assign({}, baseLabelStyles, { padding: 3 }),
          q3: { padding: 8, fill: grey },
          q3Labels: assign({}, baseLabelStyles, { padding: 3 }),
        },
        boxWidth: 20,
      },
      baseProps
    ),
    candlestick: assign(
      {
        style: {
          data: {
            stroke: primaryColor,
            strokeWidth: 1,
          },
          labels: assign({}, baseLabelStyles, { padding: 5 }),
        },
        candleColors: {
          positive: "#ffffff",
          negative: primaryColor,
        },
      },
      baseProps
    ),
    chart: baseProps,
    errorbar: assign(
      {
        borderWidth: 8,
        style: {
          data: {
            fill: "transparent",
            stroke: primaryColor,
            strokeWidth: 2,
          },
          labels: baseLabelStyles,
        },
      },
      baseProps
    ),
    group: assign(
      {
        colorScale: colors,
      },
      baseProps
    ),
    histogram: assign(
      {
        style: {
          data: {
            fill: grey,
            stroke: primaryColor,
            strokeWidth: 2,
          },
          labels: baseLabelStyles,
        },
      },
      baseProps
    ),
    legend: {
      colorScale: colors,
      gutter: 10,
      orientation: "vertical",
      titleOrientation: "top",
      style: {
        data: {
          type: "circle",
        },
        labels: baseLabelStyles,
        title: assign({}, baseLabelStyles, { padding: 5 }),
      },
    },
    line: assign(
      {
        style: {
          data: {
            fill: "transparent",
            stroke: primaryColor,
            strokeWidth: 2,
          },
          labels: baseLabelStyles,
        },
      },
      baseProps
    ),
    pie: {
      style: {
        data: {
          padding: 10,
          stroke: "transparent",
          strokeWidth: 1,
        },
        labels: assign({}, baseLabelStyles, { padding: 20 }),
      },
      colorScale: colors,
      width: 400,
      height: 400,
      padding: 50,
    },
    scatter: assign(
      {
        style: {
          data: {
            fill: primaryColor,
            stroke: "transparent",
            strokeWidth: 0,
          },
          labels: baseLabelStyles,
        },
      },
      baseProps
    ),
    stack: assign(
      {
        colorScale: colors,
      },
      baseProps
    ),
    tooltip: {
      style: assign({}, baseLabelStyles, { padding: 0, pointerEvents: "none" }),
      flyoutStyle: {
        stroke: primaryColor,
        strokeWidth: 1,
        fill: "#f0f0f0",
        pointerEvents: "none",
      },
      flyoutPadding: 5,
      cornerRadius: 5,
      pointerLength: 10,
    },
    voronoi: assign(
      {
        style: {
          data: {
            fill: "transparent",
            stroke: "transparent",
            strokeWidth: 0,
          },
          labels: assign({}, baseLabelStyles, {
            padding: 5,
            pointerEvents: "none",
          }),
          flyout: {
            stroke: primaryColor,
            strokeWidth: 1,
            fill: "#f0f0f0",
            pointerEvents: "none",
          },
        },
      },
      baseProps
    ),
  };
};
