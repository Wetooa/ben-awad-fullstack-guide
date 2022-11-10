import React from "react";
import { Box, Button } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import Wrapper from "../components/Wrapper";
import InputField from "../components/InputField";
import { useMutation } from "urql";

interface RegisterProps {}

const REGISTER_MUTATION = `
mutation Register($username: String!, $password: String!) {
  register(options: {username: $username, password: $password}) {
    errors {
      field
      message
    }
    user {
      id
      createdAt
      updatedAt
      username
    }
  }
}
`;

const Register: React.FC<RegisterProps> = ({}) => {
  const [{}, register] = useMutation(REGISTER_MUTATION);

  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ username: "", password: "" }}
        onSubmit={async (values) => {
          const response = await register(values);
          return response;
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
              Register
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default Register;
