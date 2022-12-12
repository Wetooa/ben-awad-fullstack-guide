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
import { postValidate } from "../utils/postValidate";

import { PostUpdoot } from "../entities/Updoot";
import { User } from "../entities/User";
import { Reply } from "../entities/Reply";

@InputType()
export class PostInput {
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
  post?: Post;
}

@ObjectType()
class ReplyResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => Boolean, { nullable: true })
  success?: boolean;
}

@ObjectType()
class PaginatedPosts {
  @Field(() => [Post])
  posts!: Post[];

  @Field(() => Boolean)
  hasMore!: boolean;
}

@Resolver(Post)
export class PostResolver {
  @FieldResolver(() => String)
  textSnippet(@Root() root: Post) {
    return root.text.length >= 100
      ? `${root.text.slice(0, 100)}...`
      : root.text;
  }

  // data loader to optimize queries
  @FieldResolver(() => User)
  async creator(@Root() post: Post, @Ctx() { userLoader }: MyContext) {
    return await userLoader.load(post.creatorId);
  }

  @FieldResolver(() => Int, { nullable: true })
  async voteStatus(
    @Root() post: Post,
    @Ctx() { updootLoader, req }: MyContext
  ) {
    if (!req.session.userId) {
      return null;
    }
    const updoot = await updootLoader.load({
      postId: post.id,
      userId: req.session.userId,
    });
    return updoot ? updoot.value : null;
  }

  @Mutation(() => ReplyResponse)
  @UseMiddleware(isAuth)
  async reply(
    @Ctx() { req }: MyContext,
    @Arg("text", () => String) text: string,
    @Arg("isDirectReply", () => Boolean) isDirectReply: boolean,
    @Arg("replyId", () => Int) replyId: number
  ): Promise<ReplyResponse> {
    if (!replyId) {
      return { success: false };
    }
    if (text.length < 3) {
      return {
        errors: [
          {
            field: "text",
            message: "text field must be longer than 3 characters",
          },
        ],
      };
    }

    const newReply = Reply.create({ text, creatorId: req.session.userId });

    if (isDirectReply) {
      let post = await Post.findOne({ where: { id: replyId } });
      if (!post) {
        return { success: false };
      }

      newReply.postRepliedToId = post.id;
      await Reply.create({
        text,
        creatorId: req.session.userId,
        postRepliedToId: post.id,
      }).save();
    } else {
      let replyParent = await Reply.findOne({ where: { id: replyId } });
      if (!replyParent) {
        return { success: false };
      }

      newReply.repliedTo = replyParent;
      await appDataSource.manager.save(newReply);
    }

    return { success: true };
  }

  @Query(() => PaginatedPosts)
  async posts(
    @Arg("limit", () => Int) limit: number,
    @Arg("cursor", () => String) cursor: string
  ): Promise<PaginatedPosts> {
    const userRepo = appDataSource.getRepository(Post);
    const realLimit = Math.min(50, limit);
    const realLimitPlusOne = realLimit + 1;

    const replacements: any[] = [realLimitPlusOne];
    if (cursor) {
      replacements.push(new Date(parseInt(cursor)));
    }

    const posts = await userRepo.query(
      `
      SELECT p.*
      FROM post p
      ${cursor && `AND p."createdAt" < $2`}
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
  async post(@Arg("id", () => Int) id: number): Promise<any | null> {
    const parent = await Post.findOne({ where: { id } });
    if (!parent) {
      throw new Error("query failed");
    }
  }

  @Mutation(() => PostResponse)
  @UseMiddleware(isAuth)
  async createPost(
    @Arg("input", () => PostInput) input: PostInput,
    @Ctx() { req }: MyContext
  ): Promise<PostResponse> {
    const errors = postValidate(input);
    if (errors.length > 0) return { errors };

    await Post.create({
      ...input,
      creatorId: req.session.userId,
    }).save();

    return {};
  }

  @Mutation(() => PostResponse)
  @UseMiddleware(isAuth)
  async updatePost(
    @Arg("id", () => Int) id: number,
    @Arg("input", () => PostInput) input: PostInput,
    @Ctx() { req }: MyContext
  ): Promise<PostResponse> {
    const errors = postValidate(input);
    if (errors.length > 0) return { errors };

    const { text, title } = input;

    const result = await appDataSource
      .createQueryBuilder()
      .update(Post)
      .set({ title, text })
      .where('id = :id and "creatorId" = :creatorId', {
        id,
        creatorId: req.session.userId,
      })
      .returning("*")
      .execute();

    return { post: result.raw[0] };
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

    const updoot = await PostUpdoot.findOne({ where: { userId, postId } });

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
