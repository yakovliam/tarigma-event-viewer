import { Button, Menu, MenuItem } from "@blueprintjs/core";
import {
  MosaicBranch,
  MosaicWindow,
  ExpandButton,
} from "react-mosaic-component";
import { MosaicTileType, userFriendlyTypeMap } from "../../types/mosaic/tiles";
import { v4 as uuidv4 } from "uuid";
import { Popover2 } from "@blueprintjs/popover2";

const useTileRenderer = (
  addTileAtPath: (
    viewId: string,
    tileType: MosaicTileType,
    path: MosaicBranch[]
  ) => void,
  removeTile: (viewId: string) => void
): { renderTile: CallableFunction } => {
  const renderTile = (
    id: string,
    element: JSX.Element,
    title: string
  ): CallableFunction => {
    return (path: MosaicBranch[]) => {
      return (
        <MosaicWindow
          toolbarControls={[
            // expand button
            <ExpandButton key={"expand"} />,
            // add pane right button
            <Popover2
              key={"add-column-right"}
              placement="bottom"
              enforceFocus={false}
              content={
                <Menu>
                  {userFriendlyTypeMap.map((type) => (
                    <MenuItem
                      key={type.key}
                      icon={type.icon}
                      text={type.name}
                      onClick={() => {
                        const idToCreateNewNode = uuidv4();
                        addTileAtPath(idToCreateNewNode, type.key, path);
                      }}
                    />
                  ))}
                </Menu>
              }
            >
              <Button
                minimal
                icon="add-column-right"
                key={"add-column-right"}
                tabIndex={0}
              />
              ,
            </Popover2>,
            // remove pane button
            <Button
              minimal
              icon="cross"
              key={"cross"}
              onClick={() => {
                removeTile(id);
              }}
            />,
          ]}
          path={path}
          createNode={() => {
            throw new Error(
              "Should never create a new node for an existing tile using this method."
            );
            // const idToCreateNewNode = uuidv4();
            // addTile(idToCreateNewNode);
            // return idToCreateNewNode;
          }}
          title={title || "Untitled"}
        >
          {element}
        </MosaicWindow>
      );
    };
  };

  return { renderTile };
};

export default useTileRenderer;
