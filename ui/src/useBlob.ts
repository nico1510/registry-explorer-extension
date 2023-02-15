import { QueryOptions, useQuery, UseQueryOptions } from "@tanstack/react-query";
import { proxy } from "./main";

function getBlobQuery(
  repo: string,
  digest: string,
  token: string
): QueryOptions<ReadableStream<Uint8Array> | null> {
  return {
    queryKey: ["index", repo, digest],
    queryFn: ({ signal }) => fetchBlob(repo, digest, token, signal),
  };
}

async function fetchBlob(
  repo: string,
  digest: string,
  token: string,
  signal: AbortSignal | undefined
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

export function useBlob(
  {
    repo,
    digest: digest,
    token,
  }: { repo: string; digest: string; token: string },
  opts?: UseQueryOptions<ReadableStream<Uint8Array> | null>
) {
  return useQuery({
    ...getBlobQuery(repo, digest, token),
    ...opts,
  });
}
