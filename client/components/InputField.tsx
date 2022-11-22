import {
  ComponentWithAs,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  InputProps,
  Textarea,
  TextareaProps,
} from "@chakra-ui/react";
import { useField } from "formik";
import React, { InputHTMLAttributes } from "react";

type InputFieldProps = InputHTMLAttributes<
  HTMLInputElement | HTMLTextAreaElement
> & {
  name: string;
  label: string;
  textarea?: boolean;
};

const InputField: React.FC<InputFieldProps> = ({
  label,
  size: _,
  textarea,
  ...props
}) => {
  const [field, { error }] = useField(props);
  let InputOrTextarea:
    | ComponentWithAs<"input", InputProps>
    | ComponentWithAs<"input", TextareaProps> = Input;
  if (textarea) {
    InputOrTextarea = Textarea;
  }

  return (
    <FormControl isInvalid={!!error}>
      <FormLabel htmlFor={field.name} style={{ textTransform: "capitalize" }}>
        {label}
      </FormLabel>
      <InputOrTextarea
        {...field}
        {...props}
        id={field.name}
        autoComplete="on"
      />

      {error ? <FormErrorMessage>{error}</FormErrorMessage> : null}
    </FormControl>
  );
};
export default InputField;
