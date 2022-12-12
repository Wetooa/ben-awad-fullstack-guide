import { ObjectType, Field, Int } from "type-graphql";
import {
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Tree,
  TreeChildren,
  TreeParent,
  OneToOne,
} from "typeorm";
import { Post } from "./Post";
import { PostUpdoot, ReplyUpdoot } from "./Updoot";
import { User } from "./User";

@ObjectType()
@Entity()
@Tree("closure-table")
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

  @Field(() => Int)
  @Column({ type: "int" })
  creatorId!: number;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.posts)
  creator!: User;

  @Field(() => String)
  @CreateDateColumn({ type: "timestamptz" })
  createdAt = new Date();

  @Field(() => String)
  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt = new Date();

  @OneToMany(() => ReplyUpdoot, (updoot) => updoot.reply)
  updoots!: PostUpdoot[];

  @Field(() => Int)
  @Column({ type: "int", nullable: true })
  postRepliedToId!: number;

  @Field(() => Post)
  @OneToOne(() => Post, (post) => post.replies, { nullable: true })
  post!: Post;

  @Field(() => Reply)
  @TreeChildren()
  replies!: Reply[];

  @Field(() => Reply)
  @TreeParent()
  repliedTo!: Reply;
}
