import AnalogPane from "../../app/components/panes/analog/AnalogPane";
import DigitalPane from "../../app/components/panes/digital/DigitalPane";
import EventsPane from "../../app/components/panes/events/EventsPane";
import { MosaicTile } from "../../types/mosaic/tile";
import { MosaicTileType } from "../../types/mosaic/tiles";
import { v4 as uuidv4 } from "uuid";
import EmptyUnknownTileInfo from "../../app/components/empty/EmptyUnknownTileInfo";
import SymmetricComponentPane from "../../app/components/panes/symmetric-components/SymmetricComponentPane";

export const createInstance = (
  type: MosaicTileType,
  viewId?: string
): MosaicTile => {
  // create a new id
  const id = viewId || uuidv4();

  let tileContent: JSX.Element | undefined;
  let title;

  switch (type) {
    case "events":
      tileContent = <EventsPane />;
      title = "Events Pane";
      break;
    case "analog":
      tileContent = <AnalogPane viewId={id} />;
      title = "Analog Pane";
      break;
    case "digital":
      tileContent = <DigitalPane viewId={id} />;
      title = "Digital Pane";
      break;
    case "symmetric-components":
      tileContent = <SymmetricComponentPane />;
      title = "Symmetric Components";
      break;
    default:
      tileContent = <EmptyUnknownTileInfo />;
      title = "Unknown Pane (type: '" + type + "')";
      break;
  }

  // create the object
  const tile: MosaicTile = {
    type: type,
    viewId: id,
    title: title, //    title: type.charAt(0).toUpperCase() + type.slice(1) + ": " + id.slice(0, 3),
    element: tileContent,
    dataSources: [],
  };

  return tile;
};
