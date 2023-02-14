import { Box, Tooltip, useTheme } from "@mui/material";
import { SyntheticEvent } from "react";
import type { TreeNodeDatum } from "react-d3-tree/lib/types/types/common";

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
  return (
    <foreignObject
      style={{
        border: `1px solid ${color}`,
        color,
        backgroundColor,
        overflow: "auto",
        width: 610,
        height: 60,
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
        </div>
      </Tooltip>
    </foreignObject>
  );
};

export default Node;
