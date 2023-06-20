import cloneDeep from "lodash/cloneDeep";
import * as React from "react";
import { eventsState as eventsStateAtom } from "../../../utils/recoil/atoms";
import { selectedSources as globalSelectedSources } from "../../../utils/recoil/atoms";
import { Classes, Tree, TreeNode, TreeNodeInfo } from "@blueprintjs/core";
import { selectorFamily, useRecoilState, useRecoilValue } from "recoil";
import { isEqual } from "lodash";
import Comtrade from "../../../types/data/comtrade/comtrade";
import { defualtsource } from "./defsource"

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
      return [...newState, action.payload.addednode] as TreeNodeInfo[];
    default:
      return state;
  }
}

const treeNodesToComtradeData = (
  nodes: TreeNodeInfo[],
  comtrade: Comtrade[]
) => {
  const comtradeData = { analog: [] as any, digital: [] as any };
  const iterate = (obj: any) => {
    if (obj.childNodes) {
      for (const child of obj.childNodes) {
        iterate(child);
      }
    } else {
      if (obj.type == "analog") {
        const analogComtradeEvent = comtrade
          .find((event) => {
            return event.id === obj.parent;
          })
          ?.analogChannels.find((analog) => {
            return analog.info.label === obj.label;
          });

        if (analogComtradeEvent) comtradeData.analog.push(analogComtradeEvent);
      } else {
        const digitalComtradeEvent = comtrade
          .find((event) => {
            return event.id === obj.parent;
          })
          ?.digitalChannels.find((digital) => {
            return digital.info.label === obj.label;
          });

        if (digitalComtradeEvent) comtradeData.digital.push(digitalComtradeEvent);
      }
    }
  };

  for (const folder of nodes) {
    iterate(folder);
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

  // EXAMPLE DATA
  if(!process.env.NODE_ENV || process.env.NODE_ENV === 'development')
  setSelectedSources(defualtsource as any)

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
    console.log(selectedSources)
  }, [nodes, selectedSources]);

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
