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
  @Query(() => [User])
  async getAllUsers(@Ctx() { em }: MyContext): Promise<User[]> {
    const users = await em.find(User, {});
    return users;
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg("options", () => UsernamePasswordInput) options: UsernamePasswordInput,
    @Ctx() { em }: MyContext
  ): Promise<UserResponse> {
    const hashedPassword = await argon2.hash(options.password);
    const user = em.create(User, {
      username: options.username,
      password: hashedPassword,
    });

    await em.persistAndFlush(user);
    return {
      user,
    };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("options", () => UsernamePasswordInput) options: UsernamePasswordInput,
    @Ctx() { em }: MyContext
  ): Promise<UserResponse> {
    const user = await em.findOne(User, {
      username: options.username,
    });

    if (!user) {
      return {
        errors: [
          {
            field: "username",
            message: "username doesn't exist",
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
            message: "passwords don't match",
          },
        ],
      };
    }

    return {
      user,
    };
  }
}
