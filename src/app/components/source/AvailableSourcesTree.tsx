import cloneDeep from "lodash/cloneDeep";
import * as React from "react";
import { eventsState as eventsStateAtom } from "../../../utils/recoil/atoms";
import { Classes, Tree, TreeNode, TreeNodeInfo } from "@blueprintjs/core";
import { useRecoilValue } from "recoil";
import Comtrade from "../../../types/data/comtrade/comtrade";
import AnalogChannel from "../../../types/data/comtrade/channel/analog/analog-channel";

type NodePath = number[];

type TreeAction =
  | {
      type: "SET_IS_EXPANDED";
      payload: { path: NodePath; isExpanded: boolean };
    }
  | { type: "DESELECT_ALL" }
  | {
      type: "SET_IS_SELECTED";
      payload: { path: NodePath; isSelected: boolean };
    }
  | {
      type: "COMTRADE_ADDED";
      payload: { tree: TreeNodeInfo[] };
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

function AvailableReducer(state: TreeNodeInfo[], action: TreeAction) {
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
    case "SET_IS_SELECTED":
      forNodeAtPath(
        newState,
        action.payload.path,
        (node) => (node.isSelected = action.payload.isSelected)
      );
      return newState;
    case "COMTRADE_ADDED":
      return action.payload.tree;
    default:
      return state;
  }
}

interface StricterTreeNodeInfo extends TreeNodeInfo {
  childNodes: Array<TreeNodeInfo<{ id: number; icon: string; label: string }>>;
}

const comtradeToTree = (eventsState: Comtrade[]): TreeNodeInfo[] => {
  const tree: TreeNodeInfo[] = [];

  for (const comtrade of eventsState) {
    const folder: StricterTreeNodeInfo = {
      id: comtrade.eventId,
      icon: "folder-close",
      isExpanded: false,
      label: `${comtrade.config.stationName}`,
      childNodes: [],
    };

    const analogChannels = comtrade.analogChannels;
    for (let i = 0; i < analogChannels.length; i++) {
      folder.childNodes.push({
        id: i,
        icon: "pulse",
        label: `${analogChannels[i].info.label}`,
      });
    }
    tree.push(folder);
  }

  return tree;
};

export const AvailableSourcesTree = (props: any) => {
  const eventsState = useRecoilValue(eventsStateAtom);
  const [nodes, dispatch] = React.useReducer(
    AvailableReducer,
    [] as TreeNodeInfo[]
  );

  React.useEffect(() => {
    dispatch({
      type: "COMTRADE_ADDED",
      payload: { tree: comtradeToTree(eventsState) },
    });
  }, [eventsState]);

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
        type: "SET_IS_SELECTED",
      });
      props.setselected(node);
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

/* tslint:disable:object-literal-sort-keys so childNodes can come last */
const INITIAL_AVAIABLE_STATE: TreeNodeInfo[] = [
  {
    id: 0,
    hasCaret: true,
    icon: "folder-close",
    label: "Event #1",
  },
  {
    id: 1,
    icon: "folder-close",
    isExpanded: false,
    label: "Event #2",
    childNodes: [
      {
        id: 2,
        icon: "pulse",
        label: "Analog Source #1",
      },
    ],
  },
  {
    id: 2,
    hasCaret: true,
    icon: "folder-close",
    label: "Super secret files",
    disabled: true,
  },
  {
    id: 3,
    icon: "folder-close",
    isExpanded: false,
    label: "Event #3",
    childNodes: [
      {
        id: 4,
        icon: "pulse",
        label: "Analog Source #2",
      },
    ],
  },
];

export default AvailableSourcesTree;
