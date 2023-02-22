import { css } from "@emotion/css";
import { useTheme } from "@mui/material";
import Tree from "react-d3-tree";
import type { RawNodeDatum } from "react-d3-tree/lib/types/types/common";
import { NodeType } from "./App";
import { Node } from "./Node";
import {
  Index,
  isIndex,
  LayerOrBlob,
  Manifest,
  ManifestConfig,
} from "./useManifest";

function indexToTree(index: Index): RawNodeDatum {
  return {
    name: index.digest,
    attributes: index as any,
    children: index.manifests.map(({ digest, manifest, platform, ...rest }) =>
      manifest
        ? manifestToTree(manifest)
        : {
            name: digest,
            attributes: {
              digest,
              _nodeType: "index" as NodeType,
              ...platform,
              ...rest,
            },
          }
    ) as any,
  };
}

function manifestToTree(manifest: Manifest): RawNodeDatum {
  return {
    name: manifest.digest,
    attributes: {
      ...((manifest ?? {}) as any),
      _nodeType: "manifest" as NodeType,
    },
    children: [
      ...(manifest.layers ?? []).map(
        ({ digest, ...child }) =>
          ({
            name: digest,
            attributes: {
              _nodeType: "layer" as NodeType,
              digest,
              ...child,
            },
          } as any)
      ),
      ...(manifest.blobs ?? []).map(
        ({ digest, ...child }) =>
          ({
            name: digest,
            attributes: {
              _nodeType: "blob" as NodeType,
              digest,
              ...child,
            },
          } as any)
      ),
    ],
  };
}

export default function Graph({
  index,
  onNodeClick,
}: {
  index: Index | Manifest;
  onNodeClick: (
    target: NodeType,
    data: Index | Manifest | ManifestConfig | LayerOrBlob
  ) => void;
}) {
  const data = isIndex(index) ? indexToTree(index) : manifestToTree(index);
  const theme = useTheme();
  return (
    <Tree
      hasInteractiveNodes
      rootNodeClassName={css`
        transform: translate(-610px, 0);
      `}
      svgClassName={css`
        path {
          stroke: ${theme.palette.text.primary};
        }
        div {
          letter-spacing: 0;
        }
      `}
      renderCustomNodeElement={(nodeProps) => (
        <Node nodeData={nodeProps.nodeDatum} onClick={onNodeClick} />
      )}
      translate={{ x: 610, y: 500 }}
      zoom={0.7}
      data={data}
      separation={{ siblings: 2, nonSiblings: 3 }}
      nodeSize={{ x: 1000, y: 90 }}
    />
  );
}
