import { FormHelperText, Stack, TextField, Typography } from "@mui/material";
import Button from "@mui/material/Button";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import BlobDialog from "./BlobDialog";
import Graph from "./Graph";
import { queryClient } from "./main";
import { useLocalStorage } from "./useLocalStorage";
import {
  getIndexOrManifestQuery,
  Index,
  isIndex,
  LayerOrBlob,
  Manifest,
  ManifestConfig,
} from "./useManifest";
import { useToken } from "./useToken";

export type NodeType = "index" | "manifest" | "config" | "layer" | "blob";

export function App() {
  const [reference, setReference] = useLocalStorage(
    "reference",
    "moby/buildkit:latest"
  );
  let repo = "";
  let digestOrTag = "";

  if (reference.includes("sha256:")) {
    const parts = reference.split("@");
    repo = parts[0].includes("/") ? parts[0] : `library/${parts[0]}`;
    digestOrTag = parts[1];
  } else if (reference.includes(":")) {
    const parts = reference.split(":");
    repo = parts[0].includes("/") ? parts[0] : `library/${parts[0]}`;
    digestOrTag = parts[1];
  } else if (reference.includes("/")) {
    repo = reference;
    digestOrTag = "latest";
  } else {
    repo = `library/${reference}`;
    digestOrTag = "latest";
  }

  const [enabled, setEnabled] = React.useState(false);
  const [blobNode, setBlobNode] = React.useState<{
    digest: string;
    mediaType: string;
    size: number;
    nodeType: NodeType;
  } | null>(null);

  const { data: tokenResponse, isLoading: isLoadingToken } = useToken(repo, {
    enabled: enabled && !!repo && !!digestOrTag,
  });

  const { data: root, isLoading: isLoadingIndex } = useQuery({
    ...getIndexOrManifestQuery(repo, digestOrTag, tokenResponse?.token ?? ""),
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    cacheTime: Infinity,
    enabled: enabled && !!tokenResponse,
  });

  async function onManifestNodeClick(digest: string) {
    const result = await queryClient.fetchQuery(
      getIndexOrManifestQuery(repo, digest, tokenResponse?.token ?? "")
    );
    const rootQueryKey = getIndexOrManifestQuery(
      repo,
      digestOrTag,
      tokenResponse?.token ?? ""
    ).queryKey;
    queryClient.setQueryData(rootQueryKey!, ((previous: Index | Manifest) => {
      if (previous && isIndex(previous)) {
        return {
          ...previous,
          manifests: previous.manifests.map((mf) => {
            if (mf.digest === digest) {
              return {
                ...mf,
                ...(mf.manifests ? { ...result } : { _manifest: result }),
              };
            }
            // we can only go two levels deep with this approach
            return mf._manifest?.manifests
              ? {
                  ...mf,
                  _manifest: {
                    ...mf._manifest,
                    manifests: mf._manifest.manifests.map((nestedMf) => {
                      if (nestedMf.digest === digest) {
                        return {
                          ...nestedMf,
                          _manifest: result,
                        };
                      }
                      return nestedMf;
                    }),
                  },
                }
              : mf;
          }),
        };
      }
      return undefined;
    }) as any);
  }

  const onNodeClick = (
    target: NodeType,
    node: Index | Manifest | ManifestConfig | LayerOrBlob
  ) => {
    const digest = node.digest;
    if (digest === root?.digest) return; // we have clicked the root node again
    const showBlob = (["blob", "layer", "config"] as NodeType[]).includes(
      target
    );
    showBlob
      ? setBlobNode({
          ...JSON.parse(JSON.stringify(node as LayerOrBlob)),
          nodeType: target,
        })
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
          size={blobNode.size}
          nodeType={blobNode.nodeType}
          closeDialog={() => setBlobNode(null)}
        />
      )}
    </>
  );
}
