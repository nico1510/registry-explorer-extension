import { DockerMuiThemeProvider } from "@docker/docker-mui-theme";
import CssBaseline from "@mui/material/CssBaseline";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import ReactDOM from "react-dom/client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { App } from "./App";

export const queryClient = new QueryClient();

export const proxy =
  process.env.NODE_ENV === "development" ? "http://0.0.0.0:8080/" : "";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <DockerMuiThemeProvider>
    <CssBaseline />
    <QueryClientProvider client={queryClient}>
      <App />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </DockerMuiThemeProvider>
);
