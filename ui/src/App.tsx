import { createDockerDesktopClient } from "@docker/extension-api-client";
import { Stack, TextField, Typography } from "@mui/material";
import Button from "@mui/material/Button";
import { useQuery, type QueryOptions } from "@tanstack/react-query";
import React from "react";

// Note: This line relies on Docker Desktop's presence as a host application.
// If you're running this React app in a browser, it won't work properly.
const client = createDockerDesktopClient();

function useDockerDesktopClient() {
  return client;
}

interface TokenResponse {
  Token: string;
  Access_token: string;
  Expires_in: number;
  Issued_at: string;
}

function getTokenQuery(repo: string): QueryOptions<TokenResponse> {
  const tokenPath = `/token/${repo}`;
  return {
    queryKey: [tokenPath],
    queryFn: () =>
      client.extension.vm?.service?.get(tokenPath) as Promise<TokenResponse>,
  };
}

export function App() {
  const ddClient = useDockerDesktopClient();

  const [repo, setRepo] = React.useState("moby/buildkit");
  const [enabled, setEnabled] = React.useState(false);

  const { data: token } = useQuery({
    ...getTokenQuery(repo),
    refetchOnMount: false,
    retry: false,
    refetchInterval: 1000 * 290,
    enabled,
  });

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
          onChange={(e) => {
            setEnabled(false);
            setRepo(e.target.value);
          }}
        />
        <Button variant="contained" onClick={() => setEnabled(true)}>
          Submit
        </Button>
      </Stack>
      <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
        {token?.Token}
      </Typography>
    </>
  );
}
