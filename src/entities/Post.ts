import { Field, Int, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
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
  @CreateDateColumn({ type: "date" })
  createdAt = new Date();

  @Field(() => String)
  @UpdateDateColumn({ type: "date" })
  updatedAt = new Date();
}
