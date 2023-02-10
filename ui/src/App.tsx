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

function getIndexQuery(
  repo: string,
  tag: string,
  token: string
): QueryOptions<Index> {
  return {
    queryKey: ["index", repo, tag, token],
    queryFn: () => fetchindex(repo, tag, token),
  };
}

interface Index {
  schemaVersion: number;
  digest: string;
  contentType: string;
  manifests: Array<{
    mediaType: string;
    digest: string;
    size: number;
    platform: {
      architecture: string;
      os: string;
      variant?: string;
      features?: string[];
    };
  }>;
}

async function fetchindex(repo: string, tag: string, token: string) {
  const result = await fetch(
    `https://registry-1.docker.io/v2/${repo}/manifests/${tag}`,
    {
      headers: {
        Accept:
          "application/vnd.oci.image.index.v1+json,application/vnd.docker.distribution.manifest.list.v2+json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  const body = await result.json();
  return {
    digest: result.headers.get("docker-content-digest"),
    contentType: result.headers.get("content-type"),
    ...body,
  } as Index;
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
    ...getIndexQuery(repo, tag, tokenResponse?.Token || ""),
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: false,
    enabled: enabled && !!tokenResponse,
  });

  return (
    <>
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
      <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
        {index && JSON.stringify(index, null, 2)}
      </Typography>
    </>
  );
}
