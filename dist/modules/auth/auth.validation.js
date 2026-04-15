"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.confirmEmail = exports.signup = exports.login = exports.resendConfirmEmail = void 0;
const zod_1 = __importDefault(require("zod"));
const validation_1 = require("../../common/validation");
exports.resendConfirmEmail = {
    body: zod_1.default.strictObject({
        email: validation_1.genralValidationFeilds.email
    })
};
exports.login = {
    body: exports.resendConfirmEmail.body.safeExtend({
        password: validation_1.genralValidationFeilds.password
    })
};
exports.signup = {
    body: exports.login.body.safeExtend({
        username: validation_1.genralValidationFeilds.username,
        phone: validation_1.genralValidationFeilds.phone,
        confirmPassword: validation_1.genralValidationFeilds.confirmPassword,
    }).refine((data) => {
        return data.password === data.confirmPassword;
    }, {
        error: "confirmPassword doesn't match with password"
    })
};
exports.confirmEmail = {
    body: exports.resendConfirmEmail.body.safeExtend({
        otp: validation_1.genralValidationFeilds.otp
    })
};
