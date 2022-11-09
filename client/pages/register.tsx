import React, {
  ChangeEvent,
  ChangeEventHandler,
  FunctionComponent,
} from "react";
import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
} from "@chakra-ui/react";
import { Formik, Form } from "formik";
import Wrapper from "../components/Wrapper";
import InputField from "../components/InputField";

interface RegisterProps {}

interface FormValuesProps {
  values: {
    username: string;
    password: string;
  };
  handleChange: ChangeEventHandler;
}

const Register: React.FC<RegisterProps> = ({}) => {
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ username: "", password: "" }}
        onSubmit={(values) => console.log(values)}
      >
        {({ values }: FormValuesProps) => (
          <Form>
            <InputField
              name="username"
              placeholder="enter username"
              value={values.username}
              label="username"
            />

            <InputField
              name="password"
              placeholder="enter password"
              value={values.password}
              label="password"
            />

            {/* <button type="submit">click me</button> */}
            <Button type="submit">Submit</Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};
export default Register;
