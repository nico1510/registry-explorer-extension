import LaunchOutlinedIcon from "@mui/icons-material/LaunchOutlined";
import {
  Box,
  Card,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
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
      y={config ? -60 : -30}
      style={{
        width: 650,
        height: config ? 120 : 80,
        overflow: "visible",
      }}
    >
      <Tooltip
        arrow={false}
        leaveDelay={400}
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
        <Card
          elevation={3}
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-start",
            overflow: "visible",
            position: "relative",
            padding: 1,
            height: "100%",
            color,
            backgroundColor,
          }}
          onClick={() =>
            onClick(
              nodeData.attributes?._nodeType as NodeType,
              nodeData.attributes as any
            )
          }
        >
          <span>
            digest: <strong>{nodeData.name ?? "N/A"}</strong>
          </span>
          media_type: {nodeData.attributes?.mediaType ?? "N/A"}
        </Card>
      </Tooltip>
      {!!config && (
        <Stack
          onClick={() => onClick("config", config as any)}
          sx={(theme) => ({
            position: "absolute",
            bottom: -40,
            left: 0,
            backgroundColor: theme.palette.docker.blue[500],
            filter: "drop-shadow(2px 2px 4px black)",
            borderRadius: 2,
            padding: 1,
            color,
            alignItems: "center",
          })}
        >
          <Stack
            direction="row"
            sx={{ textAlign: "center", fontWeight: "bold" }}
          >
            Config
            <LaunchOutlinedIcon sx={{ stroke: color, strokeWidth: 0, ml: 1 }} />
          </Stack>
          <Stack
            direction="column"
            justifyContent="space-between"
            alignItems="center"
          >
            <div>digest: {config.digest ?? "N/A"}</div>
            <div>media_type: {config.mediaType ?? "N/A"}</div>
          </Stack>
        </Stack>
      )}
    </foreignObject>
  );
}
