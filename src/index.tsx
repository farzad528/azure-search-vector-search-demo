import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { initializeIcons } from "@fluentui/react";
import { HashRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./pages/Layout/Layout";
import { ImagePage } from "./pages/ImagePage/ImagePage";
import { Vector } from "./pages/Vector/Vector";

initializeIcons();

export const App = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Vector />} />
          <Route path="image" element={<ImagePage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
};

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
