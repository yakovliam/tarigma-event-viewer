import { AnalogDataSource } from "../../types/data/data-source";

export const useAnalogChartBoundsCalculator = (): ((
  selectedSources: AnalogDataSource[]
) => {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}) => {
  const calculateBounds = (
    selectedSources: AnalogDataSource[]
  ): {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  } => {
    const maxDX = Math.max(
      ...selectedSources.flatMap((source) => {
        return source.channel.values.map((value) => {
          return value.timestamp;
        });
      })
    );

    const minDY = Math.min(
      ...selectedSources.flatMap((source) => {
        return source.channel.values.map((value) => {
          return value.value as number;
        });
      })
    );

    const maxDY = Math.max(
      ...selectedSources.flatMap((source) => {
        return source.channel.values.map((value) => {
          return value.value as number;
        });
      })
    );

    return {
      minX: 0,
      maxX: maxDX,
      minY: minDY,
      maxY: maxDY,
    };
  };

  return calculateBounds;
};
