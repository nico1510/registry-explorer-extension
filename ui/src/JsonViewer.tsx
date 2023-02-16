import { Box, useTheme } from "@mui/material";
import { JSONTree } from "react-json-tree";
import jsonTheme from "react-json-tree/src/themes/solarized";

export function JsonViewer({ json }: { json: any }) {
  const theme = useTheme();

  const newTheme = {
    ...jsonTheme,
    base00: theme.palette.background.default,
    base0D: theme.palette.text.primary,
    base0B: jsonTheme.base0D,
  };
  return (
    <Box
      sx={{
        "& ul": {
          padding: "8px !important",
        },
      }}
    >
      <JSONTree
        shouldExpandNodeInitially={(keyPath, data, level) => true}
        collectionLimit={1000}
        theme={newTheme}
        data={json}
      />
    </Box>
  );
}
