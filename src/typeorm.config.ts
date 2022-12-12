import path from "path";
import { DataSourceOptions } from "typeorm";
import { Post } from "./entities/Post";
import { Reply } from "./entities/Reply";
import { PostUpdoot, ReplyUpdoot } from "./entities/Updoot";
import { User } from "./entities/User";

export default {
  type: "postgres",
  database: "bafullstack2",
  username: "postgres",
  password: "postgres",
  logging: true,
  synchronize: true,
  entities: [Post, User, PostUpdoot, ReplyUpdoot, Reply],
  migrations: [path.join(__dirname, "./migrations/**/*")],
} as DataSourceOptions;
