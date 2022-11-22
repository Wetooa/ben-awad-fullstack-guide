import { Box, Button, Flex, Link } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { NextPage } from "next";
import { withUrqlClient } from "next-urql";
import router from "next/router";
import { useState } from "react";
import InputField from "../../components/InputField";
import Layout from "../../components/Layout";
import { useChangePasswordMutation } from "../../generated/graphql";
import { createUrqlClient } from "../../utils/createUrqlClient";
import { toErrorMap } from "../../utils/toErrorMap";

interface ChangePasswordProps {
  token: string;
}

const ChangePassword: NextPage<{ token: string }> = ({
  token,
}: ChangePasswordProps) => {
  const [{}, changePassword] = useChangePasswordMutation();
  const [tokenError, setTokenError] = useState("");

  // useEffect(() => {
  //   setTimeout(() => {
  //     setTokenError("");
  //   }, 1000);
  // }, [tokenError]);

  return (
    <Layout variant="small">
      <Formik
        initialValues={{ newPassword: "", reTypePassword: "" }}
        onSubmit={async (values, { setErrors }) => {
          const response = await changePassword({ token, ...values });

          if (response.data?.changePassword.errors) {
            const errorMap = toErrorMap(response.data.changePassword.errors);

            if ("token" in errorMap) {
              setTokenError(errorMap.token);
            }
            setErrors(errorMap);
          } else if (response.data?.changePassword.user) {
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

            {tokenError && (
              <Flex mt={4}>
                <Box color="tomato" mr={4}>
                  {tokenError}
                </Box>
                <Link
                  href="/forgot-password"
                  color="blue.400"
                  textDecorationLine={"underline"}
                >
                  Click here to get a new one!
                </Link>
              </Flex>
            )}

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
    </Layout>
  );
};

ChangePassword.getInitialProps = ({ query }) => {
  return {
    token: query.token as string,
  };
};

export default withUrqlClient(createUrqlClient)(ChangePassword);
