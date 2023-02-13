import { createDockerDesktopClient } from "@docker/extension-api-client";
import { Stack, TextField, Typography } from "@mui/material";
import Button from "@mui/material/Button";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import Graph from "./Graph";
import { getIndexQuery } from "./useIndex";
import { getTokenQuery } from "./useToken";

// Note: This line relies on Docker Desktop's presence as a host application.
// If you're running this React app in a browser, it won't work properly.
const client = createDockerDesktopClient();

function useDockerDesktopClient() {
  return client;
}

export function App() {
  const ddClient = useDockerDesktopClient();

  const [reference, setReference] = React.useState("moby/buildkit:latest");
  const [repo, tag] = reference.split(":");
  const [enabled, setEnabled] = React.useState(false);

  const { data: tokenResponse } = useQuery({
    ...getTokenQuery(repo),
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: false,
    refetchInterval: 1000 * 290,
    enabled,
  });

  const { data: index } = useQuery({
    ...getIndexQuery(repo, tag, tokenResponse?.token ?? ""),
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    staleTime: 10 * (60 * 1000), // 10 mins
    cacheTime: 10 * (60 * 1000), // 10 mins
    enabled: enabled && !!tokenResponse,
  });

  return (
    <Stack height="100%">
      <Typography variant="h3">Registry Explorer</Typography>
      <Stack direction="row" alignItems="start" spacing={2} sx={{ mt: 4 }}>
        <TextField
          label="Repository"
          sx={{ width: 480 }}
          disabled={!reference}
          variant="outlined"
          value={reference}
          onChange={(e) => {
            setEnabled(false);
            setReference(e.target.value);
          }}
        />
        <Button variant="contained" onClick={() => setEnabled(true)}>
          Submit
        </Button>
      </Stack>
      {index && <Graph index={index} />}
    </Stack>
  );
}
