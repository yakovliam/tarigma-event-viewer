import { useRecoilValue } from "recoil";
import { eventsState as eventsStateAtom } from "../../../utils/recoil/atoms";
import { styled } from "styled-components";
import { Card, Text } from "@blueprintjs/core";
import { AvailableSourcesTree } from "./AvailableSourcesTree";
import { SelectedSourcesTree } from "./SelectedSourcesTree"
import { useState } from "react";

type SourcePickerDialogContentProps = {
  viewId: string;
};

const DoublePanelWrapper = styled.div`
  display: flex;
  flex-direction: row;

  justify-content: space-between;
  gap: 20px;
`;

const SidePanelWrapper = styled.div`
  flex: 1;

  display: flex;
  flex-direction: column;
`;

const TreeWrapper = styled.div`
  flex: 1;

  display: flex;
  flex-direction: column;

  max-width: 300px;

  padding-top: 10px;
`;

const SourcePickerDialogContent = (props: SourcePickerDialogContentProps) => {
  const [selectedSources, setSelectedSources] = useState({})
  const eventsState = useRecoilValue(eventsStateAtom);

  return (
    <DoublePanelWrapper>
      <SidePanelWrapper>
        <Card
          style={{
            padding: "10px",
            height: "100%",
            width: "100%",
          }}
        >
          <Text>Available Sources (viewId: {props.viewId})</Text>
          <TreeWrapper>
            <AvailableSourcesTree setselected={setSelectedSources} sourcevalue={selectedSources}/>
          </TreeWrapper>
        </Card>
      </SidePanelWrapper>
      <SidePanelWrapper>
        <Card style={{ padding: "10px", height: "100%", width: "100%" }}>
          <Text>Selected Sources</Text>
          <TreeWrapper>
            <SelectedSourcesTree selectedSources={selectedSources}/>
          </TreeWrapper>
        </Card>
      </SidePanelWrapper>
    </DoublePanelWrapper>
  );
};

export default SourcePickerDialogContent;
