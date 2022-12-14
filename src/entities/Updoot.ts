import { Field, Int, ObjectType } from "type-graphql";
import { BaseEntity, Column, Entity, ManyToMany, PrimaryColumn } from "typeorm";
import { Post } from "./Post";
import { User } from "./User";

// so ngl this looks like a mongoose schema so thats good

// remember how this works

// basically, one updoot (upvote) has a many to many relationship with post and user. an updoot can come from multiple users and can be in multiple posts.

// its primary columns are the userId and postId since they are what makes an updoot unique

// the user and post entities have a many to one relationship with this entity since one user can have multiple updoots and one post can have multiple updoots

@ObjectType()
@Entity()
export class Updoot extends BaseEntity {
  @Field(() => Int)
  @Column({ type: "int" })
  value!: number;

  @Field(() => Int)
  @PrimaryColumn()
  userId!: number;

  @Field(() => User)
  @ManyToMany(() => User, (user) => user.updoots)
  user!: User;

  @Field(() => Int)
  @PrimaryColumn()
  postId!: number;

  @Field(() => Post)
  @ManyToMany(() => Post, (post) => post.updoots, {
    onDelete: "CASCADE",
    nullable: true,
  })
  post!: Post;
}
