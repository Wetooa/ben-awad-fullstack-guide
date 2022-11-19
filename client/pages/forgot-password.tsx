import { Button, Box } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import React, { useState } from "react";
import InputField from "../components/InputField";
import Wrapper from "../components/Wrapper";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { useForgotPasswordMutation } from "../generated/graphql";

const ForgotPassword: React.FC<{}> = ({}) => {
  const [{}, forgetPassword] = useForgotPasswordMutation();
  const [complete, setComplete] = useState(false);

  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ email: "" }}
        onSubmit={async (values) => {
          await forgetPassword(values);
          setComplete(true);
        }}
      >
        {({ isSubmitting }) =>
          complete ? (
            <Box>
              If an account with that email exists, we sent you an email!
            </Box>
          ) : (
            <Form>
              <InputField
                name="email"
                placeholder="Enter email"
                label="email"
              />

              <Box>
                <Button
                  isLoading={isSubmitting}
                  mt={4}
                  type="submit"
                  colorScheme="teal"
                  variant="solid"
                >
                  Send Link
                </Button>
              </Box>
            </Form>
          )
        }
      </Formik>
    </Wrapper>
  );
};
export default withUrqlClient(createUrqlClient)(ForgotPassword);
