import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
} from "@chakra-ui/react";
import { useField } from "formik";
import React, { InputHTMLAttributes } from "react";

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  name: string;
  label: string;
  placeholder: string;
};

const InputField: React.FC<InputFieldProps> = (props) => {
  const [field, { error }] = useField(props);

  return (
    <FormControl isInvalid={!!error}>
      <FormLabel htmlFor={field.name} style={{ textTransform: "capitalize" }}>
        {props.label}
      </FormLabel>
      <Input
        {...field}
        id={field.name}
        placeholder={
          props.placeholder[0].toUpperCase() + props.placeholder.substring(1)
        }
      />
      {error ? <FormErrorMessage>{error}</FormErrorMessage> : null}
    </FormControl>
  );
};
export default InputField;
