import cloneDeep from "lodash/cloneDeep";
import * as React from "react";
import { eventsState as eventsStateAtom } from "../../../utils/recoil/atoms";
import { Classes, Icon, Tree, TreeNode, TreeNodeInfo } from "@blueprintjs/core";
import { useRecoilValue } from "recoil";
import Comtrade from "../../../types/data/comtrade/comtrade";
import AnalogChannel from "../../../types/data/comtrade/channel/analog/analog-channel";
import {
  selectedSourceState,
  sourcesButtonState,
} from "../../../types/data/sourcesTree/analog/sourceTypes";
import { useStateCallback } from "../../../utils/helpers/useStateCallback";

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

interface stricterChildNodes {
  id: number;
  icon: string;
  label: string;
  parent: string;
}

// This was an attempt to force childnodes to not be possibly typed as undefined,
// I failed so I ended up using some conditionals later to check if this prop exists
interface StricterTreeNodeInfo<T> extends TreeNodeInfo {
  childNodes: Array<TreeNodeInfo<any>>;
}

const analogComtradeToTree = (eventsState: Comtrade[]): TreeNodeInfo[] => {
  const tree: TreeNodeInfo[] = [];

  for (const comtrade of eventsState) {
    const folder: StricterTreeNodeInfo<stricterChildNodes> = {
      id: comtrade.eventId,
      icon: "folder-close",
      isExpanded: false,
      label: `${comtrade.eventId + ": " + comtrade.config.stationName}`,
      childNodes: [],
    };

    if (comtrade.analogChannels != null) {
      const analogChannels = comtrade.analogChannels;

      for (let i = 0; i < analogChannels.length; i++) {
        folder.childNodes.push({
          id: i,
          icon: "pulse",
          label: `${analogChannels[i].info.label}`,
          type: "analog",
          parent: comtrade.id,
          secondaryLabel: <Icon icon="add-to-artifact" />,
        } as unknown as StricterTreeNodeInfo<stricterChildNodes>);
      }
    }

    tree.push(folder);
  }

  return tree;
};

export type availableSourcesTreeProps = {
  selectedSourceState: selectedSourceState;
  buttonState: sourcesButtonState;
};

export const AvailableSourcesTree = (props: availableSourcesTreeProps) => {
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
        props.buttonState.setSelectedSources({
          ...props.buttonState.selectedSources,
          text: "click to add this source",
        });
        return newState;
      case "COMTRADE_ADDED":
        return action.payload.tree;
      default:
        return state;
    }
  }

  const eventsState = useRecoilValue(eventsStateAtom);
  const [nodes, dispatch] = React.useReducer(
    AvailableReducer,
    [] as TreeNodeInfo[]
  );

  React.useEffect(() => {
    dispatch({
      type: "COMTRADE_ADDED",
      payload: { tree: analogComtradeToTree(eventsState) },
    });
  }, [eventsState]);

  const [clickedSources, setClickedSources] = useStateCallback<TreeNodeInfo[]>(
    []
  );

  const handleNodeClick = React.useCallback(
    (
      node: TreeNodeInfo,
      nodePath: NodePath,
      e: React.MouseEvent<HTMLElement>
    ) => {
      const originallySelected = node.isSelected;

      dispatch({
        payload: {
          path: nodePath,
          isSelected: originallySelected == null ? true : !originallySelected,
        },
        type: "SET_IS_SELECTED",
      });

      setClickedSources([...clickedSources, node], (e) =>
        props.selectedSourceState.setSelectedSources(e)
      );
    },
    [clickedSources, props.selectedSourceState]
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
