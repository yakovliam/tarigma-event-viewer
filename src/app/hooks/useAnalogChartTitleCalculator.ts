import { AnalogDataSource } from "../../types/data/data-source";

const useAnalogChartTitleCalculator = () => {
  const calculateTitle = (selectedSources: AnalogDataSource[]): string => {
    // if all of the data channel units are the same, then use that
    // but, if they aren't the same (different units like Amps & kVolts), then make it blank
    let sameUnit = "";

    const allEqualUnits = selectedSources.every((source) => {
      const { info } = source.channel;

      if (info === undefined) {
        return false;
      }

      if (sameUnit === info.units || sameUnit === "") {
        sameUnit = info.units;
        return true;
      }

      return false;
    });

    return allEqualUnits ? sameUnit : "";
  };

  return calculateTitle;
};

export default useAnalogChartTitleCalculator;
