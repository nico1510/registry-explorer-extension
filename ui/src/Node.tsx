import { Tooltip } from "@mui/material";
import { SyntheticEvent } from "react";
import type { TreeNodeDatum } from "react-d3-tree/lib/types/types/common";

const Node = ({
  nodeData,
  onClick,
}: {
  nodeData: TreeNodeDatum;
  onClick: (evt: SyntheticEvent) => void;
}) => {
  return (
    <foreignObject
      style={{
        border: "1px solid black",
        color: "black",
        backgroundColor: nodeData.attributes?._isLayer
          ? "green"
          : "rgb(248, 248, 255)",
        overflow: "auto",
        width: 610,
        height: 60,
      }}
      y={-30}
      onClick={onClick}
    >
      <Tooltip
        classes={{ tooltip: "tooltip" }}
        placement="bottom-start"
        disableInteractive={false}
        title={
          <pre>
            {JSON.stringify(
              nodeData.attributes,
              (key, value) => (key.startsWith("_") ? undefined : value),
              2
            )}
          </pre>
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
