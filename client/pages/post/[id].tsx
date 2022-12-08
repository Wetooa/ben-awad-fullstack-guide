import { Box, Flex, Heading, Text } from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import React from "react";
import EditDeletePostButtons from "../../components/EditDeletePostButtons";
import Layout from "../../components/Layout";
import Loading from "../../components/Loading";
import UpdootSection from "../../components/UpdootSection";
import { createUrqlClient } from "../../utils/createUrqlClient";
import { useGetPostFromUrl } from "../../utils/useGetPostFromUrl";

interface PostProps {}

const Post: React.FC<PostProps> = ({}) => {
  const [{ data, error, fetching }] = useGetPostFromUrl();

  if (fetching) {
    return (
      <Layout>
        <div>loading...</div>
        <Loading />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div>{error.message}</div>
      </Layout>
    );
  }

  if (!data?.post) {
    return (
      <Layout>
        <Box>Could not find post</Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Flex
        shadow={"md"}
        p={4}
        border={"1px solid black"}
        rounded={"lg"}
        gap={4}
        alignContent={"top"}
        alignItems={"start"}
      >
        <Box mt={2}>
          <UpdootSection post={data.post} />
        </Box>
        <Box>
          <Flex
            justifyContent={"space-between"}
            borderBottom={"1px solid gray"}
          >
            <Flex flexDirection={"column"} mb={4} w={"70%"}>
              <Heading>{data.post.title}</Heading>
              <Text>Posted by: {data.post.creator.username}</Text>
            </Flex>
            <Box display={"inline-flex"} w={"auto"} mr={2}>
              <EditDeletePostButtons
                postId={data.post.id}
                postCreator={data.post.creatorId}
              />
            </Box>
          </Flex>
          <Text mt={4}>{data.post.text}</Text>
        </Box>
      </Flex>
    </Layout>
  );
};
export default withUrqlClient(createUrqlClient, { ssr: true })(Post);
