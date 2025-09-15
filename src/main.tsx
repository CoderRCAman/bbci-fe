import React from "react";
import { createRoot } from "react-dom/client";
import "primereact/resources/themes/tailwind-light/theme.css";
// import "/node_modules/primeflex/primeflex.css";
import App from "./App";
import "virtual:windi.css";
import "./main.css";
import { PrimeReactProvider } from "primereact/api";
const container = document.getElementById("root");
const root = createRoot(container!);
root.render(
  <PrimeReactProvider value={{ unstyled: false }}>
    <App />
  </PrimeReactProvider>
);
