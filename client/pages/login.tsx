import React from "react";
import Wrapper from "../components/Wrapper";
import InputField from "../components/InputField";
import { Box, Button } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { toErrorMap } from "../utils/toErrorMap";
import { useRouter } from "next/router";
import { useLoginMutation } from "../generated/graphql";

interface RegisterProps {}

const Login: React.FC<RegisterProps> = ({}) => {
  const [{}, login] = useLoginMutation();
  const router = useRouter();

  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ username: "", password: "" }}
        onSubmit={async (values, { setErrors }) => {
          const response = await login(values);

          if (response.data?.login.errors) {
            setErrors(toErrorMap(response.data.login.errors));
          } else if (response.data?.login.user) {
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
              Login
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
    </Wrapper>
  );
};

export default Login;