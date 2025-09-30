import React, { useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { Route, HashRouter, Routes } from "react-router-dom";
import NotFound from "./views/NotFound";
import Editor from "./views/Editor";
// import TestView from "./test/TestView";
import "./styles/App.css";
import ContextMenu from "./components/ContextMenu";

const App = () => {
  const contextMenuRef = useRef<any>(null);

  return (
    <div>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Editor contextMenu={contextMenuRef} />} />
          <Route path="/editor" element={<Editor />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </HashRouter>
      <ContextMenu enabled={true} ref={contextMenuRef} />
    </div>
  );
};

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
