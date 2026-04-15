"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compare_hash = exports.generate_hash = void 0;
const bcrypt_1 = require("bcrypt");
const config_js_1 = require("../../../config/config.js");
const generate_hash = async ({ plain_text, salt = config_js_1.SALT_ROUND }) => {
    return await (0, bcrypt_1.hash)(plain_text, salt);
};
exports.generate_hash = generate_hash;
const compare_hash = async ({ plain_text, cipher_text }) => {
    return await (0, bcrypt_1.compare)(plain_text, cipher_text);
};
exports.compare_hash = compare_hash;
