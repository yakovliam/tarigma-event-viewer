import { Classes } from "@blueprintjs/core";
import classNames from "classnames";

export const THEMES: Record<string, string> = {
  Blueprint: "mosaic-blueprint-theme",
  "Blueprint Dark": classNames("mosaic-blueprint-theme", Classes.DARK),
  None: "",
};
