import { MyContext } from "../types";
import {
  Resolver,
  Ctx,
  Arg,
  Mutation,
  InputType,
  Field,
  Query,
  ObjectType,
  Root,
  FieldResolver,
} from "type-graphql";
import { User } from "../entities/User";
import argon2 from "argon2";
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from "../constants";
import { validate } from "../utils/validate";
import { sendEmail } from "../utils/sendEmail";
import { v4 } from "uuid";

// ok so resolver is where we make our commands, kinda like the controllers

// the queries are the individual controllers
// the style is as follows

/*
@Query(() => [TYPES])
NAME(@Ctx() {CONTEXT_THINGY}: CONTEXT_TYPE_PROP): RETURN TYPE {
  return CONTEXT_THINGY.smthsmth()
}
*/

// we can use bcrypt for hashing but for this we will use argon2

@InputType()
export class UsernamePasswordInput {
  @Field(() => String)
  username!: string;

  @Field(() => String, { nullable: true })
  email!: string;

  @Field(() => String)
  password!: string;
}

@ObjectType()
export class FieldError {
  @Field(() => String)
  field!: string;

  @Field(() => String)
  message!: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User | User[];
}

@Resolver(User)
export class UserResolver {
  @FieldResolver(() => String)
  email(@Root() user: User, @Ctx() { req }: MyContext) {
    return req.session.userId === user.id ? user.email : "";
  }

  @Mutation(() => UserResponse)
  async changePassword(
    @Arg("token", () => String) token: string,
    @Arg("newPassword", () => String) newPassword: string,
    @Arg("reTypePassword", () => String) reTypePassword: string,
    @Ctx() { redis, req }: MyContext
  ): Promise<UserResponse> {
    // validations
    if (newPassword.length <= 2) {
      return {
        errors: [
          {
            field: "newPassword",
            message: "Length must be greater than 2!",
          },
        ],
      };
    }

    if (newPassword !== reTypePassword) {
      return {
        errors: [
          {
            field: "reTypePassword",
            message: "Passwords don't match!",
          },
        ],
      };
    }

    // if token is expired to they took a long time to change
    const key = FORGET_PASSWORD_PREFIX + token;
    const userId = await redis.get(key);

    if (!userId) {
      return {
        errors: [
          {
            field: "token",
            message: "Token is expired!",
          },
        ],
      };
    }

    // if userId is gone so maybe they deleted it while changing their pass lol

    const id = parseInt(userId);
    const user = await User.findOne({ where: { id } });
    if (!user) {
      return {
        errors: [
          {
            field: "token",
            message: "User no longer exists!",
          },
        ],
      };
    }

    await User.update({ id }, { password: await argon2.hash(user.password) });
    await redis.del(key);

    // log in user after changing password
    req.session.userId = user.id;

    return { user };
  }

  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg("email", () => String) email: string,
    @Ctx() { redis }: MyContext
  ) {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      // email not in the database
      return false;
    }

    // for unique tokens and url thingy
    const token = v4();
    await redis.set(
      FORGET_PASSWORD_PREFIX + token,
      user.id,
      "EX",
      1000 * 60 * 60 * 24 * 3
    ); // three days

    await sendEmail(
      email,
      `<a href="http://localhost:3000/change-password/${token}">reset password</a>`
    );

    return true;
  }

  @Query(() => User, { nullable: true })
  async me(@Ctx() { req }: MyContext) {
    if (!req.session.userId) {
      return null;
    }
    // you are not logged in

    const user = await User.findOne({ where: { id: req.session.userId } });
    return user;
  }

  @Query(() => [User])
  async getAllUsers(): Promise<User[]> {
    const users = await User.find();
    return users;
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg("options", () => UsernamePasswordInput) options: UsernamePasswordInput,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const err = validate(options);
    if (err.length >= 1) return { errors: err };

    const hashedPassword = await argon2.hash(options.password);
    let user;

    try {
      user = await User.create({
        username: options.username,
        password: hashedPassword,
        email: options.email,
      }).save();

      console.log(user);
    } catch (error: any) {
      const duplicateRegex = /(?<=\()\w*(?=\)=\()/;

      if (error.code === "23505") {
        let fieldWithError = error.detail.match(duplicateRegex)[0];
        return {
          errors: [
            {
              field: fieldWithError,
              message: fieldWithError + " already taken!",
            },
          ],
        };
      }
      return {};
    }

    req.session.userId = user.id;
    return {
      user,
    };
  }

  // u can change this however u like, i like looging in with the username as its much simplier so ill leave it at that
  @Mutation(() => UserResponse)
  async login(
    @Arg("options", () => UsernamePasswordInput) options: UsernamePasswordInput,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const user = await User.findOne({ where: { username: options.username } });

    if (!user) {
      return {
        errors: [
          {
            field: "username",
            message: "Username doesn't exist!",
          },
        ],
      };
    }

    const isMatch = await argon2.verify(user.password, options.password);

    if (!isMatch) {
      return {
        errors: [
          {
            field: "password",
            message: "Passwords don't match!",
          },
        ],
      };
    }

    req.session.userId = user.id;
    return {
      user,
    };
  }

  @Mutation(() => Boolean)
  async logout(@Ctx() { req, res }: MyContext) {
    // destroy session in redis
    return new Promise((resolve) =>
      req.session.destroy((err) => {
        if (err) {
          console.log(err);
          resolve(false);
          return;
        }
        // clear cookie in browser when it works
        res.clearCookie(COOKIE_NAME);
        resolve(true);
      })
    );
  }
}
