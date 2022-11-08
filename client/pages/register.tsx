import React from "react";
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
} from "@chakra-ui/react";
import { Formik, Form } from "formik";

interface RegisterProps {}

interface FormValuesProps {
  values: {
    username: string;
    password: string;
  };
  handleChange: Function;
}

const Register: React.FC<RegisterProps> = ({}) => {
  const handleChange = () => {};

  return (
    <Formik
      initialValues={{ username: "", password: "" }}
      onSubmit={(values) => console.log(values)}
    >
      {({ values, handleChange }: FormValuesProps) => (
        <Form>
          <FormControl>
            <FormLabel htmlFor="username">Username</FormLabel>
            <Input
              value={values.username}
              id="username"
              placeholder="username"
              onChange={() => handleChange}
            />
            <FormErrorMessage>{}</FormErrorMessage>
          </FormControl>

          <FormControl>
            <FormLabel htmlFor="password">Password</FormLabel>
            <Input
              value={values.password}
              id="password"
              placeholder="password"
              onChange={() => handleChange}
            />
            <FormErrorMessage>{}</FormErrorMessage>
          </FormControl>
        </Form>
      )}
    </Formik>
  );
};
export default Register;
