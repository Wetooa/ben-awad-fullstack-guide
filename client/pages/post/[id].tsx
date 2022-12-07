import { Box, Heading } from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import React from "react";
import Layout from "../../components/Layout";
import Loading from "../../components/Loading";
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
      <Heading mb={4}>{data.post.title}</Heading>
      {data.post.text}
    </Layout>
  );
};
export default withUrqlClient(createUrqlClient, { ssr: true })(Post);
