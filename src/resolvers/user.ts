import { MyContext } from "../types";
import {
  Resolver,
  Ctx,
  Arg,
  Mutation,
  InputType,
  Field,
  Query,
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

@Resolver()
export class UserResolver {
  @Query(() => [User])
  async getAllUsers(@Ctx() { em }: MyContext): Promise<User[]> {
    return em.find(User, {});
  }

  @Mutation(() => User)
  async register(
    @Arg("options", () => UsernamePasswordInput) options: UsernamePasswordInput,
    @Ctx() { em }: MyContext
  ): Promise<User> {
    const hashedPassword = await argon2.hash(options.password);
    const user = em.create(User, {
      username: options.username,
      password: hashedPassword,
    });

    await em.persistAndFlush(user);
    return user;
  }
}
