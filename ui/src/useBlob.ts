import { useEffect, useRef } from "react";
import { proxy } from "./main";

export function downloadBlob(blob: Blob, fileName = "download.x") {
  const blobUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = blobUrl;
  link.setAttribute("download", fileName);
  link.click();
  window.URL.revokeObjectURL(blobUrl);
}

export async function streamToBlob(stream: ReadableStream) {
  const reader = stream.getReader();
  let done = false;
  const data = [];

  while (!done) {
    const result = await reader.read();
    done = result.done;
    if (result.value) {
      data.push(result.value);
    }
  }

  return new Blob(data);
}

async function fetchBlob(
  repo: string,
  digest: string,
  token: string,
  signal: AbortSignal
) {
  const result = await fetch(
    `${proxy}https://registry-1.docker.io/v2/${repo}/blobs/${digest}`,
    {
      headers: {
        Accept:
          "application/vnd.oci.image.index.v1+json,application/vnd.oci.image.manifest.v1+json,application/vnd.docker.distribution.manifest.list.v2+json,application/vnd.docker.distribution.manifest.v2+json",
        Authorization: `Bearer ${token}`,
      },
      signal,
    }
  );
  return result.body;
}

export function useLayerPreview({
  repo,
  digest,
  mediaType,
  token,
}: {
  repo: string;
  digest: string;
  token: string;
  mediaType: string;
}) {
  const controller = useRef<AbortController>(new AbortController());
  useEffect(() => {
    controller.current = new AbortController();
    return () => controller.current?.abort();
  }, []);

  return () =>
    downloadLayer({
      repo,
      digest,
      mediaType,
      token,
      signal: controller.current.signal,
    });
}

export function useDownloadLayer({
  repo,
  digest,
  mediaType,
  token,
}: {
  repo: string;
  digest: string;
  token: string;
  mediaType: string;
}) {
  const controller = useRef<AbortController>(new AbortController());
  useEffect(() => {
    controller.current = new AbortController();
    return () => controller.current?.abort();
  }, []);

  return () =>
    downloadLayer({
      repo,
      digest,
      mediaType,
      token,
      signal: controller.current.signal,
    });
}

async function downloadLayer({
  repo,
  digest,
  mediaType,
  token,
  signal,
}: {
  repo: string;
  digest: string;
  token: string;
  mediaType: string;
  signal: AbortSignal;
}) {
  const blobStream = await fetchBlob(repo, digest, token, signal);
  if (blobStream) {
    const blob = await streamToBlob(blobStream);
    downloadBlob(
      blob,
      `${digest}${
        mediaType.endsWith("gzip")
          ? ".tar.gzip"
          : mediaType.endsWith("json")
          ? ".json"
          : ""
      }`
    );
  }
}
