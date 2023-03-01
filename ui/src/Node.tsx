import LaunchOutlinedIcon from "@mui/icons-material/LaunchOutlined";
import { Box, Button, Card, Tooltip, useTheme } from "@mui/material";
import type { TreeNodeDatum } from "react-d3-tree/lib/types/types/common";
import { NodeType } from "./App";
import { MediaTypeLogo } from "./icons/MediaTypeLogo";
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
  const arch =
    nodeData.attributes?.architecture &&
    `${nodeData.attributes?.architecture}${nodeData.attributes?.variant ?? ""}`;
  const os = nodeData.attributes?.os;
  const bigSize = config || os || arch;
  return (
    <foreignObject
      y={bigSize ? -60 : -30}
      style={{
        width: 650,
        height: bigSize ? 120 : 70,
        overflow: "visible",
      }}
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
        <Card
          elevation={3}
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
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
          {nodeData.attributes?.mediaType && (
            <Box
              sx={(theme) => {
                return {
                  width: 40,
                  height: 40,
                  position: "absolute",
                  top: -20,
                  left: -20,
                  borderRadius: "20%",
                  backgroundColor: theme.palette.background.paper,
                  border: `2px solid ${theme.palette.text.primary}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                };
              }}
            >
              <MediaTypeLogo
                mediaType={nodeData.attributes.mediaType as string}
              />
            </Box>
          )}
          <span>
            digest: <strong>{nodeData.name ?? "N/A"}</strong>
          </span>
          <div>media_type: {nodeData.attributes?.mediaType ?? "N/A"}</div>
          <div>
            {(arch || os) && (
              <>
                platform: <strong>{arch}</strong> {os !== "linux" ? os : null}
              </>
            )}
          </div>
          {!!config && (
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => onClick("config", config as any)}
              sx={{
                mt: 1,
                fontWeight: "bold",
                color,
                borderColor: color,
                display: "flex",
                alignItems: "center",
              }}
            >
              {config.mediaType && (
                <Box
                  sx={(theme) => {
                    return {
                      width: 24,
                      height: 24,
                      borderRadius: "20%",
                      backgroundColor: theme.palette.background.paper,
                      border: `1px solid ${color}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mr: 2,
                    };
                  }}
                >
                  <MediaTypeLogo mediaType={config.mediaType} />
                </Box>
              )}
              <Box mr={2}>View Config</Box>
              <LaunchOutlinedIcon sx={{ stroke: color, strokeWidth: 0 }} />
            </Button>
          )}
        </Card>
      </Tooltip>
    </foreignObject>
  );
}
