import { BrowserRouter, Routes, Route } from "react-router-dom";

import { HomePage } from "./pages/HomePage";
import {
  Alignment,
  Button,
  Classes,
  Intent,
  Menu,
  MenuDivider,
  MenuItem,
  Navbar,
  NavbarDivider,
  NavbarGroup,
  NavbarHeading,
} from "@blueprintjs/core";
import { styled } from "styled-components";
import { useRecoilState } from "recoil";
import { blueprintThemeRepository } from "../utils/recoil/atoms";
import { blueprintThemeClassName } from "../utils/types/blueprint/theme-utils";
import { Classes as PopoverClasses, Popover2 } from "@blueprintjs/popover2";
import { userFriendlyTypeMap } from "../utils/types/mosaic/tiles";

const AppWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
`;

const NavbarWrapper = styled.div`
  box-shadow: 0 0 0 1px rgba(16, 22, 26, 0.15), 0 2px 3px rgba(16, 22, 26, 0.2);
`;

function App() {
  const [blueprintTheme, setBlueprintTheme] = useRecoilState(
    blueprintThemeRepository
  );

  const toggleTheme = () => {
    if (blueprintTheme === "Blueprint") {
      setBlueprintTheme("Blueprint Dark");
    }
    if (blueprintTheme === "Blueprint Dark") {
      setBlueprintTheme("Blueprint");
    }
  };

  return (
    <BrowserRouter>
      <AppWrapper className={blueprintThemeClassName(blueprintTheme)}>
        <NavbarWrapper>
          <Navbar>
            <NavbarGroup align={Alignment.LEFT}>
              <NavbarHeading>Tarigma Event Viewer</NavbarHeading>
            </NavbarGroup>
            <NavbarGroup align={Alignment.RIGHT}>
              <Popover2
                placement="bottom"
                enforceFocus={false}
                content={
                  <Menu>
                    {userFriendlyTypeMap.map((type) => (
                      <MenuItem
                        key={type.key}
                        icon={type.icon}
                        text={type.name}
                        onClick={() => console.log("Settings...")}
                      />
                    ))}
                  </Menu>
                }
              >
                <Button
                  minimal
                  icon="add-column-right"
                  text="Add Pane"
                  rightIcon="caret-down"
                  tabIndex={0}
                />
              </Popover2>

              <Button minimal icon="symbol-diamond" text="GEM" />
              <Button
                minimal
                icon="cog"
                text="Toggle Theme"
                onClick={toggleTheme}
              />
              <NavbarDivider />
              <Popover2
                placement="bottom-end"
                enforceFocus={false}
                content={
                  <Menu>
                    <MenuItem icon="helper-management" text="Administration" />
                    <MenuDivider />
                    <MenuItem
                      icon="cog"
                      text="Preferences"
                      onClick={() => console.log("Settings...")}
                    />
                  </Menu>
                }
              >
                <Button
                  minimal
                  text="User"
                  icon="user"
                  rightIcon="caret-down"
                  tabIndex={0}
                />
              </Popover2>
            </NavbarGroup>
          </Navbar>
        </NavbarWrapper>
        <Routes>
          <Route path="*" element={<HomePage />} />
        </Routes>
      </AppWrapper>
    </BrowserRouter>
  );
}

export default App;
