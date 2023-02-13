import { QueryOptions } from "@tanstack/react-query";

export function getIndexQuery(
  repo: string,
  digestOrTag: string,
  token: string
): QueryOptions<Index | Manifest> {
  return {
    queryKey: ["index", repo, digestOrTag],
    queryFn: () => fetchindex(repo, digestOrTag, token),
  };
}

export interface Manifest {
  schemaVersion: number;
  mediaType: string;
  config: {
    mediaType: string;
    size: number;
    digest: string;
  };
  layers: Array<{
    mediaType: string;
    size: number;
    digest: string;
    annotations?: {
      [key: string]: string;
    };
  }>;
}

export interface Index {
  schemaVersion: number;
  digest: string;
  contentType: string;
  manifests: Array<{
    mediaType: string;
    digest: string;
    size: number;
    platform: {
      architecture: string;
      os: string;
      variant?: string;
      features?: string[];
    };
    annotations?: {
      [key: string]: string;
    };
    manifest?: Manifest;
  }>;
}

export function isIndex(
  indexOrManifest: Index | Manifest
): indexOrManifest is Index {
  return (indexOrManifest as Index).manifests !== undefined;
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
  } as Index | Manifest;
}
