import React from "react";
import { createRoot } from "react-dom/client";

const App = () => <h2>Hello World</h2>;

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
