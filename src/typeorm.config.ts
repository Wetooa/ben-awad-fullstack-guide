import { DataSourceOptions } from "typeorm";
import { Post } from "./entities/Post";
import { User } from "./entities/User";

export default {
  type: "postgres",
  database: "bafullstack2",
  username: "postgres",
  password: "postgres",
  logging: true,
  synchronize: true,
  entities: [Post, User],
} as DataSourceOptions;
