import throttle from "lodash/throttle";
import { useEffect, useRef, useState } from "react";
import {
  FileInfo,
  TarArchiveStreamTransformer,
} from "./TarArchiveStreamTransformer";
import { fetchBlob, streamToBlob } from "./useDownloadLayer";
import { useToken } from "./useToken";

export function useLayerContent({
  repo,
  digest,
  mediaType,
  size,
}: {
  repo: string;
  digest: string;
  mediaType: string;
  size: number;
}) {
  const { data: tokenResponse } = useToken(repo);

  const controller = useRef<AbortController>();

  const [preview, setPreview] = useState<
    | undefined
    | {
        text?: string;
        json?: unknown;
        files?: FileInfo[];
        progress?: number;
      }
  >(undefined);

  useEffect(() => {
    controller.current = new AbortController();
    fetchBlob(
      repo,
      digest,
      tokenResponse?.token ?? "",
      controller.current.signal
    ).then(async (stream) => {
      if (!stream) return setPreview(undefined);

      if (mediaType.endsWith("json")) {
        const blob = await streamToBlob(stream);
        const text = await blob.text();
        let json = null;
        try {
          json = JSON.parse(text);
        } catch (error: unknown) {
          console.error(error);
        }
        setPreview({ text: !json ? text : undefined, json, files: undefined });
      } else if (mediaType.endsWith("tar+gzip")) {
        const transformer = new TransformStream(
          new TarArchiveStreamTransformer()
        );

        let progress = 0;
        const throttledSetPreview = throttle(setPreview, 1000, {
          trailing: false,
        });

        const reader = stream
          ?.pipeThrough(
            new TransformStream({
              transform: (
                chunk: Uint8Array,
                controller: TransformStreamDefaultController<Uint8Array>
              ) => {
                progress += chunk.byteLength;
                controller.enqueue(chunk);
              },
            })
          )
          // @ts-expect-error
          .pipeThrough(new DecompressionStream("gzip"))
          .pipeThrough(transformer)
          .getReader();

        let done = false;
        let files: FileInfo[] = [];

        while (!done) {
          const result = await reader.read();
          done = result.done;
          if (result.value) files.push(result.value);
          throttledSetPreview({
            text: undefined,
            json: undefined,
            files: [...files],
            progress: (progress * 100) / size,
          });
        }

        throttledSetPreview.cancel();

        setPreview({
          text: undefined,
          json: undefined,
          files,
          progress: undefined,
        });
      } else {
        const textStream = stream.pipeThrough(new TextDecoderStream());
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
          json: undefined,
          files: undefined,
        });
      }
    });
    return () => controller.current?.abort();
  }, [repo, digest, mediaType]); // we don't want to abort the request if the token changes so we don't add it to the deps

  return preview;
}