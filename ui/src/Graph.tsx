import { Box } from "@mui/material";
import React from "react";
import Tree from "react-d3-tree";
import type { RawNodeDatum } from "react-d3-tree/lib/types/types/common";
import { Index, isIndex, Manifest } from "./useIndex";
import "./custom-tree.css";

function indexToTree(index: Index): RawNodeDatum {
  return {
    name: index.digest,
    attributes: {
      digest: index.digest,
      contentType: index.contentType,
    },
    children: index.manifests.map(
      ({ digest, manifest, platform, annotations, ...rest }) =>
        manifest
          ? manifestToTree(manifest)
          : {
              name: digest,
              attributes: {
                ...platform,
                ...rest,
              },
            }
    ) as any,
  };
}

function manifestToTree(manifest: Manifest): RawNodeDatum {
  return {
    name: manifest.config.digest,
    attributes: {
      ...manifest.config,
    },
    children: manifest.layers?.map(({ digest, annotations, ...child }) => ({
      name: digest,
      attributes: {
        ...child,
        // ...annotations,
      },
    })),
  };
}

export default function Graph({ index }: { index: Index | Manifest }) {
  const data = isIndex(index) ? indexToTree(index) : manifestToTree(index);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const size = containerRef.current?.getBoundingClientRect();
  return (
    <Box ref={containerRef} style={{ height: "100%" }}>
      <Tree
        rootNodeClassName="node__root"
        branchNodeClassName="node__branch"
        leafNodeClassName="node__leaf"
        translate={{ x: size?.width ?? 500, y: size?.height ?? 500 }}
        data={data}
      />
    </Box>
  );
}
