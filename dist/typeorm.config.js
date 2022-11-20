"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Post_1 = require("./entities/Post");
const User_1 = require("./entities/User");
exports.default = {
    type: "postgres",
    database: "bafullstack2",
    username: "postgres",
    password: "postgres",
    logging: true,
    synchronize: true,
    entities: [Post_1.Post, User_1.User],
};
//# sourceMappingURL=typeorm.config.js.map