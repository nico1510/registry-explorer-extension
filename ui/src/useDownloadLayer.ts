import { useEffect, useRef } from "react";
import { proxy } from "./main";
import { useToken } from "./useToken";
import { splitDockerDomain } from "./utils";

function downloadBlob(blob: Blob, fileName: string) {
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

export async function fetchBlob(
  repo: string,
  digest: string,
  token: string,
  signal?: AbortSignal
) {
  const {domain, remainder} = splitDockerDomain(repo);

  const result = await fetch(
    `${proxy}https://${domain}/v2/${remainder}/blobs/${digest}`,
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

export function useDownloadLayer({
  repo,
  digest,
  mediaType,
}: {
  repo: string;
  digest: string;
  mediaType: string;
}) {
  const { data: tokenResponse } = useToken(repo);

  const controller = useRef<AbortController>();
  useEffect(() => {
    controller.current = new AbortController();
    return () => controller.current?.abort();
  }, []);

  return () =>
    downloadLayer({
      repo,
      digest,
      mediaType,
      token: tokenResponse?.token ?? "",
      signal: controller.current?.signal,
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
  signal?: AbortSignal;
}) {
  const blobStream = await fetchBlob(repo, digest, token, signal);
  if (blobStream) {
    const blob = await streamToBlob(blobStream);
    downloadBlob(
      blob,
      `${digest}${
        mediaType.endsWith("tar+gzip")
          ? ".tar.gzip"
          : mediaType.split("+").length > 1
          ? `.${mediaType.split("+").at(-1)}`
          : ""
      }`
    );
  }
}
