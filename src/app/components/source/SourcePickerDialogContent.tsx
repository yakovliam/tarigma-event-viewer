import { useRecoilValue } from "recoil";
import { eventsState as eventsStateAtom } from "../../../utils/recoil/atoms";
import { styled } from "styled-components";
import { Card, Text, Tree, TreeNodeInfo } from "@blueprintjs/core";
import { AvailableSourcesTree } from "./AvailableSourcesTree";
import { SelectedSourcesTree } from "./SelectedSourcesTree";
import { useEffect, useState } from "react";
import {
  sourcesButtonState,
  selectedSourceState,
} from "../../../types/data/sourcesTree/analog/sourceTypes";

type SourcePickerDialogContentProps = {
  viewId: string;
  sourcesButton: sourcesButtonState;
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
  const [selectedSources, setSelectedSources] = useState<TreeNodeInfo[]>();

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
            <AvailableSourcesTree
              selectedSourceState={{
                selectedSources: selectedSources,
                setSelectedSources: setSelectedSources,
              }}

              buttonState={props.sourcesButton}
            />
          </TreeWrapper>
        </Card>
      </SidePanelWrapper>
      <SidePanelWrapper>
        <Card style={{ padding: "10px", height: "100%", width: "100%" }}>
          <Text>Selected Sources</Text>
          <TreeWrapper>
            <SelectedSourcesTree selectedSources={selectedSources} buttonState={props.sourcesButton}/>
          </TreeWrapper>
        </Card>
      </SidePanelWrapper>
    </DoublePanelWrapper>
  );
};

export default SourcePickerDialogContent;
