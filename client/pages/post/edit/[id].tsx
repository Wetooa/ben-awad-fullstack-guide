import React from "react";
import InputField from "../../../components/InputField";
import Layout from "../../../components/Layout";
import Loading from "../../../components/Loading";
import { Box, Button } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import { useUpdatePostMutation } from "../../../generated/graphql";
import { createUrqlClient } from "../../../utils/createUrqlClient";
import { toErrorMap } from "../../../utils/toErrorMap";
import { useGetPostFromUrl } from "../../../utils/useGetPostFromUrl";
import { useGettingIntId } from "../../../utils/useGettingIntId";

interface EditProps {}

const Edit: React.FC<EditProps> = ({}) => {
  const router = useRouter();
  const intId = useGettingIntId();
  const [{ data, fetching, error }] = useGetPostFromUrl();
  const [{}, updatePost] = useUpdatePostMutation();

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
    <Layout variant="small">
      <Formik
        initialValues={{ title: data.post.title, text: data.post.text }}
        onSubmit={async (values, { setErrors }) => {
          const response = await updatePost({
            input: values,
            updatePostId: intId,
          });

          if (response.data?.updatePost.errors) {
            setErrors(toErrorMap(response.data.updatePost.errors));
          } else {
            setTimeout(() => {
              router.back();
            }, 1000);
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField name="title" placeholder="Title" label="Title" />
            <Box mt={4}>
              <InputField
                name="text"
                placeholder="Text..."
                textarea
                label="text"
              />
            </Box>

            <Box>
              <Button
                isLoading={isSubmitting}
                mt={4}
                type="submit"
                colorScheme="teal"
                variant="solid"
              >
                Post
              </Button>
            </Box>
          </Form>
        )}
      </Formik>
    </Layout>
  );
};
export default withUrqlClient(createUrqlClient)(Edit);
