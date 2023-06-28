import cloneDeep from "lodash/cloneDeep";
import * as React from "react";
import { eventsState as eventsStateAtom } from "../../../utils/recoil/atoms";
import { selectedSources as globalSelectedSources } from "../../../utils/recoil/atoms";
import { Classes, Icon, Tree, TreeNode, TreeNodeInfo } from "@blueprintjs/core";
import { selectorFamily, useRecoilState, useRecoilValue } from "recoil";
import { isEqual } from "lodash";
import Comtrade from "../../../types/data/comtrade/comtrade";
import AnalogChannel from "../../../types/data/comtrade/channel/analog/analog-channel";
import DigitalChannel from "../../../types/data/comtrade/channel/digital/digital-channel";

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
  comtrade: Comtrade[]
) => {
  const comtradeData = [] as AnalogChannel[];

  for (const folder of nodes as any) {
    console.log(folder)
    const parent = comtrade.find(obj => obj.id == folder.parent)
    const source = parent?.analogChannels.find(obj => obj.info.label == folder.label)
    //to handle undefined
    if(source)
    comtradeData.push(source)
  }

  return comtradeData;
};

export const SelectedSourcesTree = (props: any) => {
  const [selectedSources, setSelectedSources] = useRecoilState(
    globalSelectedSources
  );
  const comtrades = useRecoilValue(eventsStateAtom);
  const [nodes, dispatch] = React.useReducer(
    SelectedReducer,
    selectedSources.tree
  );

  React.useEffect(() => {
    if (props.selectedSources.id != null) {
      dispatch({ type: "DESELECT_ALL" });
      dispatch({
        payload: { addednode: props.selectedSources },
        type: "ADD_FOLDER",
      });
    }
  }, [props.selectedSources]);

  React.useEffect(() => {
    if (!isEqual(nodes, selectedSources.tree)) {
      setSelectedSources({
        tree: nodes,
        comtradeSources: treeNodesToComtradeData(nodes, comtrades),
      });
    }
  }, [comtrades, nodes, selectedSources, setSelectedSources]);

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
