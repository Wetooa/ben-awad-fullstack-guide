import { PostInput } from "../resolvers/post";
import { FieldError } from "../resolvers/user";

export const postValidate = (input: PostInput) => {
  const errors: FieldError[] = [];

  if (input.title.length < 2) {
    errors.push({
      field: "title",
      message: "Title field cannot be less than 2 characters!",
    });
  }

  if (input.text.length < 2) {
    errors.push({
      field: "text",
      message: "Text field cannot be less than 2 characters!",
    });
  }

  return errors;
};
