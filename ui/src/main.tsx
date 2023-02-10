import { DockerMuiThemeProvider } from "@docker/docker-mui-theme";
import CssBaseline from "@mui/material/CssBaseline";
import React from "react";
import ReactDOM from "react-dom/client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { App } from "./App";

export const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    {/*
      If you eject from MUI (which we don't recommend!), you should add
      the `dockerDesktopTheme` class to your root <html> element to get
      some minimal Docker theming.
    */}
    <DockerMuiThemeProvider>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </DockerMuiThemeProvider>
  </React.StrictMode>
);
