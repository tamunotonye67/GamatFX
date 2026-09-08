import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App, { ErrorBoundary } from "./App";
import { StoreProvider } from "./lib/store";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <StoreProvider>
        <App />
      </StoreProvider>
    </ErrorBoundary>
  </StrictMode>
);
