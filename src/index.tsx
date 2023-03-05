import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { initializeIcons } from "@fluentui/react";
import { HashRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./pages/Layout/Layout";

initializeIcons();

export const App = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}></Route>
      </Routes>
    </HashRouter>
  );
};

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
