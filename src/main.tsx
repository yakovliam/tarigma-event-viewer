import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app/App.tsx";
import { RecoilRoot } from "recoil";
import { DndProvider } from 'react-dnd-multi-backend';
import { HTML5toTouch } from 'rdndmb-html5-to-touch';

import "./index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <RecoilRoot>
      <DndProvider options={HTML5toTouch}>
        <App />
      </DndProvider>
    </RecoilRoot>
  </React.StrictMode>
);
