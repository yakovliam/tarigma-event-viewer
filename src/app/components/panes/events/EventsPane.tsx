import { useRecoilState, useRecoilValue } from "recoil";
import { blueprintThemeRepository } from "../../../../utils/recoil/atoms";
import { isDarkTheme } from "../../../../types/blueprint/theme-utils";
import PaneWrapper from "../PaneWrapper";
import {
  Alignment,
  Button,
  Card,
  Classes,
  Collapse,
  Elevation,
  Navbar,
  Tag,
  Text,
} from "@blueprintjs/core";
import { styled } from "styled-components";
import { eventsState as eventsStateAtom } from "../../../../utils/recoil/atoms";
import Comtrade from "../../../../types/data/comtrade/comtrade";
import { useEffect, useState, useRef } from "react";
import parseFileContentsToComtrade from "../../../../utils/parser/comtrade-parser";

interface EventsPaneProps {
  viewId: string;
}

const TemporaryTextWrapper = styled(Text)`
  display: flex;
  flex-direction: row;
  flex-grow: 1;
  height: 100%;
  width: 100%;
  gap: 10px;
  align-items: center;
  justify-content: center;
`;

const EventsSettingsBar = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  width: 100%;
  height: 100%;
`;

const EventsListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  width: 100%;
  height: 100%;

  overflow-y: auto;
`;

const EventControlsWrapper = styled.div`
  display: flex;
  flex-direction: row;
  flex-grow: 1;
  width: 100%;
  height: 100%;
  justify-content: space-between;
  align-items: center;

  padding: 10px;
`;

const EventControls = styled.div`
  display: flex;
  flex-direction: row;
`;

const EventControl = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

type AccordianState = {
  eventId: string;
  isOpen: boolean;
};

const EventsPane = (props: EventsPaneProps) => {
  const [eventsState, setEventsState] = useRecoilState(eventsStateAtom);
  const blueprintTheme = useRecoilValue<string>(blueprintThemeRepository);

  const [accordionState, setAccordionState] = useState<AccordianState[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setAccordionState(
      eventsState.map((eventState) => {
        return {
          eventId: eventState.id,
          isOpen: false,
        };
      })
    );
  }, [eventsState]);

  const getFileExtension = (filename: string): string =>
    filename.substring(filename.lastIndexOf(".") + 1, filename.length) ||
    filename;

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log("handleFileInput called");
    const files = event.target.files;
    if (files) {
      addEvent(files);
    }
  };

  const addEvent = (files: FileList) => {
    console.log("add event");

    let configContents = "";
    let headerContents = "";
    let dataContents = "";

    Array.from(files).forEach((file) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const fileContent = e.target?.result;
        console.log(getFileExtension(file.name));
        if (typeof fileContent === "string") {
          switch (getFileExtension(file.name)) {
            case "cfg":
              configContents = fileContent;
              break;
            case "dat":
              dataContents = fileContent;
              break;
            case "hdr":
              headerContents = fileContent;
              break;
            default:
              break;
          }
        }

        if (configContents !== "" && dataContents !== "") {
          const eventId = eventsState.length + 1;

          // Call parseFileContentsToComtrade to get a new Comtrade object
          const newEvent = parseFileContentsToComtrade(
            configContents,
            headerContents,
            dataContents,
            eventId
          );

          console.log(newEvent);

          setEventsState((oldEventsState) => [...oldEventsState, newEvent]);
        }
      };

      reader.readAsText(file);
    });
  };

  return (
    <PaneWrapper $isDark={isDarkTheme(blueprintTheme)}>
      <EventsSettingsBar>
        <Navbar>
          <Navbar.Group align={Alignment.LEFT}>
            <Navbar.Heading>Manage Events</Navbar.Heading>
            <Navbar.Divider />
            <Tag>{eventsState.length} loaded</Tag>
          </Navbar.Group>
          <Navbar.Group align={Alignment.RIGHT}>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInput}
              style={{ display: "none" }}
              multiple
              accept=".cfg, .dat, .hdr, .inf"
            />
            <Button
              className={Classes.MINIMAL}
              icon="add"
              text="Add Event"
              onClick={() => fileInputRef.current?.click()}
            />
          </Navbar.Group>
        </Navbar>
        <EventsListWrapper>
          {eventsState.map((event, index) => {
            return (
              <div>
                <Card style={{ padding: 0 }}>
                  <EventControlsWrapper>
                    <Text>
                      Event{" "}
                      <Tag minimal round>
                        {event.eventId}
                      </Tag>
                    </Text>
                    <EventControls>
                      <EventControl>
                        <Button
                          minimal
                          icon="remove"
                          onClick={() => {
                            setEventsState((oldEventsState) => {
                              return oldEventsState.filter(
                                (eventState) => eventState.id !== event.id
                              );
                            });
                          }}
                        />
                      </EventControl>
                      <EventControl>
                        <Button
                          minimal
                          rightIcon={
                            accordionState[index]?.isOpen
                              ? "caret-up"
                              : "caret-down"
                          }
                          onClick={() => {
                            setAccordionState((oldAccordionState) => {
                              return oldAccordionState.map((accordionState) => {
                                if (accordionState.eventId === event.id) {
                                  return {
                                    ...accordionState,
                                    isOpen: !accordionState.isOpen,
                                  };
                                } else {
                                  return accordionState;
                                }
                              });
                            });
                          }}
                        />
                      </EventControl>
                    </EventControls>
                  </EventControlsWrapper>
                </Card>
                <Collapse isOpen={accordionState[index]?.isOpen}>
                  <Card>
                    <Tag minimal round large>
                      {event.config.stationName} {event.config.revisionYear}
                      <br />
                      Analog Channels:{" "}
                      {event.config.channelsInfo.analogChannels}
                      <br />
                      Digital Channels:{" "}
                      {event.config.channelsInfo.digitalChannels}
                    </Tag>
                  </Card>
                </Collapse>
              </div>
            );
          })}
        </EventsListWrapper>
      </EventsSettingsBar>
    </PaneWrapper>
  );
};

export default EventsPane;
