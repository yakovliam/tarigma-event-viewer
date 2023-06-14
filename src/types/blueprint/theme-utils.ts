import { Classes } from "@blueprintjs/core";
import { BlueprintTheme } from "./theme";

const blueprintThemeClassName = (theme: BlueprintTheme): string => {
  switch (theme) {
    case "Blueprint":
      return "";
    case "Blueprint Dark":
      return Classes.DARK;
    default:
      return "";
  }
};

const isDarkTheme = (theme: BlueprintTheme): boolean => {
  switch (theme) {
    case "Blueprint":
      return false;
    case "Blueprint Dark":
      return true;
    default:
      return false;
  }
};

export { blueprintThemeClassName, isDarkTheme };
