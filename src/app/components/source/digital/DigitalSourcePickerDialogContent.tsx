import { useRecoilValue } from "recoil";
import { eventsStateAtom } from "../../../../utils/recoil/atoms";
import { styled } from "styled-components";
import { Card, Text } from "@blueprintjs/core";
import DigitalAvailableSourcesTree from "./DigitalAvailableSourcesTree";
import { DigitalDataSource } from "../../../../types/data/data-source";
import DigitalSelectedSourcesTree from "./DigitalSelectedSourcesTree";

type DigitalSourcePickerDialogContentProps = {
  selectedSources: DigitalDataSource[];
  updateSelectedSources: (sources: DigitalDataSource[]) => void;
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

const DigitalSourcePickerDialogContent = (
  props: DigitalSourcePickerDialogContentProps
) => {
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
            <DigitalAvailableSourcesTree
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
            <DigitalSelectedSourcesTree
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

export default DigitalSourcePickerDialogContent;
