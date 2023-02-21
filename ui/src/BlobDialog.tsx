import CloseIcon from "@mui/icons-material/Close";
import { CircularProgress, DialogContent } from "@mui/material";
import AppBar from "@mui/material/AppBar";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import IconButton from "@mui/material/IconButton";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { Stack } from "@mui/system";
import { EmptyState } from "./EmptyState";
import { FileTree } from "./FileTree";
import { JsonViewer } from "./JsonViewer";
import { useDownloadLayer, useLayerPreview } from "./useBlob";

export default function BlobDialog({
  repo,
  digest,
  mediaType,
  closeDialog,
}: {
  digest: string;
  mediaType: string;
  repo: string;
  closeDialog: () => void;
}) {
  const downloadLayer = useDownloadLayer({
    repo,
    digest,
    mediaType,
  });

  const preview = useLayerPreview({
    repo,
    digest,
    mediaType,
  });

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
              Layer Content Preview
            </Typography>
            <Typography sx={{ ml: 2, flex: 1 }}>{digest}</Typography>
          </Stack>

          <Button
            variant="outlined"
            color="inherit"
            onClick={() => downloadLayer()}
          >
            Download Layer
          </Button>
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
        {!!preview?.text && <pre>{preview.text}</pre>}
        {!!preview?.json && <JsonViewer json={preview.json} />}
        {!!preview?.files && <FileTree files={preview.files} />}
      </DialogContent>
    </Dialog>
  );
}
