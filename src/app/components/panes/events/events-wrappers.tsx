import styled from "styled-components";
import EventsPane from './EventsPane';

export const EventsNavWrapper = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  padding: 8px;
  justify-content: space-between;
`;

export const EventsNavGroup = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

export const EventsSettingsBar = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

export const EventsListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;

  overflow: scroll;
`;

export const EventControlsWrapper = styled.div`
  display: flex;
  flex-direction: row;
  flex-grow: 1;
  width: 100%;
  height: 100%;
  justify-content: space-between;
  align-items: center;

  padding: 10px;
`;

export const EventControls = styled.div`
  display: flex;
  flex-direction: row;
`;

export const EventControl = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const EventDetailsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const EventsPaneWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  height: 100%;
  width: 100%;
`;