import AnalogPane from "../../app/components/panes/analog/AnalogPane";
import DigitalPane from "../../app/components/panes/digital/DigitalPane";
import EventsPane from "../../app/components/panes/events/EventsPane";
import SymmetricComponentPane from "../../app/components/panes/symmetric-components/SymmetricComponentPane";
import { MosaicTile } from "../types/mosaic/tile";
import { MosaicTileType } from "../types/mosaic/tiles";
import { v4 as uuidv4 } from "uuid";

export const createInstance = (
  type: MosaicTileType,
  viewId?: string
): MosaicTile => {
  // create a new id
  const id = viewId || uuidv4();

  let tileContent: JSX.Element | undefined;

  switch (type) {
    case "events":
      tileContent = <EventsPane viewId={id} />;
      break;
    case "analog":
      tileContent = <AnalogPane viewId={id} />;
      break;
    case "digital":
      tileContent = <DigitalPane viewId={id} />;
      break;
    case "symmetric-components":
      tileContent = <SymmetricComponentPane viewId={id} />;
      break;
    default:
      tileContent = <div>Unknown tile type</div>;
      break;
  }

  // create the object
  const tile: MosaicTile = {
    type: type,
    viewId: id,
    title: type.charAt(0).toUpperCase() + type.slice(1) + ": " + id.slice(0, 3),
    element: tileContent,
  };

  return tile;
};
