"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const Post_1 = require("./entities/Post");
const Reply_1 = require("./entities/Reply");
const Updoot_1 = require("./entities/Updoot");
const User_1 = require("./entities/User");
exports.default = {
    type: "postgres",
    database: "bafullstack2",
    username: "postgres",
    password: "postgres",
    logging: true,
    synchronize: true,
    entities: [Post_1.Post, User_1.User, Updoot_1.PostUpdoot, Updoot_1.ReplyUpdoot, Reply_1.Reply],
    migrations: [path_1.default.join(__dirname, "./migrations/**/*")],
};
//# sourceMappingURL=typeorm.config.js.map