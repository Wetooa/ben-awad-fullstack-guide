import { Field, Int, ObjectType } from "type-graphql";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  OneToMany,
} from "typeorm";
import { Post } from "./Post";
import { Updoot } from "./Updoot";

// adding @field makes it so that u can access the property

@ObjectType()
@Entity()
export class User extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(() => String)
  @CreateDateColumn({ type: "timestamptz" })
  createdAt = new Date();

  @Field(() => String)
  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt = new Date();

  @Field(() => String)
  @Column({ type: "text", unique: true })
  email!: string;

  @Field(() => String)
  @Column({ type: "text", unique: true })
  username!: string;

  @Column({ type: "text" })
  password!: string;

  @OneToMany(() => Updoot, (updoot) => updoot.user)
  updoots!: Updoot[];

  @OneToMany(() => Post, (post) => post.creator, { nullable: true })
  posts!: Post[];
}
