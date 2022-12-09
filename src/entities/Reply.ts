import { Field, Int, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Post } from "./Post";
import { User } from "./User";

// so ngl this looks like a mongoose schema so thats good

@ObjectType()
export class Reply extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(() => String)
  @Column({ type: "text" })
  text!: string;

  @Field(() => Int, { nullable: true })
  voteStatus!: number | null;

  @Field(() => Int)
  @Column({ type: "int", default: 0 })
  points!: number;

  @Field(() => String)
  @CreateDateColumn({ type: "timestamptz" })
  createdAt = new Date();

  @Field(() => String)
  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt = new Date();

  // relationship fields
  @Field(() => Int)
  @PrimaryColumn()
  creatorId!: number;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.replies)
  creator!: User;
}

@ObjectType()
@Entity()
export class PostReply extends Reply {
  @Field(() => Int)
  @PrimaryColumn()
  postId!: number;

  @ManyToOne(() => Post, (post) => post.replies, { onDelete: "CASCADE" })
  post!: Post;

  @Field(() => [ReplyReply])
  @OneToMany(() => ReplyReply, (reply) => reply.reply)
  replyReplies!: ReplyReply[];
}

@ObjectType()
@Entity()
export class ReplyReply extends Reply {
  @Field(() => Int)
  @PrimaryColumn()
  replyId!: number;

  @ManyToOne(() => PostReply, (post) => post.replyReplies, {
    onDelete: "CASCADE",
  })
  reply!: PostReply;
}
