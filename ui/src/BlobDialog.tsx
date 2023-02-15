import CloseIcon from "@mui/icons-material/Close";
import { CircularProgress, DialogContent } from "@mui/material";
import AppBar from "@mui/material/AppBar";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import IconButton from "@mui/material/IconButton";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import type { HierarchyPointNode } from "d3-hierarchy";
import { useEffect } from "react";
import { TreeNodeDatum } from "react-d3-tree/lib/types/types/common";
import { EmptyState } from "./EmptyState";
import { useBlob } from "./useBlob";
import type { Manifest } from "./useManifest";
import { useToken } from "./useToken";

export default function BlobDialog({
  node,
  repo,
  closeDialog,
}: {
  node: HierarchyPointNode<TreeNodeDatum>;
  repo: string;
  closeDialog: () => void;
}) {
  const { data: tokenResponse, isLoading: isLoadingToken } = useToken(repo);
  const layer = node.data.attributes as any as Manifest["layers"][number];
  const { data: blobStream, isLoading } = useBlob(
    { repo, digest: layer.digest, token: tokenResponse?.token ?? "" },
    { enabled: !!tokenResponse }
  );

  useEffect(() => {
    const reader = blobStream?.getReader();
    reader?.read().then(function processResult(result) {
      if (result.done) {
        return;
      }
      console.log(result.value);
      reader.read().then(processResult);
    });

    return () => {
      reader?.cancel();
      reader?.releaseLock();
      blobStream?.cancel();
    };
  }, [blobStream]);

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
          <Typography
            sx={{ ml: 2, flex: 1 }}
            variant="h6"
            component="div"
          ></Typography>
          <Button autoFocus color="inherit" onClick={closeDialog}>
            Download
          </Button>
        </Toolbar>
      </AppBar>
      <DialogContent>
        {isLoading || isLoadingToken ? (
          <EmptyState
            sx={{ height: "100%", justifyContent: "center" }}
            title={`Loading ${layer.digest} ...`}
            image={<CircularProgress />}
          ></EmptyState>
        ) : (
          "text"
        )}
      </DialogContent>
    </Dialog>
  );
}
