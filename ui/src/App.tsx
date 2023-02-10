import { createDockerDesktopClient } from "@docker/extension-api-client";
import { Stack, TextField, Typography } from "@mui/material";
import Button from "@mui/material/Button";
import { type QueryOptions } from "@tanstack/react-query";
import React from "react";
import { queryClient } from "./main";

// Note: This line relies on Docker Desktop's presence as a host application.
// If you're running this React app in a browser, it won't work properly.
const client = createDockerDesktopClient();

function useDockerDesktopClient() {
  return client;
}

function getTokenQuery(repo: string): QueryOptions<string> {
  const tokenPath = `/token/${repo}`;
  return {
    queryKey: [tokenPath],
    queryFn: () =>
      client.extension.vm?.service?.get(tokenPath) as Promise<string>,
  };
}

export function App() {
  const ddClient = useDockerDesktopClient();

  const [repo, setRepo] = React.useState("moby/buildkit");
  const [token, setToken] = React.useState("");

  return (
    <>
      <Typography variant="h3">Registry Explorer</Typography>
      <Stack direction="row" alignItems="start" spacing={2} sx={{ mt: 4 }}>
        <TextField
          label="Repository"
          sx={{ width: 480 }}
          disabled={!repo}
          variant="outlined"
          value={repo}
          onChange={(e) => setRepo(e.target.value)}
        />
        <Button
          variant="contained"
          onClick={async () =>
            setToken(await queryClient.fetchQuery(getTokenQuery(repo)))
          }
        >
          Submit
        </Button>
      </Stack>
      <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
        {token}
      </Typography>
    </>
  );
}
