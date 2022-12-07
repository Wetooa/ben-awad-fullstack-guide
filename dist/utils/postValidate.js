"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postValidate = void 0;
const postValidate = (input) => {
    const errors = [];
    if (input.title.length < 2) {
        errors.push({
            field: "title",
            message: "Title field cannot be empty!",
        });
    }
    if (input.text.length < 2) {
        errors.push({
            field: "text",
            message: "Text field cannot be empty!",
        });
    }
    return errors;
};
exports.postValidate = postValidate;
//# sourceMappingURL=postValidate.js.map