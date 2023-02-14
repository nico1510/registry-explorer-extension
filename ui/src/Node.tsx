import { Box, Stack, Tooltip, Typography, useTheme } from "@mui/material";
import { SyntheticEvent } from "react";
import type { TreeNodeDatum } from "react-d3-tree/lib/types/types/common";
import { Manifest } from "./useIndex";

const Node = ({
  nodeData,
  onClick,
}: {
  nodeData: TreeNodeDatum;
  onClick: (evt: SyntheticEvent) => void;
}) => {
  const theme = useTheme();
  const backgroundColor = nodeData.attributes?._isLayer
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
      onClick={onClick}
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
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <strong>digest: {nodeData.name}</strong>
          media_type: {nodeData.attributes?.mediaType}
          {!!config && (
            <Stack
              padding={0.5}
              sx={{ border: `1px dashed ${color}`, position: "relative" }}
            >
              <Typography sx={{ position: "absolute", top: -18 }}>
                config
              </Typography>
              <div>digest: {config.digest}</div>
              <div>media_type: {config.mediaType}</div>
            </Stack>
          )}
        </div>
      </Tooltip>
    </foreignObject>
  );
};

export default Node;
