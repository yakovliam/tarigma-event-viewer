import { BrowserRouter, Routes, Route } from "react-router-dom";

import { HomePage } from "./pages/HomePage";
import {
  Alignment,
  Button,
  Classes,
  Navbar,
  NavbarDivider,
  NavbarGroup,
  NavbarHeading,
} from "@blueprintjs/core";
import { styled } from "styled-components";
import { useRecoilState } from "recoil";
import { blueprintThemeRepository } from "../utils/recoil/atoms";
import { blueprintThemeClassName } from "../utils/types/blueprint/theme-utils";

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
              <NavbarDivider />
              <Button className={Classes.MINIMAL} icon="home" text="GEM Home" />
              <Button
                className={Classes.MINIMAL}
                icon="document"
                text="Files"
              />

              <Button
                className={Classes.MINIMAL}
                icon="database"
                text="Event Collection"
              />
              <Button
                className={Classes.MINIMAL}
                icon="cog"
                text="Toggle Theme"
                onClick={toggleTheme}
              />
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
