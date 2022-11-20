import { Field, Int, ObjectType } from "type-graphql";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
} from "typeorm";

// adding @field makes it so that u can access the property

@ObjectType()
@Entity()
export class User extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(() => String)
  @CreateDateColumn({ type: "date" })
  createdAt = new Date();

  @Field(() => String)
  @UpdateDateColumn({ type: "date" })
  updatedAt = new Date();

  @Field(() => String)
  @Column({ type: "text", unique: true })
  email!: string;

  @Field(() => String)
  @Column({ type: "text", unique: true })
  username!: string;

  @Column({ type: "text" })
  password!: string;
}
