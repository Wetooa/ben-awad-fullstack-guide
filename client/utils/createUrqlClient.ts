import { cacheExchange, Resolver } from "@urql/exchange-graphcache";
import {
  dedupExchange,
  fetchExchange,
  stringifyVariables,
  Exchange,
  gql,
} from "urql";
import {
  LoginMutation,
  LogoutMutation,
  MeDocument,
  MeQuery,
  RegisterMutation,
  VoteMutationVariables,
} from "../generated/graphql";
import { betterUpdateQuery } from "./betterUpdateQuery";
import { pipe, tap } from "wonka";
import Router from "next/router";

// error handling
// basically if we recieve an error from the server, we run this then send user to login

export const errorExchange: Exchange =
  ({ forward }) =>
  (ops$) => {
    return pipe(
      forward(ops$),
      tap(({ error }) => {
        if (error?.message.includes("not authenticated")) {
          Router.replace("/login");
        }
      })
    );
  };

export const cursorPagination = (): Resolver => {
  return (_parent, fieldArgs, cache, info) => {
    const { parentKey: entityKey, fieldName } = info;

    // with this we get the fields in our query
    const allFields = cache.inspectFields(entityKey);

    // then we get all the fields that we care about
    const fieldInfos = allFields.filter((info) => info.fieldName === fieldName);

    const size = fieldInfos.length;
    if (size === 0) {
      return undefined;
    }

    const fieldKey = `${fieldName}(${stringifyVariables(fieldArgs)})`;
    const isInCache = cache.resolve(
      cache.resolve(entityKey, fieldKey) as string,
      "posts"
    );

    info.partial = !isInCache;

    const results: string[] = [];
    let hasMore = true;

    fieldInfos.forEach((fi) => {
      const key = cache.resolve(entityKey, fi.fieldKey) as string;
      const data = cache.resolve(key, "posts") as string[];
      const _hasMore = cache.resolve(key, "hasMore");

      // loop through all of the posts then if one has falst as hasMore then we return false g???
      if (!_hasMore) {
        hasMore = _hasMore as boolean;
      }
      results.push(...data);
    });

    return {
      __typename: "PaginatedPosts",
      hasMore,
      posts: results,
    };

    // then we get the cursor
    //   const visited = new Set();
    //   let result: NullArray<string> = [];
    //   let prevOffset: number | null = null;

    //   for (let i = 0; i < size; i++) {
    //     const { fieldKey, arguments: args } = fieldInfos[i];
    //     if (args === null || !compareArgs(fieldArgs, args)) {
    //       continue;
    //     }

    //     const links = cache.resolve(entityKey, fieldKey) as string[];
    //     const currentOffset = args[cursorArgument];

    //     if (
    //       links === null ||
    //       links.length === 0 ||
    //       typeof currentOffset !== "number"
    //     ) {
    //       continue;
    //     }

    //     const tempResult: NullArray<string> = [];

    //     for (let j = 0; j < links.length; j++) {
    //       const link = links[j];
    //       if (visited.has(link)) continue;
    //       tempResult.push(link);
    //       visited.add(link);
    //     }

    //     if (
    //       (!prevOffset || currentOffset > prevOffset) ===
    //       (mergeMode === "after")
    //     ) {
    //       result = [...result, ...tempResult];
    //     } else {
    //       result = [...tempResult, ...result];
    //     }

    //     prevOffset = currentOffset;
    //   }

    //   const hasCurrentPage = cache.resolve(entityKey, fieldName, fieldArgs);
    //   if (hasCurrentPage) {
    //     return result;
    //   } else if (!(info as any).store.schema) {
    //     return undefined;
    //   } else {
    //     info.partial = true;
    //     return result;
    //   }
  };
};

const isServer = typeof window === "undefined";

export const createUrqlClient = (ssrExchange: any, ctx: any) => {
  let cookie = undefined;
  if (isServer) cookie = ctx?.req?.headers?.cookie;

  return {
    url: "http://localhost:5000/graphql",
    fetchOptions: {
      credentials: "include" as const,
      headers: { cookie },
    },

    // do this to update apollo cache so we get updated me query and homepage
    exchanges: [
      dedupExchange,
      cacheExchange({
        keys: {
          PaginatedPosts: () => null,
        },
        resolvers: {
          Query: {
            // this runs evertime we run posts query
            posts: cursorPagination(),
          },
        },
        updates: {
          // i have no idea what this all means btw hahahah

          Mutation: {
            updatePost: (_result, args, cache, _info) => {
              const { id } = args;

              cache.invalidate({
                __typename: "Post",
                id: JSON.stringify(id),
              });
            },

            deletePost: (_result, args, cache, _info) => {
              const { id } = args;

              cache.invalidate({
                __typename: "Post",
                id: JSON.stringify(id),
              });
            },

            vote: (_result, args, cache, _info) => {
              // so like we get the shit in the cache
              // HAHAHAHAHHA I HAVE CONQUERED YOU URQL CLIENT!!!!!

              const { postId, value } = args as VoteMutationVariables;
              const data = cache.readFragment(
                gql`
                  fragment _ on Post {
                    id
                    points
                    voteStatus
                  }
                `,
                { id: postId }
              );

              if (data) {
                let newPoints;
                let newVoteStatus;

                if (data.voteStatus === null) {
                  // if we dont have a vote status yet
                  newPoints = data.points + value;
                  newVoteStatus = value;
                } else if (data.voteStatus === value) {
                  // if we vote on the same one
                  newPoints = data.points - value;
                  newVoteStatus = null;
                } else {
                  // if we vote the other one
                  newPoints = data.points + value * 2;
                  newVoteStatus = -1 * data.voteStatus;
                }

                cache.writeFragment(
                  gql`
                    fragment _ on Post {
                      points
                      voteStatus
                    }
                  `,
                  { id: postId, points: newPoints, voteStatus: newVoteStatus }
                );
              }
            },

            createPost: (_result, _args, cache, _info) => {
              // the big idea why we do this is becuz we added our new psot on top, but it might mean that a new post arrived earlier and we just didnt reload it so we like say hey there might be new ones so invalidate all the posts saved in the cache when we make a post gets g???

              const allFields = cache.inspectFields("Query");
              const fieldInfos = allFields.filter(
                (info) => info.fieldName === "posts"
              );

              // why the fuck did this go back in time wtffff
              // spent so much time on this bullshit getting sent back on time
              fieldInfos.forEach((fi) => {
                cache.invalidate("Query", "posts", fi.arguments || {});
              });
            },

            logout: (_result, _args, cache, _info) => {
              // me query
              betterUpdateQuery<LogoutMutation, MeQuery>(
                cache,
                { query: MeDocument },
                _result,
                (_result, _query) => ({ me: null })
              );

              const allFields = cache.inspectFields("Query");
              const fieldInfos = allFields.filter(
                (info) => info.fieldName === "posts"
              );

              fieldInfos.forEach((fi) => {
                cache.invalidate("Query", "posts", fi.arguments || {});
              });
            },

            login: (_result, _args, cache, _info) => {
              const allFields = cache.inspectFields("Query");
              const fieldInfos = allFields.filter(
                (info) => info.fieldName === "posts"
              );

              fieldInfos.forEach((fi) => {
                cache.invalidate("Query", "posts", fi.arguments || {});
              });

              betterUpdateQuery<LoginMutation, MeQuery>(
                cache,
                { query: MeDocument },
                _result,
                (result, query) => {
                  if (result.login.errors) {
                    return query;
                  } else return { me: result.login.user };
                }
              );
            },

            register: (_result, _args, cache, _info) => {
              betterUpdateQuery<RegisterMutation, MeQuery>(
                cache,
                { query: MeDocument },
                _result,
                (result, query) => {
                  if (result.register.errors) {
                    return query;
                  } else return { me: result.register.user };
                }
              );
            },
          },
        },
      }),
      errorExchange,
      ssrExchange,
      fetchExchange,
    ],
  };
};
