import { dropRight } from "lodash";
import {
  Corner,
  MosaicDirection,
  MosaicNode,
  MosaicParent,
  MosaicPath,
  getNodeAtPath,
  getOtherDirection,
  getPathToCorner,
  isParent,
  updateTree,
} from "react-mosaic-component";

const getPathById = (viewId: string, currentNode: MosaicNode<string>) => {
  const path: MosaicPath = [];

  const traverse = (node: MosaicNode<string>) => {
    if (isParent(node)) {
      if (node.first === viewId) {
        path.push("first");
        return true;
      } else if (node.second === viewId) {
        path.push("second");
        return true;
      } else {
        path.push("first");
        if (traverse(node.first)) {
          return true;
        }
        path.pop();
        path.push("second");
        if (traverse(node.second)) {
          return true;
        }
        path.pop();
      }
    }
    return false;
  };

  traverse(currentNode);

  return path;
};

const addToTopRight = (
  currentNode: MosaicNode<string> | null,
  viewId: string
): MosaicNode<string> => {
  if (!currentNode) {
    return viewId;
  }

  const path = getPathToCorner(currentNode, Corner.TOP_RIGHT);
  const parent = getNodeAtPath(
    currentNode,
    dropRight(path)
  ) as MosaicParent<string>;
  const destination = getNodeAtPath(currentNode, path) as MosaicNode<string>;
  const direction: MosaicDirection = parent
    ? getOtherDirection(parent.direction)
    : "row";

  let first: MosaicNode<string>;
  let second: MosaicNode<string>;
  if (direction === "row") {
    first = destination;
    second = viewId;
  } else {
    first = viewId;
    second = destination;
  }

  currentNode = updateTree(currentNode, [
    {
      path,
      spec: {
        $set: {
          direction,
          first,
          second,
        },
      },
    },
  ]);

  return currentNode;
};

const addAtPath = (
  currentNode: MosaicNode<string> | null,
  viewId: string,
  path: MosaicPath,
  direction: MosaicDirection
): MosaicNode<string> => {
  if (!currentNode) {
    return viewId;
  }

  // get the destination node
  const destination = getNodeAtPath(currentNode, path) as MosaicNode<string>;

  // get the first and second nodes
  let first: MosaicNode<string>;
  let second: MosaicNode<string>;
  if (direction === "row") {
    first = destination;
    second = viewId;
  } else {
    first = viewId;
    second = destination;
  }

  // update the tree
  currentNode = updateTree(currentNode, [
    {
      path,
      spec: {
        $set: {
          direction,
          first,
          second,
        },
      },
    },
  ]);

  return currentNode;
};

export { addToTopRight, getPathById, addAtPath };
