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
var Reply_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Reply = void 0;
const type_graphql_1 = require("type-graphql");
const typeorm_1 = require("typeorm");
const Post_1 = require("./Post");
const Updoot_1 = require("./Updoot");
const User_1 = require("./User");
let Reply = Reply_1 = class Reply extends typeorm_1.BaseEntity {
    constructor() {
        super(...arguments);
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }
};
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int),
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Reply.prototype, "id", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    (0, typeorm_1.Column)({ type: "text" }),
    __metadata("design:type", String)
], Reply.prototype, "text", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int, { nullable: true }),
    __metadata("design:type", Object)
], Reply.prototype, "voteStatus", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int),
    (0, typeorm_1.Column)({ type: "int", default: 0 }),
    __metadata("design:type", Number)
], Reply.prototype, "points", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int),
    (0, typeorm_1.Column)({ type: "int" }),
    __metadata("design:type", Number)
], Reply.prototype, "creatorId", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => User_1.User),
    (0, typeorm_1.ManyToOne)(() => User_1.User, (user) => user.posts),
    __metadata("design:type", User_1.User)
], Reply.prototype, "creator", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    (0, typeorm_1.CreateDateColumn)({ type: "timestamptz" }),
    __metadata("design:type", Object)
], Reply.prototype, "createdAt", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    (0, typeorm_1.UpdateDateColumn)({ type: "timestamptz" }),
    __metadata("design:type", Object)
], Reply.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Updoot_1.ReplyUpdoot, (updoot) => updoot.reply),
    __metadata("design:type", Array)
], Reply.prototype, "updoots", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int),
    (0, typeorm_1.Column)({ type: "int", nullable: true }),
    __metadata("design:type", Number)
], Reply.prototype, "postRepliedToId", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Post_1.Post),
    (0, typeorm_1.OneToOne)(() => Post_1.Post, (post) => post.replies, { nullable: true }),
    __metadata("design:type", Post_1.Post)
], Reply.prototype, "post", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Reply_1),
    (0, typeorm_1.TreeChildren)(),
    __metadata("design:type", Array)
], Reply.prototype, "replies", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Reply_1),
    (0, typeorm_1.TreeParent)(),
    __metadata("design:type", Reply)
], Reply.prototype, "repliedTo", void 0);
Reply = Reply_1 = __decorate([
    (0, type_graphql_1.ObjectType)(),
    (0, typeorm_1.Entity)(),
    (0, typeorm_1.Tree)("closure-table")
], Reply);
exports.Reply = Reply;
//# sourceMappingURL=Reply.js.map