"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReplyUpdoot = exports.PostUpdoot = void 0;
const type_graphql_1 = require("type-graphql");
const typeorm_1 = require("typeorm");
const Post_1 = require("./Post");
const Reply_1 = require("./Reply");
const User_1 = require("./User");
let Updoot = class Updoot extends typeorm_1.BaseEntity {
};
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int),
    (0, typeorm_1.Column)({ type: "int" }),
    __metadata("design:type", Number)
], Updoot.prototype, "value", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int),
    (0, typeorm_1.PrimaryColumn)(),
    __metadata("design:type", Number)
], Updoot.prototype, "userId", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => User_1.User),
    (0, typeorm_1.ManyToMany)(() => User_1.User, (user) => user.updoots),
    __metadata("design:type", User_1.User)
], Updoot.prototype, "user", void 0);
Updoot = __decorate([
    (0, type_graphql_1.ObjectType)()
], Updoot);
let PostUpdoot = class PostUpdoot extends Updoot {
};
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int),
    (0, typeorm_1.PrimaryColumn)(),
    __metadata("design:type", Number)
], PostUpdoot.prototype, "postId", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Post_1.Post),
    (0, typeorm_1.ManyToMany)(() => Post_1.Post, (post) => post.updoots, {
        onDelete: "CASCADE",
        nullable: true,
    }),
    __metadata("design:type", Post_1.Post)
], PostUpdoot.prototype, "post", void 0);
PostUpdoot = __decorate([
    (0, type_graphql_1.ObjectType)(),
    (0, typeorm_1.Entity)()
], PostUpdoot);
exports.PostUpdoot = PostUpdoot;
let ReplyUpdoot = class ReplyUpdoot extends Updoot {
};
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int),
    (0, typeorm_1.PrimaryColumn)(),
    __metadata("design:type", Number)
], ReplyUpdoot.prototype, "replyId", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Reply_1.Reply),
    (0, typeorm_1.ManyToMany)(() => Reply_1.Reply, (reply) => reply.updoots, {
        onDelete: "CASCADE",
        nullable: true,
    }),
    __metadata("design:type", Post_1.Post)
], ReplyUpdoot.prototype, "reply", void 0);
ReplyUpdoot = __decorate([
    (0, type_graphql_1.ObjectType)(),
    (0, typeorm_1.Entity)()
], ReplyUpdoot);
exports.ReplyUpdoot = ReplyUpdoot;
//# sourceMappingURL=Updoot.js.map