import { DigitalDataSource } from "../../types/data/data-source";

export const useDigitalChartBoundsCalculator = (): ((
  selectedSources: DigitalDataSource[]
) => {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}) => {
  const calculateBounds = (
    selectedSources: DigitalDataSource[]
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

    const maxDY = selectedSources.length;

    return {
      minX: 0,
      maxX: maxDX,
      minY: minDY,
      maxY: maxDY + 1,
    };
  };

  return calculateBounds;
};
