import { QueryOptions } from "@tanstack/react-query";

export function getIndexQuery(
  repo: string,
  tag: string,
  token: string
): QueryOptions<Index> {
  return {
    queryKey: ["index", repo, tag],
    queryFn: () => fetchindex(repo, tag, token),
  };
}

export interface Index {
  schemaVersion: number;
  digest: string;
  contentType: string;
  manifests?: Array<{
    mediaType: string;
    digest: string;
    size: number;
    platform: {
      architecture: string;
      os: string;
      variant?: string;
      features?: string[];
    };
  }>;
}

async function fetchindex(repo: string, tag: string, token: string) {
  const result = await fetch(
    `http://0.0.0.0:8080/https://registry-1.docker.io/v2/${repo}/manifests/${tag}`,
    //`http://0.0.0.0:8080/https://registry-1.docker.io/v2/${repo}/manifests/${tag}`,
    {
      headers: {
        Accept:
          "application/vnd.oci.image.index.v1+json,application/vnd.oci.image.manifest.v1+json,application/vnd.docker.distribution.manifest.list.v2+json,application/vnd.docker.distribution.manifest.v2+json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  const body = await result.json();
  return {
    digest: result.headers.get("docker-content-digest"),
    contentType: result.headers.get("content-type"),
    ...body,
  } as Index;
}
