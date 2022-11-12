// import { Post } from "./entities/Post";

import mikroOrmConfig from "./mikro-orm.config";
import express, { Application } from "express";
import { MikroORM } from "@mikro-orm/core";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";

import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";

import * as redis from "redis";
import session from "express-session";
import connectRedis from "connect-redis";

import { __prod__ } from "./constants";
import morgan from "morgan";

import "reflect-metadata";
import "dotenv/config";
import "colors";
import cors from "cors";

const main = async () => {
  const orm = await MikroORM.init(mikroOrmConfig);
  await orm.getMigrator().up();
  const fork = orm.em.fork({});

  // const post = fork.create(Post, { title: "my first post" });
  // await fork.persistAndFlush(post);
  // await orm.em.nativeInsert(Post, { title: "my first post" });

  // const posts = await fork.find(Post, {});
  // console.log(posts);

  const app: Application = express();
  app.use(
    cors({
      origin: ["http://localhost:3000", "https://studio.apollographql.com"],
      credentials: true,
    })
  );

  let RedisStore = connectRedis(session);
  let redisClient: any = redis.createClient({ legacyMode: true });
  redisClient
    .connect()
    .then(() => console.log("[redis]: redis client connected".red.underline))
    .catch((_: Error) => {
      console.log("[redis]: redis client failed to conenct".bgRed.underline);
    });

  app.set("trust proxy", !__prod__);

  app.use(
    session({
      name: "qid",
      store: new RedisStore({
        client: redisClient,
        // disableTouch: true,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
        httpOnly: false,
        secure: false, // cookie only works in https
        sameSite: "lax", // csrf (changed this from lax and cookie was now sent to client)
      },
      secret: "envlater",
      resave: false,
      saveUninitialized: false,
      proxy: true,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }) => ({ em: fork, req, res }),
  });
  await apolloServer.start();
  apolloServer.applyMiddleware({
    app,
    cors: false,
  });

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
