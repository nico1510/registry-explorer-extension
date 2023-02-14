import { Box } from "@mui/material";
import React from "react";
import Tree from "react-d3-tree";
import type { RawNodeDatum } from "react-d3-tree/lib/types/types/common";
import { Index, isIndex, Manifest } from "./useIndex";
import "./custom-tree.css";
import Node from "./Node";

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
    attributes: manifest as any,
    children: manifest.layers?.map(
      ({ digest, ...child }) =>
        ({
          name: digest,
          attributes: {
            _isLayer: true,
            ...child,
          },
        } as any)
    ),
  };
}

export default function Graph({ index }: { index: Index | Manifest }) {
  const data = isIndex(index) ? indexToTree(index) : manifestToTree(index);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const size = containerRef.current?.getBoundingClientRect();
  return (
    <Box ref={containerRef} style={{ height: "100%" }}>
      <Tree
        hasInteractiveNodes
        rootNodeClassName="node__root"
        branchNodeClassName="node__branch"
        leafNodeClassName="node__leaf"
        onNodeClick={(node) => console.log(node)}
        renderCustomNodeElement={(nodeProps) => (
          <Node
            nodeData={nodeProps.nodeDatum}
            onClick={nodeProps.onNodeClick}
          />
        )}
        translate={{ x: 610, y: size ? size.height / 2 : 500 }}
        zoom={0.7}
        data={data}
        nodeSize={{ x: 610, y: 80 }}
      />
    </Box>
  );
}
