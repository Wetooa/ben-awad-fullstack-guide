import { Post } from "../entities/Post";
import {
  Resolver,
  Query,
  Arg,
  Int,
  Mutation,
  InputType,
  Field,
  Ctx,
  UseMiddleware,
  ObjectType,
} from "type-graphql";
import { MyContext } from "src/types";
import { isAuth } from "../middleware/isAuth";
import { FieldError } from "./user";
import { User } from "src/entities/User";

// ok so resolver is where we make our commands, kinda like the controllers
// the queries are the individual controllers
// the syntax is as follows
/*
@Query(() => [TYPES])
NAME(@Ctx() {CONTEXT_THINGY}: CONTEXT_TYPE_PROP): RETURN TYPE {
  return CONTEXT_THINGY.smthsmth()
}
*/

@InputType()
class PostInput {
  @Field(() => String)
  title!: string;

  @Field(() => String)
  text!: string;
}

@ObjectType()
class PostResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => Post, { nullable: true })
  post?: Post | Post[];
}

@Resolver()
export class PostResolver {
  @Query(() => [Post])
  async posts(): Promise<Post[]> {
    return Post.find();
  }

  @Query(() => Post, { nullable: true })
  post(@Arg("id", () => Int) id: number): Promise<Post | null> {
    return Post.findOne({ where: { id } });
  }

  @Mutation(() => PostResponse)
  @UseMiddleware(isAuth)
  async createPost(
    @Arg("input", () => PostInput) input: PostInput,
    @Ctx() { req }: MyContext
  ): Promise<PostResponse> {
    const errors: FieldError[] = [];
    console.log(input);

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

    if (errors.length > 0) return { errors };

    const post = await Post.create({
      ...input,
      creatorId: req.session.userId,
    }).save();

    return { post };
  }

  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg("id", () => Int) id: number,
    @Arg("title", () => String, { nullable: true }) title: string
  ): Promise<Post | null> {
    const post = await Post.findOne({ where: { id } });
    if (!post) {
      return null;
    }

    if (typeof title !== "undefined") {
      post.title = title;
      await Post.update({ id }, { title });
    }
    return post;
  }

  @Mutation(() => Boolean)
  async deletePost(@Arg("id", () => Int) id: number): Promise<boolean> {
    await Post.delete({ id });
    return true;
  }
}
