import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  CircularProgress,
  DialogContent,
  LinearProgress,
  Tooltip,
} from "@mui/material";
import AppBar from "@mui/material/AppBar";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import IconButton from "@mui/material/IconButton";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { Stack } from "@mui/system";
import { NodeType } from "./App";
import { EmptyState } from "./EmptyState";
import { FileTree } from "./FileTree";
import { JsonViewer } from "./JsonViewer";
import { useDownloadLayer } from "./useDownloadLayer";
import { useIsLoggedIn } from "./useIsLoggedIn";
import { useLayerContent } from "./useLayerContent";

function LinearProgressWithLabel({ value }: { value: number }) {
  return (
    <Stack alignItems="center" sx={{ position: "absolute", width: "100%" }}>
      <Box sx={{ display: "flex", alignItems: "center", width: "70%", mb: 3 }}>
        <Box>
          <Typography variant="body2" color="text.secondary">
            Reading file info
          </Typography>
        </Box>
        <Box sx={{ mr: 1, ml: 2, width: "80%" }}>
          <LinearProgress value={value} variant="determinate" />
        </Box>
        <Box sx={{ minWidth: 35 }}>
          <Typography variant="body2" color="text.secondary">{`${Math.round(
            value
          )}%`}</Typography>
        </Box>
      </Box>
    </Stack>
  );
}

export default function BlobDialog({
  repo,
  digest,
  mediaType,
  size,
  nodeType,
  closeDialog,
}: {
  digest: string;
  mediaType: string;
  repo: string;
  size: number;
  nodeType: NodeType;
  closeDialog: () => void;
}) {
  const downloadLayer = useDownloadLayer({
    repo,
    digest,
    mediaType,
  });

  const preview = useLayerContent({
    repo,
    digest,
    mediaType,
    size,
  });

  const isLoggedIn = useIsLoggedIn();

  const resourceName = nodeType === "config" ? "Config" : "Layer";

  return (
    <Dialog fullScreen open onClose={closeDialog}>
      <AppBar
        variant="outlined"
        enableColorOnDark
        elevation={0}
        sx={(theme) => ({
          position: "relative",
          background: theme.palette.docker.grey[100],
          color: theme.palette.text.secondary,
          border: "none",
        })}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Stack direction="row" alignItems="center">
            <IconButton
              edge="start"
              color="inherit"
              onClick={closeDialog}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6">
              {`${resourceName} Content ${preview?.text ? "Preview" : ""}`}
            </Typography>
            <Typography sx={{ ml: 2, flex: 1 }}>{digest}</Typography>
          </Stack>

          <Tooltip title={isLoggedIn ? "" : "Sign in to Download"}>
            <span>
              <Button
                variant="outlined"
                color="inherit"
                disabled={!isLoggedIn}
                onClick={() => downloadLayer()}
              >
                Download {resourceName}
              </Button>
            </span>
          </Tooltip>
        </Toolbar>
      </AppBar>
      <DialogContent>
        {!preview && (
          <EmptyState
            sx={{ height: "100%", justifyContent: "center" }}
            title={`Loading ${digest} ...`}
            image={<CircularProgress />}
          ></EmptyState>
        )}
        {preview?.progress !== undefined && (
          <LinearProgressWithLabel value={preview.progress} />
        )}
        {!!preview?.text && <pre>{preview.text}</pre>}
        {!!preview?.json && <JsonViewer json={preview.json} />}
        {!!preview?.files && <FileTree files={preview.files} />}
      </DialogContent>
    </Dialog>
  );
}
