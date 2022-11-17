import { Box, Button } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { NextPage } from "next";
import router from "next/router";
import InputField from "../../components/InputField";
import Wrapper from "../../components/Wrapper";
import { toErrorMap } from "../../utils/toErrorMap";
import login from "../login";

interface ChangePasswordProps {}

const ChangePassword: NextPage<{ token: string }> = ({ token }) => {
  return (
    <Wrapper>
      <Formik
        initialValues={{ newPassword: "", reTypePassword: "" }}
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
              name="newPassword"
              placeholder="Enter New Password"
              label="new password"
              type="password"
            />

            <Box mt={4}>
              <InputField
                name="reTypePassword"
                placeholder="Retype Password"
                label="retype password"
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
              Update Password
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

ChangePassword.getInitialProps = ({ query }) => {
  return {
    token: query.token as string,
  };
};

export default ChangePassword;
