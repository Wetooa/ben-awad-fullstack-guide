import mikroOrmConfig from "./mikro-orm.config";
import express, { Application } from "express";
import { MikroORM } from "@mikro-orm/core";
import { Post } from "./entities/Post";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";

import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";

import { __prod__ } from "./constants";
import morgan from "morgan";

import "reflect-metadata";
import "dotenv/config";
import "colors";

const main = async () => {
  const orm = await MikroORM.init(mikroOrmConfig);
  await orm.getMigrator().up();
  const fork = orm.em.fork({});

  // const post = fork.create(Post, { title: "my first post" });
  // await fork.persistAndFlush(post);
  // await orm.em.nativeInsert(Post, { title: "my first post" });

  const posts = await fork.find(Post, {});
  console.log(posts);

  const app: Application = express();
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    context: () => ({ em: fork }),
  });

  await apolloServer.start();
  apolloServer.applyMiddleware({ app });

  if (!__prod__) app.use(morgan("dev"));

  app.get("/", (_, res) => {
    res.send("hello");
  });

  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    if (!__prod__)
      console.log(
        `[server]: server is listening on port ${port}`.yellow.underline
      );
  });
};

main().catch((err) => {
  console.log(err);
});
