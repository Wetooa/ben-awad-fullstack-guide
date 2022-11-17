// import { Post } from "./entities/Post";

import mikroOrmConfig from "./mikro-orm.config";
import express, { Application } from "express";
import { MikroORM } from "@mikro-orm/core";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { sendEmail } from "./utils/sendEmail";

import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";

import Redis from "ioredis";
import session from "express-session";
import connectRedis from "connect-redis";

import { COOKIE_NAME, __prod__ } from "./constants";
import morgan from "morgan";

import "reflect-metadata";
import "dotenv/config";
import "colors";
import cors from "cors";

const main = async () => {
  sendEmail("wetooa@wetooa.com", "hello there");
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
  let redis: any = new Redis();

  // for some reason this isn't needed anymore lol
  // redis
  //   .connect()
  //   .then(() => console.log("[redis]: redis client connected".red.underline))
  //   .catch((_: Error) => {
  //     console.log("[redis]: redis client failed to conenct".bgRed.underline);
  //   });

  app.set("trust proxy", !__prod__);

  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({
        client: redis,
        disableTouch: true,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
        httpOnly: false,
        secure: false, // cookie only works in https
        sameSite: "lax", // csrf (changed this from lax and cookie was now sent to client)

        // noticed smth, when using apollo server, use sameSite: "none" and secure: true, else, do sameSite: "lax" and secure: false
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
    context: ({ req, res }) => ({ em: fork, req, res, redis }),
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
