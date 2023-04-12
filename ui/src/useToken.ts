import { QueryOptions, useQuery, UseQueryOptions } from "@tanstack/react-query";
import { proxy } from "./main";
import { splitDockerDomain } from "./utils";

interface TokenResponse {
  token: string;
  access_token: string;
  expires_in: number;
  issued_at: string;
}

function getTokenQuery(repo: string): QueryOptions<TokenResponse> {
  const tokenPath = `/token/${repo}`;
  return {
    queryKey: [tokenPath],
    queryFn: async () => {
      const { domain, remainder } = splitDockerDomain(repo);
      const v2 = await fetch(`${proxy}https://${domain}/v2/`)
      const auth = v2.headers.get("www-authenticate");
      const realm = auth? /realm="([^"]+)"/.exec(auth)?.[1]: "https://auth.docker.io/token";
      const service = auth ?/service="([^"]+)"/.exec(auth)?.[1]?? domain: "registry.docker.io";
      const result = await fetch(
        `${proxy}${realm}?service=${service}&scope=repository:${remainder}:pull`
      );
      if (!result.ok) {
        throw new Error(`Failed to get token for ${remainder} from ${realm}`);
      }
      return result.json();
    },
  };
}

export function useToken(repo: string, opts?: UseQueryOptions<TokenResponse>) {
  return useQuery({
    ...getTokenQuery(repo),
    refetchOnMount: true,
    refetchIntervalInBackground: true,
    staleTime: 1000 * 289,
    refetchInterval: 1000 * 290,
    ...opts,
  });
}
