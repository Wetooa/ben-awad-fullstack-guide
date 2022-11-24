import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { usePostsQuery } from "../generated/graphql";
import Loading from "../components/Loading";
import Layout from "../components/Layout";
import {
  Box,
  Button,
  Flex,
  Heading,
  Link,
  Stack,
  Text,
} from "@chakra-ui/react";

// ssr results in the page loading before its sent to client so loading thingy doesnt show on the client

// u can either ssr or not ssr
// with ssr, ur browser will load for a while before ur page shows so custom loading stuff in the client side will be obsolete

// without ssr, ur page would load but requests which take time will cause ur page to load for a while so u can implement custom made spinners client side if u want that to be the case

// no need to ssr everything. only ssr dynamic pages which need server requests while static pages such as login forms can be left with no ssr

export default withUrqlClient(createUrqlClient, { ssr: true })(function Home() {
  const [{ data, fetching }] = usePostsQuery({
    variables: {
      limit: 10,
      cursor: "",
    },
  });

  if (!fetching && !data) {
    return <div className="">you got query failed for some reason</div>;
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
          <Flex align="center">
            <Heading>REDDIT CLONE</Heading>
            <Link ml={"auto"} href="/create-post">
              create post
            </Link>
          </Flex>

          <br />
          <br />

          {!data ? null : (
            <Stack spacing={8}>
              {data.posts.map((p) => {
                return (
                  <Box
                    key={p.id}
                    p={5}
                    shadow="lg"
                    borderWidth="1px"
                    rounded={5}
                  >
                    <Heading fontSize="xl">{p.title}</Heading>
                    <Text mt={3}>{p.textSnippet}</Text>
                  </Box>
                );
              })}
              <Flex>
                <Button isLoading={fetching} m="auto" my={4}>
                  load more
                </Button>
              </Flex>
            </Stack>
          )}
        </Layout>
      )}
    </>
  );
});
