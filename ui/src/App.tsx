import { Stack, TextField, Typography } from "@mui/material";
import Button from "@mui/material/Button";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import Graph from "./Graph";
import { getIndexQuery, Index, isIndex, Manifest } from "./useIndex";
import { getTokenQuery } from "./useToken";
import type { HierarchyPointNode } from "d3-hierarchy";
import { TreeNodeDatum } from "react-d3-tree/lib/types/types/common";
import { queryClient } from "./main";

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
    staleTime: Infinity,
    cacheTime: Infinity,
    enabled: enabled && !!tokenResponse,
  });

  const onNodeClick = async (node: HierarchyPointNode<TreeNodeDatum>) => {
    const result = await queryClient.fetchQuery(
      getIndexQuery(
        repo,
        node.data.attributes?.digest as string,
        tokenResponse?.token ?? ""
      )
    );
    const parentKey = getIndexQuery(
      repo,
      node.parent?.data.attributes?._digestOrTag as string,
      tokenResponse?.token ?? ""
    ).queryKey;
    queryClient.setQueryData(parentKey!, ((previous: Index | Manifest) => {
      if (previous && isIndex(previous)) {
        return {
          ...previous,
          manifests: previous.manifests.map((mf) => {
            if (mf.digest === node.data.attributes?.digest) {
              return {
                ...mf,
                manifest: result,
              };
            }
            return mf;
          }),
        };
      }
      return undefined;
    }) as any);

    console.log(result);
  };

  return (
    <Stack height="100%">
      <Typography variant="h3">Registry Explorer</Typography>
      <Stack direction="row" alignItems="start" spacing={2} sx={{ mt: 4 }}>
        <TextField
          label="Resource"
          sx={{ width: 700 }}
          disabled={!reference}
          variant="outlined"
          value={reference}
          onChange={(e) => {
            setEnabled(false);
            setReference(e.target.value);
          }}
          helperText="e.g. moby/buildkit:latest or moby/buildkit@sha256:..."
        />
        <Button variant="contained" onClick={() => setEnabled(true)}>
          Submit
        </Button>
      </Stack>
      {root && <Graph index={root} onNodeClick={onNodeClick} />}
    </Stack>
  );
}
