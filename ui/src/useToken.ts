import { QueryOptions } from "@tanstack/react-query";
import { proxy } from "./main";

export interface TokenResponse {
  token: string;
  access_token: string;
  expires_in: number;
  issued_at: string;
}

export function getTokenQuery(repo: string): QueryOptions<TokenResponse> {
  const tokenPath = `/token/${repo}`;
  return {
    queryKey: [tokenPath],
    queryFn: async () =>
      (
        await fetch(
          `${proxy}https://auth.docker.io/token?service=registry.docker.io&scope=repository:${repo}:pull`
        )
      ).json(),
  };
}