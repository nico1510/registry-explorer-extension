import { Stack, TextField, Typography } from "@mui/material";
import Button from "@mui/material/Button";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import Graph from "./Graph";
import { getIndexQuery } from "./useIndex";
import { getTokenQuery } from "./useToken";

export function App() {
  const [reference, setReference] = React.useState("moby/buildkit:latest");
  let repo = "";
  let digestOrTag = "";

  if (reference.includes("sha256:")) {
    const parts = reference.split("@");
    repo = parts[0];
    digestOrTag = parts[1];
  } else if (reference.includes(":")) {
    const parts = reference.split(":");
    repo = parts[0];
    digestOrTag = parts[1];
  } else if (reference.includes("/")) {
    repo = reference;
    digestOrTag = "latest";
  } else {
    repo = `library/${reference}`;
    digestOrTag = "latest";
  }

  const [enabled, setEnabled] = React.useState(false);

  const { data: tokenResponse } = useQuery({
    ...getTokenQuery(repo),
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: false,
    staleTime: 1000 * 289,
    refetchInterval: 1000 * 290,
    enabled: enabled && !!repo && !!digestOrTag,
  });

  const { data: root } = useQuery({
    ...getIndexQuery(repo, digestOrTag, tokenResponse?.token ?? ""),
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
      {root && <Graph index={root} />}
    </Stack>
  );
}
