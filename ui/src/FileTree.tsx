import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import FolderIcon from "@mui/icons-material/Folder";
import TreeItem, { treeItemClasses, TreeItemProps } from "@mui/lab/TreeItem";
import TreeView from "@mui/lab/TreeView";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import { SvgIconProps } from "@mui/material/SvgIcon";
import Typography from "@mui/material/Typography";
import * as React from "react";
import { FileInfo } from "./TarArchiveStreamTransformer";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import prettyBytes from "pretty-bytes";

type StyledTreeItemProps = TreeItemProps & {
  bgColor?: string;
  color?: string;
  labelIcon: React.ElementType<SvgIconProps>;
  labelInfo?: string;
  labelText: string;
};

type FileTree = FileInfo & { children?: FileTree[]; name: string };

const StyledTreeItemRoot = styled(TreeItem)(({ theme }) => ({
  color: theme.palette.text.secondary,
  [`& .${treeItemClasses.content}`]: {
    color: theme.palette.text.secondary,
    borderTopRightRadius: theme.spacing(2),
    borderBottomRightRadius: theme.spacing(2),
    paddingRight: theme.spacing(1),
    fontWeight: theme.typography.fontWeightMedium,
    "&.Mui-expanded": {
      fontWeight: theme.typography.fontWeightRegular,
    },
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    },
    [`& .${treeItemClasses.label}`]: {
      fontWeight: "inherit",
      color: "inherit",
    },
  },
}));

function StyledTreeItem(props: StyledTreeItemProps) {
  const {
    bgColor,
    color,
    labelIcon: LabelIcon,
    labelInfo,
    labelText,
    ...other
  } = props;

  return (
    <StyledTreeItemRoot
      label={
        <Box sx={{ display: "flex", alignItems: "center", p: 0.5, pr: 0 }}>
          <Box component={LabelIcon} color="inherit" sx={{ mr: 1 }} />
          <Typography
            variant="body2"
            sx={{ fontWeight: "inherit", flexGrow: 1 }}
          >
            {labelText}
          </Typography>
          <Typography variant="caption" color="inherit">
            {labelInfo}
          </Typography>
        </Box>
      }
      {...other}
    />
  );
}

function Directory({ file }: { file: FileTree }) {
  return (
    <StyledTreeItem
      sx={{
        marginLeft: 1,
        [`& .${treeItemClasses.content}`]: {
          paddingLeft: 2,
        },
      }}
      nodeId={file.path}
      labelText={file.name}
      labelInfo={file.type !== "directory" ? prettyBytes(file.size) : undefined}
      labelIcon={file.type === "directory" ? FolderIcon : InsertDriveFileIcon}
    >
      {!file.children?.length
        ? null
        : file.children.map((child) => (
            <Directory key={child.path} file={child} />
          ))}
    </StyledTreeItem>
  );
}

export function FileTree({ files }: { files: FileInfo[] }) {
  const fileTree = React.useMemo(() => createFileTree(files), [files]);
  return (
    <TreeView
      defaultExpanded={fileTree.children?.map((c) => c.path)}
      defaultCollapseIcon={<ArrowDropDownIcon />}
      defaultExpandIcon={<ArrowRightIcon />}
      defaultEndIcon={<div style={{ width: 24 }} />}
    >
      {fileTree.children?.map((child) => (
        <Directory key={child.path} file={child} />
      ))}
    </TreeView>
  );
}

function createFileTree(
  files: FileInfo[],
  tree: FileTree = {
    path: "root",
    name: "root",
    type: "directory",
    size: 0,
    children: [],
  }
): FileTree {
  for (const file of files) {
    const path = file.path.split("/").filter((p) => !!p);
    const dirs = path.slice(0, -1);
    const name = path.at(-1) ?? "";
    if (dirs.length === 0) {
      tree.children?.push({ ...file, name, children: [] });
    } else {
      let current = tree;
      for (const dir of dirs) {
        const child = current.children?.find((c) => c.name === dir);
        if (child) {
          current = child;
        }
      }
      current.children?.push({
        ...file,
        name,
        children: [],
      });
    }
  }
  return tree;
}
