"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.genralValidationFeilds = void 0;
const zod_1 = require("zod");
exports.genralValidationFeilds = {
    email: zod_1.z.email({ error: "email is required" }),
    password: zod_1.z.string({ error: "password is required" }).regex(/^(?=.*[A-Z])(?=.*[\W_]).{8,50}$/, { error: "password must contain at least one uppercase letter and one special character" }).min(8).max(50),
    username: zod_1.z.string({ error: "username is required" }).min(2, { error: "username must be at least 2 characters" }).max(25, { error: "username maximum length is 25 characters" }),
    phone: zod_1.z.string().regex(/^(00201|\+201|01)(0|1|2|5)\d{8}$/).optional(),
    otp: zod_1.z.string().regex(/^\d{6}$/),
    confirmPassword: zod_1.z.string()
};
