import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";
import Loading from "../components/Loading";
import Layout from "../components/Layout";
import { Box, Button, Flex, Link, Stack, Text } from "@chakra-ui/react";
import { useState } from "react";
import { usePostsQuery } from "../generated/graphql";
import UpdootSection from "../components/UpdootSection";
import EditDeletePostButtons from "../components/EditDeletePostButtons";

// ssr results in the page loading before its sent to client so loading thingy doesnt show on the client

// u can either ssr or not ssr
// with ssr, ur browser will load for a while before ur page shows so custom loading stuff in the client side will be obsolete

// without ssr, ur page would load but requests which take time will cause ur page to load for a while so u can implement custom made spinners client side if u want that to be the case

// no need to ssr everything. only ssr dynamic pages which need server requests while static pages such as login forms can be left with no ssr

export default withUrqlClient(createUrqlClient, { ssr: true })(function Home() {
  const [variables, setVariables] = useState({
    limit: 15,
    cursor: "",
  });

  const [{ data, fetching, error, stale }] = usePostsQuery({ variables });

  if (!fetching && !data) {
    return (
      <Layout>
        <div className="">you got query failed for some reason</div>
        <div>{error?.message}</div>
      </Layout>
    );
  }

  return (
    <>
      {!data && fetching ? (
        <>
          <div className="">...loading</div>
          <Loading />
        </>
      ) : (
        <Layout>
          {!data ? null : (
            <Stack spacing={8} mt={8}>
              {data.posts.posts.map((p) =>
                !p ? null : (
                  <Box
                    key={p.id}
                    p={4}
                    shadow="lg"
                    borderWidth="1px"
                    rounded={5}
                  >
                    <Flex gap={4}>
                      <UpdootSection post={p} />

                      <Flex
                        width={"100%"}
                        mr={2}
                        justifyContent={"space-between"}
                      >
                        <Flex flexDirection={"column"} width={"75%"}>
                          <Link fontSize="xl" href={`/post/${p.id}`}>
                            {p.title}
                          </Link>
                          <Text mt={3}>{p.textSnippet}</Text>
                        </Flex>
                        <Flex flexDirection={"column"} gap={3}>
                          <Text>Posted by: {p.creator.username}</Text>
                          <EditDeletePostButtons post={p} />
                        </Flex>
                      </Flex>
                    </Flex>
                  </Box>
                )
              )}

              {data.posts.hasMore && (
                <Flex>
                  <Button
                    isLoading={stale}
                    m="auto"
                    my={4}
                    onClick={() =>
                      setVariables({
                        limit: variables.limit,
                        // basically we get the last thing in out current cached data then get the ones after it gets???
                        cursor:
                          data.posts.posts[data.posts.posts.length - 1]
                            .createdAt,
                      })
                    }
                  >
                    load more
                  </Button>
                  <br />
                </Flex>
              )}
            </Stack>
          )}
        </Layout>
      )}
    </>
  );
});
