import { Field, Int, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Reply } from "./Reply";
import { PostUpdoot } from "./Updoot";
import { User } from "./User";

// so ngl this looks like a mongoose schema so thats good

@ObjectType()
@Entity()
export class Post extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(() => String)
  @Column({ type: "text" })
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

  @OneToMany(() => PostUpdoot, (updoot) => updoot.post)
  updoots!: PostUpdoot[];

  @OneToMany(() => Reply, (reply) => reply.post)
  replies!: Reply[];
}
