import { Field, Int, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Tree,
  TreeChildren,
  TreeParent,
  UpdateDateColumn,
} from "typeorm";
import { Updoot } from "./Updoot";
import { User } from "./User";

// so ngl this looks like a mongoose schema so thats good

@ObjectType()
@Entity()
@Tree("closure-table")
export class Post extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(() => String, { nullable: true })
  @Column({ type: "text", nullable: true })
  title!: string;

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

  @OneToMany(() => Updoot, (updoot) => updoot.post)
  updoots!: Updoot[];

  @Field(() => Int, { nullable: true })
  @Column({ type: "int", nullable: true })
  replyId?: number;

  @Field(() => [Post], { nullable: true })
  @TreeChildren()
  replies?: Post[];

  @Field(() => Post, { nullable: true })
  @TreeParent()
  repliedTo?: Post;
}
