import { styled } from "styled-components";
import AnalogPane from "../../app/components/panes/analog/AnalogPane";
import DigitalPane from "../../app/components/panes/digital/DigitalPane";
import EventsPane from "../../app/components/panes/events/EventsPane";
import { MosaicTile } from "../../types/mosaic/tile";
import { MosaicTileType } from "../../types/mosaic/tiles";
import { v4 as uuidv4 } from "uuid";
import EmptyUnknownTileInfo from "../../app/components/empty/EmptyUnknownTileInfo";

const UnknownPaneWrapper = styled.div`
  display: flex;
  flex-direction: row;
  flex-grow: 1;
  height: 100%;
  width: 100%;
`;

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
      tileContent = <EventsPane viewId={id} />;
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
    default:
      tileContent = <EmptyUnknownTileInfo />;
      title = "Unknown Pane (type: '" + type + "')";
      break;
  }

  // create the object
  const tile: MosaicTile = {
    type: type,
    viewId: id,
    title: title,
    element: tileContent,
    dataSources: [],
  };

  return tile;
};
