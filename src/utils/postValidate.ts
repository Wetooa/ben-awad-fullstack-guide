import { PostInput } from "../resolvers/post";
import { FieldError } from "../resolvers/user";

export const postValidate = (input: PostInput) => {
  const errors: FieldError[] = [];

  if (input.title.length < 2) {
    errors.push({
      field: "title",
      message: "Title field cannot be empty!",
    });
  }

  if (input.text.length < 2) {
    errors.push({
      field: "text",
      message: "Text field cannot be empty!",
    });
  }

  return errors;
};
