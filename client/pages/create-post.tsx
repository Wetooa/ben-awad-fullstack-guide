import { Button, Box } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import React from "react";
import InputField from "../components/InputField";
import Layout from "../components/Layout";
import { useCreatePostMutation } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { toErrorMap } from "../utils/toErrorMap";
import { useIsAuth } from "../utils/useIsAuth";

interface CreatePostProps {}

const CreatePost: React.FC<CreatePostProps> = ({}) => {
  const [{}, createPost] = useCreatePostMutation();
  const router = useRouter();
  useIsAuth();

  return (
    <Layout variant="small">
      <Formik
        initialValues={{ title: "", text: "" }}
        onSubmit={async (values, { setErrors }) => {
          const response = await createPost({ input: values });

          console.log(response);

          if (response.data?.createPost.errors) {
            setErrors(toErrorMap(response.data.createPost.errors));
          } else {
            // worked
            setTimeout(() => {
              router.push("/");
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

export default withUrqlClient(createUrqlClient)(CreatePost);
