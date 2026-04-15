"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decrypt = exports.encrypt = void 0;
const crypto_1 = __importDefault(require("crypto"));
const exceptions_1 = require("../../exceptions");
const buffer_1 = require("buffer");
const IV_LENGTH = 16;
const ENCRYPTION_SECRET_KEY = buffer_1.Buffer.from("51575367123987456369258741852369");
const encrypt = (text) => {
    const iv = crypto_1.default.randomBytes(IV_LENGTH);
    const cipher = crypto_1.default.createCipheriv('aes-256-cbc', ENCRYPTION_SECRET_KEY, iv);
    let encryption_data = cipher.update(text, 'utf-8', 'hex');
    encryption_data = cipher.final('hex');
    return `${iv.toString('hex')}:${encryption_data}`;
};
exports.encrypt = encrypt;
const decrypt = (encrypted_data) => {
    const [iv, encryption_text] = encrypted_data.split(':') || [];
    if (!iv || encryption_text) {
        throw new exceptions_1.BadRequestException("missing encryption parts");
    }
    const binaryLikeIV = buffer_1.Buffer.from(iv, 'hex');
    const decipher = crypto_1.default.createDecipheriv('aes-256-cbc', ENCRYPTION_SECRET_KEY, binaryLikeIV);
    let decypted_data = decipher.update(encrypted_data, 'hex', 'utf-8');
    decypted_data = decipher.final('utf-8');
    return `${decypted_data}`;
};
exports.decrypt = decrypt;
