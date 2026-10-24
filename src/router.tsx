import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        // Cache data for 5 minutes before considering it stale
        staleTime: 5 * 60 * 1000,
        // Retry failed queries up to 3 times with exponential backoff
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        // Don't refetch on window focus (user may be on slow/metered connection)
        refetchOnWindowFocus: false,
        // Refetch on reconnect only if data is stale
        refetchOnReconnect: true,
      },
      mutations: {
        // Disable mutation retries - mutations may not be idempotent
        // (e.g., creating a protocol, toggling a check)
        // A timeout after the server commits could cause duplicates
        retry: false,
      },
    },
  });

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  return router;
};
