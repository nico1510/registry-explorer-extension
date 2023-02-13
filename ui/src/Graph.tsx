import { Box } from "@mui/material";
import Tree from "react-d3-tree";
import { Index } from "./useIndex";

export default function Graph({ index }: { index: Index }) {
  const data = {
    name: index.digest,
    attributes: {
      digest: index.digest,
      contentType: index.contentType,
    },
    children: index.manifests?.map((child) => ({
      name: child.digest,
      attributes: {
        mediaType: child.mediaType,
      },
    })),
  };
  return (
    <Box style={{ height: 800, width: 1200 }}>
      <Tree dimensions={{ height: 800, width: 1200 }} data={data} />
    </Box>
  );
}
