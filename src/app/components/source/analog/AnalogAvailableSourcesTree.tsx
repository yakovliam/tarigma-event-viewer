import cloneDeep from "lodash/cloneDeep";
import * as React from "react";

import { Classes, Tree, TreeNodeInfo } from "@blueprintjs/core";
import { AnalogDataSource } from "../../../../types/data/data-source";
import Comtrade from "../../../../types/data/comtrade/comtrade";
import { useEffect } from "react";

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

export type AnalogAvailableSourcesTreeProps = {
  selectedSources: AnalogDataSource[];
  events: Comtrade[];
  updateSelectedSources: (sources: AnalogDataSource[]) => void;
};

type AnalogDataSourceNodeData = {
  eventId: string;
  name: string;
};

export const AnalogAvailableSourcesTree = ({
  selectedSources,
  events,
  updateSelectedSources,
}: AnalogAvailableSourcesTreeProps) => {
  const [nodes, dispatch] = React.useReducer(treeExampleReducer, INITIAL_STATE);

  const handleNodeClick = React.useCallback(
    (node: TreeNodeInfo) => {
      // get the node data
      const nodeData: AnalogDataSourceNodeData | undefined =
        node.nodeData as AnalogDataSourceNodeData;

      if (nodeData === undefined) {
        return;
      }

      // get the data source associated with the node
      const event = events.find((event) => event.id === nodeData.eventId);

      if (event === undefined) {
        return;
      }

      const source = event.analogDataSources.find(
        (source) => source.channel.info.label === nodeData.name
      );

      if (source === undefined) {
        return;
      }

      updateSelectedSources([...selectedSources, source]);
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
    const treeNodes: TreeNodeInfo[] = events.flatMap((event) => {
      const eventIsExpanded: boolean = nodes.some(
        (node) => node.id === event.id && node.isExpanded
      );
      // event should be a folder
      return {
        id: event.id,
        hasCaret: true,
        icon: "folder-close",
        label: event.config.stationName,
        isExpanded: eventIsExpanded,
        childNodes: event.analogDataSources.map((source) => {
          return {
            id: source.channel.info.label,
            icon: "pulse",
            label: source.channel.info.label,
            nodeData: {
              eventId: event.id,
              name: source.channel.info.label,
            } as AnalogDataSourceNodeData,
          };
        }),
      };
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
const INITIAL_STATE: TreeNodeInfo[] = [
  // {
  //   id: 0,
  //   hasCaret: true,
  //   icon: "folder-close",
  //   label: "Event #1",
  // },
  // {
  //   id: 1,
  //   icon: "folder-close",
  //   isExpanded: false,
  //   label: "Event #2",
  //   childNodes: [
  //     {
  //       id: 2,
  //       icon: "pulse",
  //       label: "Analog Source #1",
  //     },
  //   ],
  // },
];

export default AnalogAvailableSourcesTree;
