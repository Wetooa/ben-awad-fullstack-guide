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
  FieldResolver,
  Root,
} from "type-graphql";
import { MyContext } from "../types";
import { isAuth } from "../middleware/isAuth";
import { FieldError } from "./user";
import { appDataSource } from "../";
import { Updoot } from "../entities/Updoot";

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
}

@ObjectType()
class PaginatedPosts {
  @Field(() => [Post])
  posts!: Post[];

  @Field(() => Boolean)
  hasMore!: boolean;
}

// either limit and offset pagination or cursor based pagination
@Resolver(Post)
export class PostResolver {
  @FieldResolver(() => String)
  textSnippet(@Root() root: Post) {
    return root.text.length >= 100
      ? `${root.text.slice(0, 100)}...`
      : root.text;
  }

  @Query(() => PaginatedPosts)
  async posts(
    @Arg("limit", () => Int) limit: number,
    @Arg("cursor", () => String) cursor: string,
    @Ctx() { req }: MyContext
  ): Promise<PaginatedPosts> {
    const userRepo = appDataSource.getRepository(Post);
    const realLimit = Math.min(50, limit);
    const realLimitPlusOne = realLimit + 1;

    // docs says its better to use take instead of limit so we will use that lol
    // cursor is like get the shit after that certain post

    const replacements: any[] = [realLimitPlusOne];

    if (req.session.userId) replacements.push(req.session.userId);

    let cursorIndex = 3;

    if (cursor) {
      replacements.push(new Date(parseInt(cursor)));
      cursorIndex = replacements.length;
    }

    // query is kinda like mysql so yea it feels good what I learned didnt go to waste hahahahha
    const posts = await userRepo.query(
      `
      SELECT p.*,
      JSON_BUILD_OBJECT(
        'id', u.id,
        'username', u.username,
        'email', u.email,
        'createdAt', u."createdAt",
        'updatedAt', u."updatedAt"
        ) creator, ${
          req.session.userId
            ? `
        (
          SELECT value
          FROM updoot
          WHERE "userId" = $2 and "postId" = p.id
        ) "voteStatus"`
            : `null as "voteStatus"`
        }
      FROM post p
      INNER JOIN public.user u
      ON u.id = p."creatorId"
      ${cursor && `WHERE p."createdAt" < $${cursorIndex}`}
      ORDER BY p."createdAt" DESC
      LIMIT $1
    `,
      replacements
    );

    return {
      posts: posts.slice(0, realLimit),
      hasMore: posts.length === realLimitPlusOne,
    };
  }

  @Query(() => Post, { nullable: true })
  post(@Arg("id", () => Int) id: number): Promise<Post | null> {
    // easy way of making join statements using typeorm
    return Post.findOne({ where: { id }, relations: ["creator"] });
  }

  @Mutation(() => PostResponse)
  @UseMiddleware(isAuth)
  async createPost(
    @Arg("input", () => PostInput) input: PostInput,
    @Ctx() { req }: MyContext
  ): Promise<PostResponse> {
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

    if (errors.length > 0) return { errors };

    await Post.create({
      ...input,
      creatorId: req.session.userId,
    }).save();

    return {};
  }

  @Mutation(() => Post, { nullable: true })
  @UseMiddleware(isAuth)
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
  @UseMiddleware(isAuth)
  async deletePost(
    @Arg("id", () => Int) id: number,
    @Ctx() { req }: MyContext
  ): Promise<boolean> {
    await Post.delete({ id, creatorId: req.session.userId });
    return true;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async vote(
    @Arg("postId", () => Int) postId: number,
    @Arg("value", () => Int) value: number,
    @Ctx() { req }: MyContext
  ) {
    const isUpdoot = value !== -1;
    const realValue = isUpdoot ? 1 : -1;
    const { userId } = req.session;

    const updoot = await Updoot.findOne({ where: { userId, postId } });

    if (updoot) {
      if (updoot.value === realValue) {
        // if equal to the current value, remove the doot
        await appDataSource.transaction(async (tm) => {
          await tm.query(
            `
            UPDATE post
            SET points = points - $1
            WHERE id = $2
          `,
            [realValue, postId]
          );

          await tm.query(
            `
            DELETE FROM updoot u
            WHERE u."userId" = $1
            AND u."postId" = $2
          `,
            [userId, postId]
          );
        });
      } else {
        // if not equal to the current value, then update the doot and add the value twice g?

        await appDataSource.transaction(async (tm) => {
          await tm.query(
            `
            UPDATE post
            SET points = points + $1
            WHERE id = $2
          `,
            [realValue * 2, postId]
          );

          await tm.query(
            `
            UPDATE updoot
            SET value = $1
            WHERE "userId" = $2
            AND "postId" = $3
          `,
            [realValue, userId, postId]
          );
        });
      }
    } else {
      // not voted yet

      await appDataSource.transaction(async (tm) => {
        await tm.query(
          `
          INSERT INTO updoot ("userId", "postId", value)
          VALUES ($1, $2, $3)
        `,
          [userId, postId, realValue]
        );

        await tm.query(
          `
          UPDATE post
          SET points = points + $1
          WHERE id = $2
        `,
          [realValue, postId]
        );
      });
    }

    return true;
  }
}
