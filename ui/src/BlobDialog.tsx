import CloseIcon from "@mui/icons-material/Close";
import { CircularProgress, DialogContent } from "@mui/material";
import AppBar from "@mui/material/AppBar";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import IconButton from "@mui/material/IconButton";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { EmptyState } from "./EmptyState";
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
      <AppBar sx={{ position: "relative" }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={closeDialog}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
          <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
            Layer Content Preview {digest}
          </Typography>
          <Button color="inherit" onClick={() => downloadLayer()}>
            Download Layer
          </Button>
        </Toolbar>
      </AppBar>
      <DialogContent>
        {!preview ? (
          <EmptyState
            sx={{ height: "100%", justifyContent: "center" }}
            title={`Loading ${digest} ...`}
            image={<CircularProgress />}
          ></EmptyState>
        ) : (
          <pre>{preview?.text ?? JSON.stringify(preview.json)}</pre>
        )}
      </DialogContent>
    </Dialog>
  );
}
