import { FormHelperText, Stack, TextField, Typography } from "@mui/material";
import Button from "@mui/material/Button";
import { useQuery } from "@tanstack/react-query";
import type { HierarchyPointNode } from "d3-hierarchy";
import React from "react";
import { TreeNodeDatum } from "react-d3-tree/lib/types/types/common";
import BlobDialog from "./BlobDialog";
import Graph from "./Graph";
import { queryClient } from "./main";
import { useLocalStorage } from "./useLocalStorage";
import {
  getManifestQuery,
  Index,
  isIndex,
  LayerOrBlob,
  Manifest,
} from "./useManifest";
import { useToken } from "./useToken";

export function App() {
  const [reference, setReference] = useLocalStorage(
    "reference",
    "moby/buildkit:latest"
  );
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
  const [blobNode, setBlobNode] = React.useState<LayerOrBlob | null>(null);

  const { data: tokenResponse, isLoading: isLoadingToken } = useToken(repo, {
    enabled: enabled && !!repo && !!digestOrTag,
  });

  const { data: root, isLoading: isLoadingIndex } = useQuery({
    ...getManifestQuery(repo, digestOrTag, tokenResponse?.token ?? ""),
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    cacheTime: Infinity,
    enabled: enabled && !!tokenResponse,
  });

  async function onManifestNodeClick(digest: string) {
    const result = await queryClient.fetchQuery(
      getManifestQuery(repo, digest, tokenResponse?.token ?? "")
    );
    const parentKey = getManifestQuery(
      repo,
      digestOrTag,
      tokenResponse?.token ?? ""
    ).queryKey;
    queryClient.setQueryData(parentKey!, ((previous: Index | Manifest) => {
      if (previous && isIndex(previous)) {
        return {
          ...previous,
          manifests: previous.manifests.map((mf) => {
            if (mf.digest === digest) {
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
  }

  const onNodeClick = (node: HierarchyPointNode<TreeNodeDatum>) => {
    const digest = node.data.attributes?.digest as any as string;
    const isLayer = node.data.attributes?._isLayer;
    isLayer
      ? setBlobNode(
          JSON.parse(JSON.stringify(node.data.attributes as any as LayerOrBlob))
        )
      : onManifestNodeClick(digest);
  };

  return (
    <>
      <Stack height="100%">
        <Typography variant="h3">Registry Explorer</Typography>
        <Stack
          direction="row"
          alignItems="baseline"
          spacing={2}
          sx={(theme) => ({
            mt: 4,
            position: "fixed",
            p: 2,
            background: `${theme.palette.background.paper}CC`,
            borderRadius: 2,
          })}
        >
          <Stack direction="column" alignItems="start">
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
            />
            <FormHelperText sx={{ ml: 1 }}>
              e.g. moby/buildkit:latest or moby/buildkit@sha256:...
            </FormHelperText>
          </Stack>
          <Button
            disabled={enabled && (isLoadingIndex || isLoadingToken)}
            variant="contained"
            onClick={() => setEnabled(true)}
          >
            Submit
          </Button>
        </Stack>
        {root && <Graph index={root} onNodeClick={onNodeClick} />}
      </Stack>
      {!!blobNode && (
        <BlobDialog
          repo={repo}
          digest={blobNode.digest}
          mediaType={blobNode.mediaType}
          closeDialog={() => setBlobNode(null)}
        />
      )}
    </>
  );
}
