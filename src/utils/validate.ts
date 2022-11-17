import { FieldError, UsernamePasswordInput } from "src/resolvers/user";

export const validate = (options: UsernamePasswordInput): FieldError[] => {
  const err: FieldError[] = [];
  // very cool and easy regex lol yea wohoo at least I can understand this hahahahha
  const emailRegex = /^([\w\.\-]+)@([\w\-]+)((\.(\w){2,3})+)$/;

  if (options.email && !options.email.match(emailRegex)) {
    err.push({
      field: "email",
      message: "Invalid email!",
    });
  }

  if (options.username.length <= 2) {
    err.push({
      field: "username",
      message: "Length must be greater than 2!",
    });
  }

  if (options.password.length <= 2) {
    err.push({
      field: "password",
      message: "Length must be greater than 2!",
    });
  }

  return err;
};
