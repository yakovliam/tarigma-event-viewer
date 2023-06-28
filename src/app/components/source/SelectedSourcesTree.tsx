import cloneDeep from "lodash/cloneDeep";
import * as React from "react";
import { eventsState as eventsStateAtom } from "../../../utils/recoil/atoms";
import { selectedSources as globalSelectedSources } from "../../../utils/recoil/atoms";
import {
  Classes,
  Icon,
  Tree,
  TreeNode,
  TreeNodeInfo,
  Button,
} from "@blueprintjs/core";
import { selectorFamily, useRecoilState, useRecoilValue } from "recoil";
import { isEqual } from "lodash";
import Comtrade from "../../../types/data/comtrade/comtrade";
import AnalogChannel from "../../../types/data/comtrade/channel/analog/analog-channel";
import DigitalChannel from "../../../types/data/comtrade/channel/digital/digital-channel";
import { sourcesButtonState } from "../../../types/data/sourcesTree/analog/sourceTypes";

type NodePath = number[];

type TreeAction =
  | {
      type: "SET_IS_EXPANDED";
      payload: { path: NodePath; isExpanded: boolean };
    }
  | { type: "DESELECT_ALL" }
  | {
      type: "DELETE";
      payload: { path: NodePath; isSelected: boolean };
    }
  | {
      type: "ADD_FOLDER";
      payload: { addednode: TreeNode | any };
    };

function forEachNode(
  nodes: TreeNodeInfo[] | undefined,
  callback: (node: TreeNodeInfo) => void
) {
  if (nodes === undefined) {
    return;
  }

  for (const node of nodes) {
    callback(node);
    forEachNode(node.childNodes, callback);
  }
}

function forNodeAtPath(
  nodes: TreeNodeInfo[],
  path: NodePath,
  callback: (node: TreeNodeInfo) => void
) {
  callback(Tree.nodeFromPath(path, nodes));
}

function SelectedReducer(state: TreeNodeInfo[], action: TreeAction) {
  const newState = cloneDeep(state);
  switch (action.type) {
    case "DESELECT_ALL":
      forEachNode(newState, (node) => (node.isSelected = false));
      return newState;
    case "SET_IS_EXPANDED":
      forNodeAtPath(
        newState,
        action.payload.path,
        (node) => (node.isExpanded = action.payload.isExpanded)
      );
      return newState;
    case "DELETE":
      // eslint-disable-next-line no-case-declarations
      const index: any = action.payload.path;
      newState.splice(index, 1);
      return newState;
    case "ADD_FOLDER":
      //      action.payload.addednode.secondaryLabel = <Icon icon="cross" />
      return [...newState, action.payload.addednode] as TreeNodeInfo[];
    default:
      return state;
  }
}

const treeNodesToComtradeData = (
  nodes: TreeNodeInfo[],
  comtrade: Comtrade[],
  isDigital: boolean
) => {
  if (isDigital) {
    const comtradeData = [] as DigitalChannel[];

    for (const folder of nodes as any) {
      const parent = comtrade.find((obj) => obj.id == folder.parent);
      const source = parent?.digitalChannels.find(
        (obj) => obj.info.label == folder.label
      );
      if (source) comtradeData.push(source);
    }
    return comtradeData;
  } else {
    const comtradeData = [] as AnalogChannel[];

    for (const folder of nodes as any) {
      const parent = comtrade.find((obj) => obj.id == folder.parent);
      const source = parent?.analogChannels.find(
        (obj) => obj.info.label == folder.label
      );
      if (source) comtradeData.push(source);
    }
    return comtradeData;
  }
};

export type selectedSourcesTreeProps = {
  selectedSources: TreeNodeInfo | undefined;
  buttonState: sourcesButtonState;
  isDigital: boolean;
};

export const SelectedSourcesTree = (props: selectedSourcesTreeProps) => {
  const [selectedSourcesAnalog, setSelectedSourcesAnalog] = useRecoilState(
    globalSelectedSources
  );
  const [selectedSourcesDigital, setSelectedSourcesDigital] = useRecoilState(
    globalSelectedSources
  );
  const comtrades = useRecoilValue(eventsStateAtom);
  const [nodes, dispatch] = React.useReducer(
    SelectedReducer,
    props.isDigital ? selectedSourcesDigital.tree : selectedSourcesAnalog.tree
  );

  React.useEffect(() => {
    console.log(props.buttonState.selectedSources);
  }, [props.buttonState]);

  React.useEffect(() => {
    if (
      props.selectedSources &&
      props.selectedSources.id != null &&
      props.buttonState.selectedSources.click
    ) {
      dispatch({ type: "DESELECT_ALL" });
      dispatch({
        payload: { addednode: props.selectedSources },
        type: "ADD_FOLDER",
      });
      props.buttonState.setSelectedSources({
        ...props.buttonState.selectedSources,
        click: false,
      });
    }
  }, [props.buttonState.selectedSources.click, props.selectedSources]);

  React.useEffect(() => {
    if (
      !isEqual(
        nodes,
        props.isDigital
          ? selectedSourcesDigital.tree
          : selectedSourcesAnalog.tree
      )
    ) {
      if (props.isDigital) {
        setSelectedSourcesDigital({
          tree: nodes,
          comtradeSources: treeNodesToComtradeData(
            nodes,
            comtrades,
            props.isDigital
          ),
        });
      } else {
        setSelectedSourcesAnalog({
          tree: nodes,
          comtradeSources: treeNodesToComtradeData(
            nodes,
            comtrades,
            props.isDigital
          ),
        });
      }
    }
  }, [
    comtrades,
    nodes,
    setSelectedSourcesDigital,
    setSelectedSourcesAnalog,
    props.isDigital,
  ]);

  const handleNodeClick = React.useCallback(
    (
      node: TreeNodeInfo,
      nodePath: NodePath,
      e: React.MouseEvent<HTMLElement>
    ) => {
      const originallySelected = node.isSelected;
      if (!e.shiftKey) {
        dispatch({ type: "DESELECT_ALL" });
      }
      dispatch({
        payload: {
          path: nodePath,
          isSelected: originallySelected == null ? true : !originallySelected,
        },
        type: "DELETE",
      });
    },
    []
  );

  const handleNodeCollapse = React.useCallback(
    (_node: TreeNodeInfo, nodePath: NodePath) => {
      dispatch({
        payload: { path: nodePath, isExpanded: false },
        type: "SET_IS_EXPANDED",
      });
    },
    []
  );

  const handleNodeExpand = React.useCallback(
    (_node: TreeNodeInfo, nodePath: NodePath) => {
      dispatch({
        payload: { path: nodePath, isExpanded: true },
        type: "SET_IS_EXPANDED",
      });
    },
    []
  );

  return (
    <Tree
      contents={nodes}
      onNodeClick={handleNodeClick}
      onNodeCollapse={handleNodeCollapse}
      onNodeExpand={handleNodeExpand}
      className={Classes.ELEVATION_0}
    />
  );
};
