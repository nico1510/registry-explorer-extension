import React from "react";
import { Stack, StackProps, Typography } from "@mui/material";

interface Props {
  image: React.ReactNode;
  title: string;
  content?: React.ReactNode;
  className?: string;
  withTopMargin?: boolean;
  sx?: StackProps["sx"];
}

export function EmptyState({
  image,
  title,
  content,
  className,
  sx,
  withTopMargin,
}: Props) {
  return (
    <Stack
      alignItems="center"
      className={className}
      sx={{
        ...(sx ?? {}),
        ...(withTopMargin
          ? { marginTop: (theme) => `min(20%, ${theme.spacing(10)})` }
          : undefined),
      }}
    >
      {image}
      <Typography
        textAlign="center"
        variant="h3"
        marginTop={image ? 2 : undefined}
      >
        {title}
      </Typography>
      {content && (
        <Typography
          variant="body1"
          color="text.secondary"
          textAlign="center"
          marginTop={1}
        >
          {content}
        </Typography>
      )}
    </Stack>
  );
}
