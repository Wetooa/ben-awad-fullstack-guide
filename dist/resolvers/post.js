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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostResolver = exports.PostInput = void 0;
const Post_1 = require("../entities/Post");
const type_graphql_1 = require("type-graphql");
const isAuth_1 = require("../middleware/isAuth");
const user_1 = require("./user");
const __1 = require("../");
const postValidate_1 = require("../utils/postValidate");
const Updoot_1 = require("../entities/Updoot");
const User_1 = require("../entities/User");
let PostInput = class PostInput {
};
__decorate([
    (0, type_graphql_1.Field)(() => String),
    __metadata("design:type", String)
], PostInput.prototype, "title", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    __metadata("design:type", String)
], PostInput.prototype, "text", void 0);
PostInput = __decorate([
    (0, type_graphql_1.InputType)()
], PostInput);
exports.PostInput = PostInput;
let PostResponse = class PostResponse {
};
__decorate([
    (0, type_graphql_1.Field)(() => [user_1.FieldError], { nullable: true }),
    __metadata("design:type", Array)
], PostResponse.prototype, "errors", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Post_1.Post, { nullable: true }),
    __metadata("design:type", Post_1.Post)
], PostResponse.prototype, "post", void 0);
PostResponse = __decorate([
    (0, type_graphql_1.ObjectType)()
], PostResponse);
let ReplyResponse = class ReplyResponse {
};
__decorate([
    (0, type_graphql_1.Field)(() => [user_1.FieldError], { nullable: true }),
    __metadata("design:type", Array)
], ReplyResponse.prototype, "errors", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Boolean, { nullable: true }),
    __metadata("design:type", Boolean)
], ReplyResponse.prototype, "success", void 0);
ReplyResponse = __decorate([
    (0, type_graphql_1.ObjectType)()
], ReplyResponse);
let PaginatedPosts = class PaginatedPosts {
};
__decorate([
    (0, type_graphql_1.Field)(() => [Post_1.Post]),
    __metadata("design:type", Array)
], PaginatedPosts.prototype, "posts", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Boolean),
    __metadata("design:type", Boolean)
], PaginatedPosts.prototype, "hasMore", void 0);
PaginatedPosts = __decorate([
    (0, type_graphql_1.ObjectType)()
], PaginatedPosts);
let PostResolver = class PostResolver {
    textSnippet(root) {
        return root.text.length >= 100
            ? `${root.text.slice(0, 100)}...`
            : root.text;
    }
    creator(post, { userLoader }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield userLoader.load(post.creatorId);
        });
    }
    voteStatus(post, { updootLoader, req }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.session.userId) {
                return null;
            }
            const updoot = yield updootLoader.load({
                postId: post.id,
                userId: req.session.userId,
            });
            return updoot ? updoot.value : null;
        });
    }
    reply({ req }, text, replyId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!replyId) {
                return { success: false };
            }
            if (text.length < 3) {
                return {
                    errors: [
                        {
                            field: "text",
                            message: "text field must be longer than 3 characters",
                        },
                    ],
                };
            }
            const post = yield Post_1.Post.findOne({ where: { id: replyId } });
            if (!post) {
                return { success: false };
            }
            const newReply = Post_1.Post.create({
                text,
                creatorId: req.session.userId,
                replyId,
            });
            newReply.repliedTo = post;
            yield __1.appDataSource.manager.save(newReply);
            return { success: true };
        });
    }
    posts(limit, cursor) {
        return __awaiter(this, void 0, void 0, function* () {
            const userRepo = __1.appDataSource.getRepository(Post_1.Post);
            const realLimit = Math.min(50, limit);
            const realLimitPlusOne = realLimit + 1;
            const replacements = [realLimitPlusOne];
            if (cursor) {
                replacements.push(new Date(parseInt(cursor)));
            }
            const posts = yield userRepo.query(`
      SELECT p.*
      FROM post p
      WHERE p."replyId" IS NULL
      ${cursor && `AND p."createdAt" < $2`}
      ORDER BY p."createdAt" DESC
      LIMIT $1
    `, replacements);
            return {
                posts: posts.slice(0, realLimit),
                hasMore: posts.length === realLimitPlusOne,
            };
        });
    }
    post(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const parent = yield Post_1.Post.findOne({ where: { id } });
            if (!parent) {
                throw new Error("query failed");
            }
            return yield __1.appDataSource
                .getTreeRepository(Post_1.Post)
                .findDescendantsTree(parent);
        });
    }
    createPost(input, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            const errors = (0, postValidate_1.postValidate)(input);
            if (errors.length > 0)
                return { errors };
            yield Post_1.Post.create(Object.assign(Object.assign({}, input), { creatorId: req.session.userId })).save();
            return {};
        });
    }
    updatePost(id, input, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            const errors = (0, postValidate_1.postValidate)(input);
            if (errors.length > 0)
                return { errors };
            const { text, title } = input;
            const result = yield __1.appDataSource
                .createQueryBuilder()
                .update(Post_1.Post)
                .set({ title, text })
                .where('id = :id and "creatorId" = :creatorId', {
                id,
                creatorId: req.session.userId,
            })
                .returning("*")
                .execute();
            return { post: result.raw[0] };
        });
    }
    deletePost(id, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            yield Post_1.Post.delete({ id, creatorId: req.session.userId });
            return true;
        });
    }
    vote(postId, value, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            const isUpdoot = value !== -1;
            const realValue = isUpdoot ? 1 : -1;
            const { userId } = req.session;
            const updoot = yield Updoot_1.Updoot.findOne({ where: { userId, postId } });
            if (updoot) {
                if (updoot.value === realValue) {
                    yield __1.appDataSource.transaction((tm) => __awaiter(this, void 0, void 0, function* () {
                        yield tm.query(`
            UPDATE post
            SET points = points - $1
            WHERE id = $2
          `, [realValue, postId]);
                        yield tm.query(`
            DELETE FROM updoot u
            WHERE u."userId" = $1
            AND u."postId" = $2
          `, [userId, postId]);
                    }));
                }
                else {
                    yield __1.appDataSource.transaction((tm) => __awaiter(this, void 0, void 0, function* () {
                        yield tm.query(`
            UPDATE post
            SET points = points + $1
            WHERE id = $2
          `, [realValue * 2, postId]);
                        yield tm.query(`
            UPDATE updoot
            SET value = $1
            WHERE "userId" = $2
            AND "postId" = $3
          `, [realValue, userId, postId]);
                    }));
                }
            }
            else {
                yield __1.appDataSource.transaction((tm) => __awaiter(this, void 0, void 0, function* () {
                    yield tm.query(`
          INSERT INTO updoot ("userId", "postId", value)
          VALUES ($1, $2, $3)
        `, [userId, postId, realValue]);
                    yield tm.query(`
          UPDATE post
          SET points = points + $1
          WHERE id = $2
        `, [realValue, postId]);
                }));
            }
            return true;
        });
    }
};
__decorate([
    (0, type_graphql_1.FieldResolver)(() => String),
    __param(0, (0, type_graphql_1.Root)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Post_1.Post]),
    __metadata("design:returntype", void 0)
], PostResolver.prototype, "textSnippet", null);
__decorate([
    (0, type_graphql_1.FieldResolver)(() => User_1.User),
    __param(0, (0, type_graphql_1.Root)()),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Post_1.Post, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "creator", null);
__decorate([
    (0, type_graphql_1.FieldResolver)(() => type_graphql_1.Int, { nullable: true }),
    __param(0, (0, type_graphql_1.Root)()),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Post_1.Post, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "voteStatus", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => ReplyResponse),
    (0, type_graphql_1.UseMiddleware)(isAuth_1.isAuth),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("text", () => String)),
    __param(2, (0, type_graphql_1.Arg)("replyId", () => type_graphql_1.Int)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Number]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "reply", null);
__decorate([
    (0, type_graphql_1.Query)(() => PaginatedPosts),
    __param(0, (0, type_graphql_1.Arg)("limit", () => type_graphql_1.Int)),
    __param(1, (0, type_graphql_1.Arg)("cursor", () => String)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "posts", null);
__decorate([
    (0, type_graphql_1.Query)(() => Post_1.Post, { nullable: true }),
    __param(0, (0, type_graphql_1.Arg)("id", () => type_graphql_1.Int)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "post", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => PostResponse),
    (0, type_graphql_1.UseMiddleware)(isAuth_1.isAuth),
    __param(0, (0, type_graphql_1.Arg)("input", () => PostInput)),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [PostInput, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "createPost", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => PostResponse),
    (0, type_graphql_1.UseMiddleware)(isAuth_1.isAuth),
    __param(0, (0, type_graphql_1.Arg)("id", () => type_graphql_1.Int)),
    __param(1, (0, type_graphql_1.Arg)("input", () => PostInput)),
    __param(2, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, PostInput, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "updatePost", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean),
    (0, type_graphql_1.UseMiddleware)(isAuth_1.isAuth),
    __param(0, (0, type_graphql_1.Arg)("id", () => type_graphql_1.Int)),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "deletePost", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean),
    (0, type_graphql_1.UseMiddleware)(isAuth_1.isAuth),
    __param(0, (0, type_graphql_1.Arg)("postId", () => type_graphql_1.Int)),
    __param(1, (0, type_graphql_1.Arg)("value", () => type_graphql_1.Int)),
    __param(2, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "vote", null);
PostResolver = __decorate([
    (0, type_graphql_1.Resolver)(Post_1.Post)
], PostResolver);
exports.PostResolver = PostResolver;
//# sourceMappingURL=post.js.map