import React from "react";
import InputField from "../components/InputField";
import { Box, Button } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { useRegisterMutation } from "../generated/graphql";
import { toErrorMap } from "../utils/toErrorMap";
import { useRouter } from "next/router";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";
import Layout from "../components/Layout";

interface RegisterProps {}

const Register: React.FC<RegisterProps> = ({}) => {
  const [{}, register] = useRegisterMutation();
  const router = useRouter();

  return (
    <Layout variant="small">
      <Formik
        initialValues={{ username: "", password: "", email: "" }}
        onSubmit={async (values, { setErrors }) => {
          const response = await register({ options: values });

          if (response.data?.register.errors) {
            setErrors(toErrorMap(response.data.register.errors));
          } else if (response.data?.register.user) {
            // worked

            setTimeout(() => {
              router.push("/");
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
                name="email"
                placeholder="Enter email"
                label="email"
              />
            </Box>

            <Box mt={4}>
              <InputField
                name="password"
                placeholder="Enter password"
                label="password"
                type="password"
              />
            </Box>

            <Button
              isLoading={isSubmitting}
              mt={4}
              type="submit"
              colorScheme="teal"
              variant="solid"
            >
              Register
            </Button>

            {/* <Button
              isLoading={isSubmitting}
              mt={4}
              colorScheme="teal"
              variant="solid"
              onClick={() => {
                const currTheme = localStorage.getItem("chakra-ui-color-mode");

                localStorage.setItem(
                  "chakra-ui-color-mode",
                  currTheme === "light" ? "dark" : "light"
                );
              }}
            >
              Light/Dark
            </Button> */}
          </Form>
        )}
      </Formik>
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient)(Register);
