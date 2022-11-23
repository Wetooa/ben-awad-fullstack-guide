import React from "react";
import InputField from "../components/InputField";
import { Box, Button, Flex, Link } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { toErrorMap } from "../utils/toErrorMap";
import { useRouter } from "next/router";
import { useLoginMutation } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { withUrqlClient } from "next-urql";
import Layout from "../components/Layout";

interface RegisterProps {}

const Login: React.FC<RegisterProps> = ({}) => {
  const [{}, login] = useLoginMutation();
  const router = useRouter();

  return (
    <Layout variant="small">
      <Formik
        initialValues={{ username: "", password: "" }}
        onSubmit={async (values, { setErrors }) => {
          const response = await login(values);

          if (response.data?.login.errors) {
            setErrors(toErrorMap(response.data.login.errors));
          } else if (response.data?.login.user) {
            // worked
            setTimeout(() => {
              if (typeof router.query.next === "string") {
                router.push(router.query.next);
              } else {
                router.push("/");
              }
            }, 1000);
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name="username"
              placeholder="Enter username"
              label="username"
            />
            <Box mt={4}>
              <InputField
                name="password"
                placeholder="Enter password"
                label="password"
                type="password"
              />
            </Box>

            <Flex mt={2}>
              <Link
                href="/forgot-password"
                color="blue.400"
                textDecorationLine={"underline"}
                ml="auto"
              >
                forgot password?
              </Link>
            </Flex>

            <Box>
              <Button
                isLoading={isSubmitting}
                mt={4}
                type="submit"
                colorScheme="teal"
                variant="solid"
              >
                Login
              </Button>
            </Box>
          </Form>
        )}
      </Formik>
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient)(Login);
