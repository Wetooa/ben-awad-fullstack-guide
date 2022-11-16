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
import { COOKIE_NAME } from "../constants";

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
class UsernamePasswordInput {
  @Field(() => String)
  username!: string;
  @Field(() => String)
  password!: string;
}

@ObjectType()
class FieldError {
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
    const err: FieldError[] = [];

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

    if (err.length >= 1) return { errors: err };

    const hashedPassword = await argon2.hash(options.password);
    const user = em.create(User, {
      username: options.username,
      password: hashedPassword,
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
        return {
          errors: [
            {
              field: "username",
              message: "Username already taken!",
            },
          ],
        };
      }
    }

    req.session.userId = user.id;
    // log in the user once successfully registered

    return {
      user,
    };
  }

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
