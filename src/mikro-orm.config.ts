import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import { MikroORM } from "@mikro-orm/core";
import path from "path";
import { User } from "./entities/User";

// type cast as const to make it more specific??? i dunno man ts is weird

// ok little bit of explanation regarding this shit
// we basically take the stuff that MikroORM takes in, stick it in the json so get type cast (use Parameters<type of WHATEVERTHEFUCK>[0] to do so)

// migrations
// absolute path using __dirname which is like the current directory name

export default {
  migrations: {
    path: path.join(__dirname, "./migrations"),
    pattern: /^[\w-]+\d+\.[tj]s$/,
  },
  entities: [Post, User],
  dbName: "bafullstack",
  type: "postgresql",
  debug: !__prod__,
  user: "postgres",
  password: "postgres",
} as Parameters<typeof MikroORM.init>[0];
