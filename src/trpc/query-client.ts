import {
  defaultShouldDehydrateQuery,
  matchQuery,
  MutationCache,
  QueryClient,
  type QueryKey,
} from "@tanstack/react-query";
// import superjson from "superjson";
export function makeQueryClient() {
  const queryClient = new QueryClient({
    mutationCache: new MutationCache({
      onSuccess: (_data, _variables, _context, mutation) => {
        queryClient.invalidateQueries({
          predicate: (query) =>
            // invalidate all matching tags at once
            // or everything if no meta is provided
            mutation.meta?.invalidateQueries?.some((queryKey) =>
              matchQuery({ queryKey }, query)
            ) ?? true,
        });
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000,
      },
      dehydrate: {
        // serializeData: superjson.serialize,
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
      },
      hydrate: {
        // deserializeData: superjson.deserialize,
      },
    },
  });
  return queryClient;
}

declare module "@tanstack/react-query" {
  interface Register {
    mutationMeta: {
      invalidateQueries?: QueryKey[];
    };
  }
}
