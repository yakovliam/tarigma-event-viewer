import cloneDeep from "lodash/cloneDeep";
import * as React from "react";
import { selectedSources as globalSelectedSources } from "../../../utils/recoil/atoms"
import { Classes, Tree, TreeNode, TreeNodeInfo } from "@blueprintjs/core";
import { selectorFamily, useRecoilState } from "recoil";

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
      console.log(newState)
      console.log(action.payload.path)
      // eslint-disable-next-line no-case-declarations
      const index:any = action.payload.path
      newState.splice(index, 1)
      return newState
    case "ADD_FOLDER":
      // console.log(action.payload.addednode);
      if(action.payload.addednode.childNodes != null){
      return [...newState, action.payload.addednode] as TreeNodeInfo[]
      }
      else {
        return newState
      }
    default:
      return state;
  }
}

export const SelectedSourcesTree = (props: any) => {
  const [selectedSources, setSelectedSources] = useRecoilState(globalSelectedSources)
  const [nodes, dispatch] = React.useReducer(
    SelectedReducer,
    selectedSources
  );

  React.useEffect(() => {
    if (props.selectedSources.id != null) {
      // console.log(props.selectedSources);
      dispatch({ type: "DESELECT_ALL" });
      dispatch({
        payload: { addednode: props.selectedSources },
        type: "ADD_FOLDER",
      });
    }
  }, [props.selectedSources]);

  React.useEffect(() => {
    console.log("nodeschanged", nodes)
    setSelectedSources(nodes)
    console.log(selectedSources)
  }, [nodes])

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
