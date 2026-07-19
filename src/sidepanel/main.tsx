import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { SidePanelApp } from "./side-panel-app";
import "../styles/globals.css";

createRoot(document.getElementById("root")!).render(<StrictMode><SidePanelApp /></StrictMode>);
