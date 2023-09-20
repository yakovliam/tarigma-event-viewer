type AnalogInfo = {
  label: string;
  max: number;
  min: number;
  multiplier: number;
  offset: number;
  primaryFactor: number;
  primarySecondaryIdentifier: string;
  secondaryFactor: number;
  skew: number;
  units: string;
};

type AnalogValue = {
  timestamp: number;
  value: number;
};

type DigitalInfo = {
  idx: number;
  normal: number;
  label: string;
};

type DigitalValue = {
  timestamp: number;
  value: number;
};

export const computeVectors = (
  cursorPosition: number,
  analogDataSources: { channel: { info: AnalogInfo; values: AnalogValue[] } }[],
  digitalDataSources: { channel: { info: DigitalInfo; values: DigitalValue[] } }[]
) => {
  // Helper function to interpolate value
  const interpolateValue = (timestamp: number, data: AnalogValue[]) => {
    for (let i = 0; i < data.length - 1; i++) {
      if (timestamp >= data[i].timestamp && timestamp <= data[i + 1].timestamp) {
        const proportion = (timestamp - data[i].timestamp) / (data[i + 1].timestamp - data[i].timestamp);
        return data[i].value + proportion * (data[i + 1].value - data[i].value);
      }
    }
    return null;
  };

  const analogVectors = analogDataSources.map(source => {
    const value = interpolateValue(cursorPosition, source.channel.values);
    // Use this value to compute magnitude and angle (phase) if needed.
    // For this example, we'll return the interpolated value as magnitude and set phase to 0.
    // Further computation can be done based on signal properties.
    return {
      magnitude: value,
      angle: 0
    };
  });

  const digitalVectors = digitalDataSources.map(source => {
    const value = interpolateValue(cursorPosition, source.channel.values);
    return {
      value: value
    };
  });

  return {
    analogVectors,
    digitalVectors
  };
};

// Example usage:
// const { analogVectors, digitalVectors } = computeVectors(cursorPosition, analogDataSources, digitalDataSources);