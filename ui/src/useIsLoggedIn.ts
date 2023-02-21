import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

export function useIsLoggedIn() {
  const [data, setData] = useState(false);
  const { data: isLoggedIn } = useQuery({
    queryKey: ["useIsLoggedIn"],
    queryFn: async () => {
      try {
        const ddClient = (
          await import("@docker/extension-api-client")
        ).createDockerDesktopClient();
        const response = await ddClient.docker.cli.exec("login", []);
        return !!response
          .lines()
          .find((line) => line.includes("Login Succeeded"));
      } catch (error) {
        console.error(error);
        return false;
      }
    },
    refetchOnWindowFocus: true,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 5,
    enabled: !data,
  });
  useEffect(() => setData(!!isLoggedIn), [isLoggedIn]);
  return data;
}
