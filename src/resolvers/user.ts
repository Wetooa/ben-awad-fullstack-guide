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

@Resolver()
export class UserResolver {
  @Mutation(() => UserResponse)
  async changePassword(
    @Arg("token", () => String) token: string,
    @Arg("newPassword", () => String) newPassword: string,
    @Arg("reTypePassword", () => String) reTypePassword: string,
    @Ctx() { redis, em }: MyContext
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
    const userId = await redis.get(FORGET_PASSWORD_PREFIX + token);
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
    const user = await em.findOne(User, { id: parseInt(userId) });
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

    user.password = await argon2.hash(newPassword);
    await em.persistAndFlush(user);

    return { user };
  }

  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg("email", () => String) email: string,
    @Ctx() { em, redis }: MyContext
  ) {
    const user = await em.findOne(User, { email });
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
  async me(@Ctx() { em, req }: MyContext) {
    if (!req.session.userId) {
      return null;
    }
    // you are not logged in

    const user = await em.findOne(User, { id: req.session.userId });
    return user;
  }

  @Query(() => [User])
  async getAllUsers(@Ctx() { em }: MyContext): Promise<User[]> {
    const users = await em.find(User, {});
    return users;
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg("options", () => UsernamePasswordInput) options: UsernamePasswordInput,
    @Ctx() { req, em }: MyContext
  ): Promise<UserResponse> {
    const err = validate(options);
    if (err.length >= 1) return { errors: err };

    const hashedPassword = await argon2.hash(options.password);
    const user = em.create(User, {
      username: options.username,
      password: hashedPassword,
      email: options.email,
    });

    // let user;
    try {
      // if this fails, we dont create an id for it hence why is says non nullable thingy
      // const result = await (em as EntityManager)
      //   .createQueryBuilder(User)
      //   .getKnexQuery()
      //   .insert({
      //     username: options.username,
      //     password: hashedPassword,
      //     created_at: new Date(),
      //     updated_at: new Date(),
      //   })
      //   .returning("*");

      // user = result[0];

      await em.persistAndFlush(user);
    } catch (error: any) {
      // duplicated user error

      if (error.code === "23505") {
        //|| error.detail.includes("already exists")) {

        let fieldWithError = error.detail.match(/(?<=\()\w*(?=\)=\()/)[0];

        return {
          errors: [
            {
              field: fieldWithError,
              message: fieldWithError + " already taken!",
            },
          ],
        };
      }
    }

    req.session.userId = user.id;
    // log in the user once successfully registered`

    return {
      user,
    };
  }

  // u can change this however u like, i like looging in with the username as its much simplier so ill leave it at that
  @Mutation(() => UserResponse)
  async login(
    @Arg("options", () => UsernamePasswordInput) options: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    const user = await em.findOne(User, {
      username: options.username,
    });

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
