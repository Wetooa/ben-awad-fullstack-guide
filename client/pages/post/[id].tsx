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
              <EditDeletePostButtons post={data.post} />
            </Box>
          </Flex>
          <Text mt={4}>{data.post.text}</Text>
        </Box>
      </Flex>

      <Box m={4} mb={20}>
        <Formik
          initialValues={{ text: "" }}
          onSubmit={async (values, { setErrors, resetForm }) => {
            const response = await reply({
              ...values,
              replyId: data.post!.id,
            });

            console.log(response);

            if (response.data?.reply.errors) {
              setErrors(toErrorMap(response.data.reply.errors));
            } else {
              resetForm();
            }
          }}
        >
          {({ isSubmitting, resetForm }) => (
            <Form>
              <Box>
                <InputField
                  name="text"
                  placeholder="Text..."
                  textarea
                  label="Reply to this post"
                  height={18}
                />

                <Box float={"right"}>
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

                <Box float={"right"}>
                  <Button
                    mt={4}
                    mr={4}
                    colorScheme="red"
                    variant="solid"
                    onClick={() => resetForm()}
                  >
                    Clear
                  </Button>
                </Box>
              </Box>
            </Form>
          )}
        </Formik>
      </Box>

      <Heading p={2} ml={2} borderBottom={"2px solid gray"}>
        Replies
      </Heading>
      <Box>
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
          {data.post?.replies.length == 0 ? (
            <Box>
              <Heading>No replies to show as of now</Heading>
              <Text>Reply!!!!</Text>
            </Box>
          ) : (
            <Box width={"100%"}>
              {data.post.replies.map((r) => {
                return (
                  <Flex
                    key={r.id}
                    borderTop={"1px solid gray"}
                    p={4}
                    gap={6}
                    alignItems={"center"}
                  >
                    <UpdootSection post={r} />
                    <Flex flexDirection={"column"}>
                      <Heading size={"md"}>{r.creator.username}</Heading>
                      <Text mt={1}>{r.text}</Text>
                    </Flex>
                    <Box ml={"auto"}>
                      <EditDeletePostButtons post={r} insidePost />
                    </Box>
                  </Flex>
                );
              })}
            </Box>
          )}
        </Flex>
      </Box>
    </Layout>
  );
};
export default withUrqlClient(createUrqlClient, { ssr: true })(Post);
