import { useEffect, useRef, useState } from "react";
import { proxy } from "./main";
import { useToken } from "./useToken";

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
}: {
  repo: string;
  digest: string;
  mediaType: string;
}) {
  const { data: tokenResponse } = useToken(repo);

  const controller = useRef<AbortController>(new AbortController());

  const [preview, setPreview] = useState<{
    text: string | null;
    json: unknown | null;
  } | null>(null);

  useEffect(() => {
    controller.current = new AbortController();
    fetchBlob(
      repo,
      digest,
      tokenResponse?.token ?? "",
      controller.current.signal
    ).then(async (stream) => {
      if (!stream) return setPreview(null);

      if (mediaType.endsWith("json")) {
        const blob = await streamToBlob(stream);
        const text = await blob.text();
        let json = null;
        try {
          json = JSON.parse(text);
        } catch (error: unknown) {
          console.error(error);
        }
        setPreview({ text: !json ? text : null, json });
      } else {
        const unzippedStream = mediaType.endsWith("gzip")
          ? //@ts-expect-error
            stream.pipeThrough(new DecompressionStream("gzip"))
          : stream;
        const textStream = unzippedStream.pipeThrough(new TextDecoderStream());
        const reader = textStream.getReader();
        let done = false;
        let data = "";

        while (!done) {
          const result = await reader.read();
          done = result.done || data.length >= 5120;
          if (result.value) {
            data += result.value;
          }
        }

        setPreview({
          text: data,
          json: null,
        });
      }
    });
    return () => controller.current?.abort();
  }, [repo, digest, mediaType, tokenResponse]);

  return preview;
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
      token: tokenResponse?.token ?? "",
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
