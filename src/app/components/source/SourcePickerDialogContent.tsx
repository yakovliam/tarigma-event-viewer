import { useRecoilValue } from "recoil";
import { eventsStateAtom } from "../../../utils/recoil/atoms";
import { styled } from "styled-components";
import { Card, Text } from "@blueprintjs/core";
import AvailableSourcesTree from "./AvailableSourcesTree";
import { AnalogDataSource } from "../../../types/data/data-source";
import SelectedSourcesTree from "./SelectedSourcesTree";

type SourcePickerDialogContentProps = {
  selectedSources: AnalogDataSource[];
  updateSelectedSources: (sources: AnalogDataSource[]) => void;
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
          <Text>Available Sources</Text>
          <TreeWrapper>
            <AvailableSourcesTree
              selectedSources={props.selectedSources}
              events={eventsState}
              updateSelectedSources={props.updateSelectedSources}
            />
          </TreeWrapper>
        </Card>
      </SidePanelWrapper>
      <SidePanelWrapper>
        <Card style={{ padding: "10px", height: "100%", width: "100%" }}>
          <Text>Selected Sources</Text>
          <TreeWrapper>
            <SelectedSourcesTree
              selectedSources={props.selectedSources}
              events={eventsState}
              updateSelectedSources={props.updateSelectedSources}
            />
          </TreeWrapper>
        </Card>
      </SidePanelWrapper>
    </DoublePanelWrapper>
  );
};

export default SourcePickerDialogContent;
