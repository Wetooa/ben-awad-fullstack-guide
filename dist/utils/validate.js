"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const validate = (options) => {
    const err = [];
    const emailRegex = /^([\w\.\-]+)@([\w\-]+)((\.(\w){2,3})+)$/;
    if (options.email && !options.email.match(emailRegex)) {
        err.push({
            field: "email",
            message: "Invalid email!",
        });
    }
    if (options.username.length <= 2) {
        err.push({
            field: "username",
            message: "Length must be greater than 2!",
        });
    }
    if (options.password.length <= 2) {
        err.push({
            field: "password",
            message: "Length must be greater than 2!",
        });
    }
    return err;
};
exports.validate = validate;
//# sourceMappingURL=validate.js.map