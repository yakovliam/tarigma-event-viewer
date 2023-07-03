/* eslint-disable no-case-declarations */
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
import _ from "lodash";
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
      type: "ADD_FOLDER";
      payload: { addednode: TreeNode | any };
    }
  | {
      type: "DELETE_NODE";
      payload: { addednode: TreeNodeInfo };
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

const treeNodesToComtradeData = (
  nodes: TreeNodeInfo[],
  comtrade: Comtrade[]
) => {
  const comtradeData = [] as AnalogChannel[];

  for (const folder of nodes as any) {
    console.log(folder);
    const parent = comtrade.find((obj) => obj.id == folder.parent);
    const source = parent?.analogChannels.find(
      (obj) => obj.info.label == folder.label
    );
    //to handle undefined
    if (source) comtradeData.push(source);
  }

  return comtradeData;
};

export type selectedSourcesTreeProps = {
  selectedSources: TreeNodeInfo[] | undefined;
  buttonState: sourcesButtonState;
};

export const SelectedSourcesTree = (props: selectedSourcesTreeProps) => {
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
      case "SET_IS_SELECTED":
        props.buttonState.setSelectedSources({
          ...props.buttonState.selectedSources,
          text: "click to remove this source",
        });
        forNodeAtPath(
          newState,
          action.payload.path,
          (node) => (node.isSelected = action.payload.isSelected)
        );
        return newState;
      case "DELETE_NODE":
        const sel = action.payload.addednode;

        const deletedState = newState.filter(
          (source) => source.label != sel.label
        );
        console.log(deletedState);
        props.buttonState.setSelectedSources({
          text: "select a source",
          click: !props.buttonState.selectedSources.click,
        });

        return deletedState;
      case "ADD_FOLDER":
        //      action.payload.addednode.secondaryLabel = <Icon icon="cross" />
        return [...newState, action.payload.addednode] as TreeNodeInfo[];
      default:
        return state;
    }
  }

  const [selectedSources, setSelectedSources] = useRecoilState(
    globalSelectedSources
  );
  const comtrades = useRecoilValue(eventsStateAtom);
  const [nodes, dispatch] = React.useReducer(
    SelectedReducer,
    selectedSources.tree
  );

  React.useEffect(() => {
    if (props.selectedSources)
      for (const source of props.selectedSources) {
        if (source.id != null && props.buttonState.selectedSources.click) {
          dispatch({ type: "DESELECT_ALL" });
          source.isSelected = false;
          dispatch({
            payload: { addednode: source },
            type: "ADD_FOLDER",
          });
          props.buttonState.setSelectedSources({
            ...props.buttonState.selectedSources,
            click: false,
          });
        }
      }
  }, [
    props.buttonState,
    props.buttonState.selectedSources.click,
    props.selectedSources,
  ]);

  React.useEffect(() => {
    // omit the selected prop to prevent treeNodesToComtradeData and other expensive functions from running
    const sanitizedNode = _.map(nodes, _.partial(_.omit, _, "isSelected"));
    const sanitizedTree = _.map(
      selectedSources.tree,
      _.partial(_.omit, _, "isSelected")
    );

    if (!isEqual(sanitizedNode, sanitizedTree)) {
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
      dispatch({
        payload: {
          path: nodePath,
          isSelected: originallySelected == null ? true : !originallySelected,
        },
        type: "SET_IS_SELECTED",
      });
    },
    []
  );

  React.useEffect(() => {
    const selectedNodes = nodes.filter((node) => node.isSelected == true);
    console.log(selectedNodes);

    if (props.buttonState.selectedSources.click) {
      for (const node of selectedNodes) {
        dispatch({
          payload: { addednode: node },
          type: "DELETE_NODE",
        });
      }

      console.log(selectedNodes);
    }
  }, [nodes, props.buttonState.selectedSources.click]);

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
