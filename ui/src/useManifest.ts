import { QueryOptions } from "@tanstack/react-query";
import { proxy } from "./main";

export function getIndexOrManifestQuery(
  repo: string,
  digestOrTag: string,
  token: string
): QueryOptions<Index | Manifest> {
  return {
    queryKey: ["getIndexOrManifestQuery", repo, digestOrTag],
    queryFn: () => fetchIndexOrManifest(repo, digestOrTag, token),
  };
}

export interface LayerOrBlob {
  mediaType: string;
  size: number;
  digest: string;
  annotations?: {
    [key: string]: string;
  };
}

export interface ManifestConfig {
  mediaType: string;
  size: number;
  digest: string;
}

export interface Manifest {
  schemaVersion: number;
  _digestOrTag: string;
  digest: string;
  mediaType: string;
  config: ManifestConfig;
  layers: Array<LayerOrBlob>;
  blobs?: Array<LayerOrBlob>;
  manifests?: Manifest[];
  platform: {
    architecture: string;
    os: string;
    variant?: string;
    features?: string[];
  };
  annotations?: {
    [key: string]: string;
  };
  _manifest?: Manifest;
}

export interface Index {
  schemaVersion: number;
  _digestOrTag: string;
  digest: string;
  contentType: string;
  manifests: Manifest[];
}

export function isIndex(
  indexOrManifest: Index | Manifest
): indexOrManifest is Index {
  return (indexOrManifest as Index).manifests !== undefined;
}

async function fetchIndexOrManifest(
  repo: string,
  digestOrTag: string,
  token: string
) {
  const result = await fetch(
    `${proxy}https://registry-1.docker.io/v2/${repo}/manifests/${digestOrTag}`,
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
    _digestOrTag: digestOrTag,
    ...body,
  } as Index | Manifest;
}
