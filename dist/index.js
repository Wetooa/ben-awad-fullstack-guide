"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.appDataSource = void 0;
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const apollo_server_express_1 = require("apollo-server-express");
const type_graphql_1 = require("type-graphql");
const post_1 = require("./resolvers/post");
const user_1 = require("./resolvers/user");
const ioredis_1 = __importDefault(require("ioredis"));
const express_session_1 = __importDefault(require("express-session"));
const connect_redis_1 = __importDefault(require("connect-redis"));
const constants_1 = require("./constants");
const morgan_1 = __importDefault(require("morgan"));
require("dotenv/config");
require("colors");
const cors_1 = __importDefault(require("cors"));
const typeorm_config_1 = __importDefault(require("./typeorm.config"));
const typeorm_1 = require("typeorm");
const createUserLoader_1 = require("./utils/createUserLoader");
const createUpdootLoader_1 = require("./utils/createUpdootLoader");
exports.appDataSource = new typeorm_1.DataSource(typeorm_config_1.default);
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    yield exports.appDataSource.initialize();
    yield exports.appDataSource.runMigrations({ transaction: "all" });
    const app = (0, express_1.default)();
    app.use((0, cors_1.default)({
        origin: ["http://localhost:3000", "https://studio.apollographql.com"],
        credentials: true,
    }));
    let RedisStore = (0, connect_redis_1.default)(express_session_1.default);
    let redis = new ioredis_1.default();
    app.set("trust proxy", !constants_1.__prod__);
    app.use((0, express_session_1.default)({
        name: constants_1.COOKIE_NAME,
        store: new RedisStore({
            client: redis,
            disableTouch: true,
        }),
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
            httpOnly: false,
            secure: true,
            sameSite: "none",
        },
        secret: "envlater",
        resave: false,
        saveUninitialized: false,
        proxy: true,
    }));
    const apolloServer = new apollo_server_express_1.ApolloServer({
        schema: yield (0, type_graphql_1.buildSchema)({
            resolvers: [post_1.PostResolver, user_1.UserResolver],
            validate: false,
        }),
        context: ({ req, res }) => ({
            req,
            res,
            redis,
            userLoader: (0, createUserLoader_1.createUserLoader)(),
            updootLoader: (0, createUpdootLoader_1.createUpdootLoader)(),
        }),
    });
    yield apolloServer.start();
    apolloServer.applyMiddleware({
        app,
        cors: false,
    });
    if (!constants_1.__prod__)
        app.use((0, morgan_1.default)("dev"));
    app.get("/", (_, res) => {
        res.send("hello");
    });
    const port = process.env.PORT || 5000;
    app.listen(port, () => {
        if (!constants_1.__prod__)
            console.log(`[server]: server is listening on port ${port}`.yellow.underline);
    });
});
main().catch((err) => {
    console.log(err);
});
//# sourceMappingURL=index.js.map