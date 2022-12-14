import path from "path";
import { DataSourceOptions } from "typeorm";
import { Post } from "./entities/Post";
import { Updoot } from "./entities/Updoot";
import { User } from "./entities/User";

export default {
  type: "postgres",
  database: "bafullstack2",
  username: "postgres",
  password: "postgres",
  logging: true,
  synchronize: true,
  entities: [Post, User, Updoot],
  migrations: [path.join(__dirname, "./migrations/**/*")],
} as DataSourceOptions;
