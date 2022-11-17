"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserResolver = exports.FieldError = exports.UsernamePasswordInput = void 0;
const type_graphql_1 = require("type-graphql");
const User_1 = require("../entities/User");
const argon2_1 = __importDefault(require("argon2"));
const constants_1 = require("../constants");
const validate_1 = require("../utils/validate");
const sendEmail_1 = require("../utils/sendEmail");
const uuid_1 = require("uuid");
let UsernamePasswordInput = class UsernamePasswordInput {
};
__decorate([
    (0, type_graphql_1.Field)(() => String)
], UsernamePasswordInput.prototype, "username", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true })
], UsernamePasswordInput.prototype, "email", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String)
], UsernamePasswordInput.prototype, "password", void 0);
UsernamePasswordInput = __decorate([
    (0, type_graphql_1.InputType)()
], UsernamePasswordInput);
exports.UsernamePasswordInput = UsernamePasswordInput;
let FieldError = class FieldError {
};
__decorate([
    (0, type_graphql_1.Field)(() => String)
], FieldError.prototype, "field", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String)
], FieldError.prototype, "message", void 0);
FieldError = __decorate([
    (0, type_graphql_1.ObjectType)()
], FieldError);
exports.FieldError = FieldError;
let UserResponse = class UserResponse {
};
__decorate([
    (0, type_graphql_1.Field)(() => [FieldError], { nullable: true })
], UserResponse.prototype, "errors", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => User_1.User, { nullable: true })
], UserResponse.prototype, "user", void 0);
UserResponse = __decorate([
    (0, type_graphql_1.ObjectType)()
], UserResponse);
let UserResolver = class UserResolver {
    changePassword(token, newPassword, reTypePassword, { redis, em }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (newPassword.length <= 2) {
                return {
                    errors: [
                        {
                            field: "newPassword",
                            message: "Length must be greater than 2!",
                        },
                    ],
                };
            }
            if (newPassword !== reTypePassword) {
                return {
                    errors: [
                        {
                            field: "reTypePassword",
                            message: "Passwords don't match!",
                        },
                    ],
                };
            }
            const userId = yield redis.get(constants_1.FORGET_PASSWORD_PREFIX + token);
            if (!userId) {
                return {
                    errors: [
                        {
                            field: "token",
                            message: "Token is expired!",
                        },
                    ],
                };
            }
            const user = yield em.findOne(User_1.User, { id: parseInt(userId) });
            if (!user) {
                return {
                    errors: [
                        {
                            field: "token",
                            message: "User no longer exists!",
                        },
                    ],
                };
            }
            user.password = yield argon2_1.default.hash(newPassword);
            yield em.persistAndFlush(user);
            return { user };
        });
    }
    forgotPassword(email, { em, redis }) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield em.findOne(User_1.User, { email });
            if (!user) {
                return false;
            }
            const token = (0, uuid_1.v4)();
            yield redis.set(constants_1.FORGET_PASSWORD_PREFIX + token, user.id, "EX", 1000 * 60 * 60 * 24 * 3);
            yield (0, sendEmail_1.sendEmail)(email, `<a href="http://localhost:3000/change-password/${token}">reset password</a>`);
            return true;
        });
    }
    me({ em, req }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.session.userId) {
                return null;
            }
            const user = yield em.findOne(User_1.User, { id: req.session.userId });
            return user;
        });
    }
    getAllUsers({ em }) {
        return __awaiter(this, void 0, void 0, function* () {
            const users = yield em.find(User_1.User, {});
            return users;
        });
    }
    register(options, { req, em }) {
        return __awaiter(this, void 0, void 0, function* () {
            const err = (0, validate_1.validate)(options);
            if (err.length >= 1)
                return { errors: err };
            const hashedPassword = yield argon2_1.default.hash(options.password);
            const user = em.create(User_1.User, {
                username: options.username,
                password: hashedPassword,
                email: options.email,
            });
            try {
                yield em.persistAndFlush(user);
            }
            catch (error) {
                if (error.code === "23505") {
                    let fieldWithError = error.detail.match(/(?<=\()\w*(?=\)=\()/)[0];
                    return {
                        errors: [
                            {
                                field: fieldWithError,
                                message: fieldWithError + " already taken!",
                            },
                        ],
                    };
                }
            }
            req.session.userId = user.id;
            return {
                user,
            };
        });
    }
    login(options, { em, req }) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield em.findOne(User_1.User, {
                username: options.username,
            });
            if (!user) {
                return {
                    errors: [
                        {
                            field: "username",
                            message: "Username doesn't exist!",
                        },
                    ],
                };
            }
            const isMatch = yield argon2_1.default.verify(user.password, options.password);
            if (!isMatch) {
                return {
                    errors: [
                        {
                            field: "password",
                            message: "Passwords don't match!",
                        },
                    ],
                };
            }
            req.session.userId = user.id;
            return {
                user,
            };
        });
    }
    logout({ req, res }) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => req.session.destroy((err) => {
                if (err) {
                    console.log(err);
                    resolve(false);
                    return;
                }
                res.clearCookie(constants_1.COOKIE_NAME);
                resolve(true);
            }));
        });
    }
};
__decorate([
    (0, type_graphql_1.Mutation)(() => UserResponse),
    __param(0, (0, type_graphql_1.Arg)("token", () => String)),
    __param(1, (0, type_graphql_1.Arg)("newPassword", () => String)),
    __param(2, (0, type_graphql_1.Arg)("reTypePassword", () => String)),
    __param(3, (0, type_graphql_1.Ctx)())
], UserResolver.prototype, "changePassword", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean),
    __param(0, (0, type_graphql_1.Arg)("email", () => String)),
    __param(1, (0, type_graphql_1.Ctx)())
], UserResolver.prototype, "forgotPassword", null);
__decorate([
    (0, type_graphql_1.Query)(() => User_1.User, { nullable: true }),
    __param(0, (0, type_graphql_1.Ctx)())
], UserResolver.prototype, "me", null);
__decorate([
    (0, type_graphql_1.Query)(() => [User_1.User]),
    __param(0, (0, type_graphql_1.Ctx)())
], UserResolver.prototype, "getAllUsers", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => UserResponse),
    __param(0, (0, type_graphql_1.Arg)("options", () => UsernamePasswordInput)),
    __param(1, (0, type_graphql_1.Ctx)())
], UserResolver.prototype, "register", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => UserResponse),
    __param(0, (0, type_graphql_1.Arg)("options", () => UsernamePasswordInput)),
    __param(1, (0, type_graphql_1.Ctx)())
], UserResolver.prototype, "login", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean),
    __param(0, (0, type_graphql_1.Ctx)())
], UserResolver.prototype, "logout", null);
UserResolver = __decorate([
    (0, type_graphql_1.Resolver)()
], UserResolver);
exports.UserResolver = UserResolver;
//# sourceMappingURL=user.js.map