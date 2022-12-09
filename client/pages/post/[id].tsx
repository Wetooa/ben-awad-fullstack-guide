import { Box, Button, Flex, Heading, Text } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { withUrqlClient } from "next-urql";
import React from "react";
import EditDeletePostButtons from "../../components/EditDeletePostButtons";
import InputField from "../../components/InputField";
import Layout from "../../components/Layout";
import Loading from "../../components/Loading";
import UpdootSection from "../../components/UpdootSection";
import { useReplyMutation } from "../../generated/graphql";
import { createUrqlClient } from "../../utils/createUrqlClient";
import { toErrorMap } from "../../utils/toErrorMap";
import { useGetPostFromUrl } from "../../utils/useGetPostFromUrl";

interface PostProps {}

const Post: React.FC<PostProps> = ({}) => {
  const [{ data, error, fetching }] = useGetPostFromUrl();
  const [{}, reply] = useReplyMutation();

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
        <Box width={"80%"}>
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

      <Flex mt={4}>
        <Formik
          initialValues={{ text: "" }}
          onSubmit={async (values, { setErrors, resetForm }) => {
            const response = await reply({
              ...values,
              postId: data.post?.id,
              replyId: null,
            });

            console.log(response);

            if (response.data?.reply.errors) {
              setErrors(toErrorMap(response.data.reply.errors));
            } else {
              resetForm({ values: "" });
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form>
              <InputField
                name="text"
                placeholder="Text..."
                textarea
                label="Reply to this post"
              />

              <Box>
                <Button
                  isLoading={isSubmitting}
                  mt={4}
                  type="submit"
                  colorScheme="teal"
                  variant="solid"
                >
                  Reply
                </Button>
              </Box>
            </Form>
          )}
        </Formik>
      </Flex>

      {data.post.replies.length > 0 && (
        <Flex
          mt={4}
          flexDirection={"column"}
          shadow={"md"}
          p={4}
          border={"1px solid black"}
          rounded={"lg"}
          gap={3}
          alignContent={"top"}
          alignItems={"start"}
        >
          {data.post.replies.map((r) => {
            return (
              <Box key={r.id} borderTop={"1px solid gray"} width={"100%"} p={2}>
                <Heading size={"lg"}>{r.creator.username}</Heading>
                <Text>{r.text}</Text>
              </Box>
            );
          })}
        </Flex>
      )}
    </Layout>
  );
};
export default withUrqlClient(createUrqlClient, { ssr: true })(Post);
