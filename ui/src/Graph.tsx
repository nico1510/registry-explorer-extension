import { css } from "@emotion/css";
import { useTheme } from "@mui/material";
import type { HierarchyPointNode } from "d3-hierarchy";
import Tree from "react-d3-tree";
import type {
  RawNodeDatum,
  TreeNodeDatum,
} from "react-d3-tree/lib/types/types/common";
import Node from "./Node";
import { Index, isIndex, Manifest } from "./useIndex";

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
    name: manifest.digest,
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

export default function Graph({
  index,
  onNodeClick,
}: {
  index: Index | Manifest;
  onNodeClick: (node: HierarchyPointNode<TreeNodeDatum>) => void;
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
      onNodeClick={onNodeClick}
      renderCustomNodeElement={(nodeProps) => (
        <Node nodeData={nodeProps.nodeDatum} onClick={nodeProps.onNodeClick} />
      )}
      translate={{ x: 610, y: 500 }}
      zoom={0.7}
      data={data}
      separation={{ siblings: 2, nonSiblings: 3 }}
      nodeSize={{ x: 1400, y: 90 }}
    />
  );
}
