import cloneDeep from "lodash/cloneDeep";
import * as React from "react";

import { Classes, Tree, TreeNodeInfo } from "@blueprintjs/core";
import Comtrade from "../../../../types/data/comtrade/comtrade";
import { useEffect } from "react";
import { DigitalDataSource } from "../../../../types/data/data-source";

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
  | { type: "RE_INITIALIZE"; payload: TreeNodeInfo[] };

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

function treeExampleReducer(state: TreeNodeInfo[], action: TreeAction) {
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
    case "RE_INITIALIZE":
      return action.payload;
    default:
      return state;
  }
}

export type DigitalSelectedSourcesTreeProps = {
  selectedSources: DigitalDataSource[];
  events: Comtrade[];
  updateSelectedSources: (sources: DigitalDataSource[]) => void;
};

type DigitalDataSourceNodeData = {
  eventId: string;
  name: string;
};

export const DigitalSelectedSourcesTree = ({
  selectedSources,
  events,
  updateSelectedSources,
}: DigitalSelectedSourcesTreeProps) => {
  const [nodes, dispatch] = React.useReducer(treeExampleReducer, INITIAL_STATE);

  const handleNodeClick = React.useCallback(
    (node: TreeNodeInfo) => {
      // get the node data
      const nodeData: DigitalDataSourceNodeData | undefined =
        node.nodeData as DigitalDataSourceNodeData;

      if (nodeData === undefined) {
        return;
      }

      // get the data source associated with the node
      const event = events.find((event) => event.id === nodeData.eventId);

      if (event === undefined) {
        return;
      }

      const source = event.digitalDataSources.find(
        (source) => source.channel.info.label === nodeData.name
      );

      if (source === undefined) {
        return;
      }

      // remove the source from the selected sources
      const newSelectedSources = selectedSources.filter(
        (selectedSource) =>
          selectedSource.channel.info.label !== source.channel.info.label
      );

      updateSelectedSources(newSelectedSources);
    },
    [events, selectedSources, updateSelectedSources]
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

  useEffect(() => {
    const treeNodes: TreeNodeInfo[] = [];

    // find all unique events that are present in the selected sources
    const selectedEvents: Comtrade[] = [];
    selectedSources.forEach((source) => {
      const comtradeId = source.comtradeId;
      const comtrade = events.find((event) => event.id === comtradeId);
      if (
        selectedEvents.find((event) => event.id === comtradeId) === undefined &&
        comtrade !== undefined
      ) {
        selectedEvents.push(comtrade);
      }
    });

    // create a tree node for each event
    selectedEvents.forEach((event) => {
      const eventIsExpanded = nodes.some(
        (node) => node.id === event.id && node.isExpanded
      );
      const eventNode: TreeNodeInfo = {
        id: event.id,
        hasCaret: true,
        icon: "folder-close",
        label: event.config.stationName,
        isExpanded: eventIsExpanded,
      };

      // get all sources that are part of this event that are selected
      const applicableSourcesToEvent = selectedSources.filter(
        (source) => source.comtradeId === event.id
      );
      // create a tree node for each source
      const sourceNodes: TreeNodeInfo[] = applicableSourcesToEvent.map(
        (source) => {
          const sourceNode: TreeNodeInfo = {
            id: source.channel.info.label,
            icon: "pulse",
            label: source.name,
            nodeData: {
              eventId: event.id,
              name: source.channel.info.label,
            } as DigitalDataSourceNodeData,
          };
          return sourceNode;
        }
      );

      // add the source nodes to the event node
      eventNode.childNodes = sourceNodes;

      // add the event node to the tree
      treeNodes.push(eventNode);
    });

    dispatch({ type: "RE_INITIALIZE", payload: treeNodes });
  }, [events, selectedSources]);

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
const INITIAL_STATE: TreeNodeInfo[] = [];

export default DigitalSelectedSourcesTree;
