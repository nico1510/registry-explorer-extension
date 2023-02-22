import { Box, Stack, Tooltip, Typography, useTheme } from "@mui/material";
import type { TreeNodeDatum } from "react-d3-tree/lib/types/types/common";
import { NodeType } from "./App";
import { Index, LayerOrBlob, Manifest, ManifestConfig } from "./useManifest";

export function Node({
  nodeData,
  onClick,
}: {
  nodeData: TreeNodeDatum;
  onClick: (
    target: NodeType,
    data: Index | Manifest | ManifestConfig | LayerOrBlob
  ) => void;
}) {
  const theme = useTheme();
  const backgroundColor = (["layer", "blob"] as NodeType[]).includes(
    nodeData.attributes?._nodeType as NodeType
  )
    ? theme.palette.docker.violet[700]
    : theme.palette.docker.blue[700];
  const color = theme.palette.getContrastText(backgroundColor);
  const config: Manifest["config"] = nodeData.attributes?.config as any;
  return (
    <foreignObject
      style={{
        border: `1px solid ${color}`,
        color,
        backgroundColor,
        overflow: "auto",
        width: 610,
        height: config ? 100 : 60,
      }}
      y={-30}
    >
      <Tooltip
        arrow={false}
        componentsProps={{
          tooltip: {
            sx: {
              maxWidth: "max-content",
              textTransform: "none",
              maxHeight: 300,
              overflow: "auto",
              alignItems: "flex-start",
            },
          },
        }}
        placement="bottom-start"
        disableInteractive={false}
        title={
          <Box sx={{ whiteSpace: "pre" }}>
            {JSON.stringify(
              nodeData.attributes,
              (key, value) => (key.startsWith("_") ? undefined : value),
              2
            )}
          </Box>
        }
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
          onClick={() =>
            onClick(
              nodeData.attributes?._nodeType as NodeType,
              nodeData.attributes as any
            )
          }
        >
          <strong>digest: {nodeData.name ?? "N/A"}</strong>
          media_type: {nodeData.attributes?.mediaType ?? "N/A"}
          {!!config && (
            <Stack
              padding={0.5}
              onClick={() => onClick("config", config as any)}
              sx={{
                border: `1px dashed ${color}`,
                position: "relative",
              }}
            >
              <Typography
                sx={{
                  position: "absolute",
                  top: -14,
                  background: backgroundColor,
                }}
              >
                config
              </Typography>
              <div>digest: {config.digest ?? "N/A"}</div>
              <div>media_type: {config.mediaType ?? "N/A"}</div>
            </Stack>
          )}
        </Box>
      </Tooltip>
    </foreignObject>
  );
}
