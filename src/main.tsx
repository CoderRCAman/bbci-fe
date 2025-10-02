import React from "react";
import { createRoot } from "react-dom/client";
import "primereact/resources/themes/lara-light-cyan/theme.css"; // import "/node_modules/primeflex/primeflex.css";
import App from "./App";
import "virtual:windi.css";
import "./main.css";
import { PrimeReactProvider } from "primereact/api";
const container = document.getElementById("root");
const root = createRoot(container!);

root.render(
  <PrimeReactProvider value={{ ripple: true, appendTo: "self" }}>
    <App />
  </PrimeReactProvider>
);
