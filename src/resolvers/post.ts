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
    @Arg("cursor", () => String) cursor: string
  ): Promise<PaginatedPosts> {
    const userRepo = await appDataSource.getRepository(Post);
    const realLimit = Math.min(50, limit);
    const realLimitPlusOne = realLimit + 1;

    // docs says its better to use take instead of limit so we will use that lol

    // cursor is like get the shit after that certain post

    const replacements: any[] = [realLimitPlusOne];
    if (cursor) replacements.push(new Date(parseInt(cursor)));

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
        ) creator
      FROM post p
      INNER JOIN public.user u
      ON u.id = p."creatorId"
      ${cursor && `WHERE p."createdAt" < $2`}
      ORDER BY p."createdAt" DESC
      LIMIT $1
    `,
      replacements
    );

    // const qb = userRepo
    //   .createQueryBuilder("p")
    //   .innerJoinAndSelect("p.creator", "u", 'u.id = :p."creatorId"')
    //   .orderBy('p."createdAt"', "DESC")
    //   .take(realLimitPlusOne);

    // if (cursor) {
    //   qb.where('p."createdAt" < :cursor', {
    //     cursor: new Date(parseInt(cursor)),
    //   });
    // }

    console.log(posts);

    return {
      posts: posts.slice(0, realLimit),
      hasMore: posts.length === realLimitPlusOne,
    };
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

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async vote(
    @Arg("postId", () => Int) postId: number,
    @Arg("value", () => Int) value: number,
    @Ctx() { req }: MyContext
  ) {
    const postRepo = appDataSource.getRepository(Post);

    const isUpdoot = value !== -1;
    const realValue = isUpdoot ? 1 : -1;
    const { userId } = req.session;

    const updoot = await Updoot.findOne({ where: { userId, postId } });

    if (updoot) {
      if (updoot.value === realValue) {
        await postRepo.query(
          `
          UPDATE post
          SET points = points - $1
          WHERE id = $2
          `,
          [realValue, postId]
        );

        await appDataSource.getRepository(Updoot).query(
          `
            DELETE FROM updoot u
            WHERE u."userId" = $1
            AND u."postId" = $2
            `,
          [userId, postId]
        );
      } else {
        await postRepo.query(
          `
          UPDATE post
          SET points = points + $1
          WHERE id = $2
          `,
          [realValue * 2, postId]
        );

        await appDataSource.getRepository(Updoot).query(
          `
            UPDATE updoot
            SET value = $3
            WHERE "userId" = $1
            AND "postId" = $2
            `,
          [userId, postId, realValue]
        );
      }
    } else {
      await Updoot.insert({
        userId,
        postId,
        value: realValue,
      });

      await postRepo.query(
        `
        UPDATE post p
        SET points = points + $1
        WHERE id = $2
        `,
        [realValue, postId]
      );
    }

    return true;
  }
}
