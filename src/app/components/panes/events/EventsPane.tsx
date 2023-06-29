import { useRecoilState, useRecoilValue } from "recoil";
import { blueprintThemeRepository } from "../../../../utils/recoil/atoms";
import { isDarkTheme } from "../../../../types/blueprint/theme-utils";
import PaneWrapper from "../PaneWrapper";
import {
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
import { eventsStateAtom } from "../../../../utils/recoil/atoms";
import Comtrade from "../../../../types/data/comtrade/comtrade";
import { useEffect, useState } from "react";
import {
  EventControl,
  EventControls,
  EventControlsWrapper,
  EventDetailsWrapper,
  EventsListWrapper,
  EventsNavGroup,
  EventsNavWrapper,
  EventsPaneWrapper,
  EventsSettingsBar,
} from "./events-wrappers";
import useComtradeFileUpload from "../../../hooks/useComtradeFileUpload";

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

type AccordianState = {
  eventId: string;
  isOpen: boolean;
};

const EventsPane = (props: EventsPaneProps) => {
  const [eventsState, setEventsState] = useRecoilState(eventsStateAtom);
  const blueprintTheme = useRecoilValue<string>(blueprintThemeRepository);
  const [accordionState, setAccordionState] = useState<AccordianState[]>([]);

  const { openFileDialog } = useComtradeFileUpload((comtrade: Comtrade) => {
    setEventsState((oldEventsState: Comtrade[]) => {
      return [...oldEventsState, comtrade];
    });
  });

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

  const addEvent = () => {
    openFileDialog();
  };

  return (
    <PaneWrapper $isDark={isDarkTheme(blueprintTheme)}>
      <EventsPaneWrapper>
        <EventsSettingsBar>
          <Card elevation={Elevation.ONE} style={{ padding: 0, width: "100%" }}>
            <EventsNavWrapper>
              <EventsNavGroup>
                <Navbar.Heading>Manage Events</Navbar.Heading>
                <Navbar.Divider />
                <Tag>{eventsState.length} loaded</Tag>
              </EventsNavGroup>
              <EventsNavGroup>
                <Button
                  className={Classes.MINIMAL}
                  icon="add"
                  text="Add Event"
                  onClick={addEvent}
                />
              </EventsNavGroup>
            </EventsNavWrapper>
          </Card>
        </EventsSettingsBar>
        <EventsListWrapper>
          {eventsState.map((event, index) => {
            return (
              <div key={event.id}>
                <Card style={{ padding: 0 }} elevation={Elevation.ONE}>
                  <EventControlsWrapper>
                    <Text>
                      {event.config.stationName}{" "}
                      <Tag minimal round>
                        ID: {event.eventId}
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
                    <EventDetailsWrapper>
                      <Text>
                        Event ID: <Tag>{event.eventId}</Tag>
                      </Text>
                      <Text>
                        Station Name: <Tag>{event.config.stationName}</Tag>
                      </Text>
                      <Text>
                        Recording Device ID:{" "}
                        <Tag>{event.config.recordingDeviceId}</Tag>
                      </Text>
                      <Text>
                        Analog Channel Count:{" "}
                        <Tag>{event.analogChannels.length}</Tag>
                      </Text>
                      <Text>
                        Digital Channel Count:{" "}
                        <Tag>{event.digitalChannels.length}</Tag>
                      </Text>
                    </EventDetailsWrapper>
                  </Card>
                </Collapse>
              </div>
            );
          })}
        </EventsListWrapper>
      </EventsPaneWrapper>
    </PaneWrapper>
  );
};

export default EventsPane;
