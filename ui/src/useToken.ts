import { QueryOptions, useQuery, UseQueryOptions } from "@tanstack/react-query";
import { proxy } from "./main";

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
      const result = await fetch(
        `${proxy}https://auth.docker.io/token?service=registry.docker.io&scope=repository:${repo}:pull`
      );
      if (!result.ok) {
        throw new Error(`Failed to get token for ${repo}`);
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
