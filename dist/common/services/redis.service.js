"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisService = exports.RedisService = void 0;
const redis_1 = require("redis");
const config_1 = require("../../config/config");
const enums_1 = require("../enums");
class RedisService {
    client;
    constructor() {
        this.client = (0, redis_1.createClient)({ url: config_1.REDIS_URI });
        this.handelEvents();
    }
    handelEvents() {
        this.client.on("error", (error) => { console.log(`REDIS ERROR ,,,${error}`); });
        this.client.on("ready", () => {
            console.log(`REDIS IS READY`);
        });
    }
    async connect() {
        await this.client.connect();
        console.log(`redis is connected`);
    }
    otpKey = ({ email, subject = enums_1.EmailEnum.CONFIRM_EMAIL }) => {
        return `OTP::User::${email}::${subject}`;
    };
    maxAttemptOtpKey = ({ email, subject = enums_1.EmailEnum.CONFIRM_EMAIL }) => {
        return `${this.otpKey({ email, subject })}::MaxTrial`;
    };
    blockOtpKey = ({ email, subject = enums_1.EmailEnum.CONFIRM_EMAIL }) => {
        return `${this.otpKey({ email, subject })}::Block`;
    };
    baseRevokeTokenKey = (userId) => {
        return `RevokeToken::${userId.toString()}`;
    };
    revokeTokenKey = ({ userId, jti }) => {
        return `${this.baseRevokeTokenKey(userId)}::${jti}`;
    };
    set = async ({ key, value, ttl }) => {
        try {
            const data = typeof value === "string" ? value : JSON.stringify(value);
            return ttl ? await this.client.setEx(key, ttl, data) : await this.client.set(key, data);
        }
        catch (error) {
            console.error("Redis SET error:", error);
            return null;
        }
    };
    get = async (key) => {
        try {
            try {
                return JSON.parse(await this.client.get(key));
            }
            catch {
                return await this.client.get(key);
            }
        }
        catch (error) {
            console.error("Redis GET error:", error);
            return;
        }
    };
    update = async ({ key, value, ttl }) => {
        try {
            if (!await this.client.exists(key))
                return 0;
            return await this.set({ key, value, ttl });
        }
        catch (error) {
            console.error("Redis UPDATE error:", error);
            return null;
        }
    };
    deleteKey = async (key) => {
        try {
            return await this.client.del(key);
        }
        catch (error) {
            console.error("Redis DELETE error:", error);
            return 0;
        }
    };
    expire = async ({ key, ttl }) => {
        try {
            return await this.client.expire(key, ttl);
        }
        catch (error) {
            console.error("Redis EXPIRE error:", error);
            return 0;
        }
    };
    ttl = async (key) => {
        try {
            return await this.client.ttl(key);
        }
        catch (error) {
            console.error("Redis TTL error:", error);
            return -2;
        }
    };
    mGet = async (keys) => {
        try {
            if (!keys.length)
                return 0;
            return await this.client.mGet(keys);
        }
        catch (error) {
            console.error("Redis mGet error:", error);
            return null;
        }
    };
    keys = async (prefix) => {
        try {
            return await this.client.keys(`${prefix}*`);
        }
        catch (error) {
            console.error("Redis KEYS error:", error);
            return [];
        }
    };
    exists = async (key) => {
        try {
            return await this.client.exists(key);
        }
        catch (error) {
            console.error("Redis EXISTS error:", error);
            return -2;
        }
    };
    incr = async (key) => {
        try {
            return await this.client.incr(key);
        }
        catch (error) {
            console.error("Redis INCR error:", error);
            return -2;
        }
    };
}
exports.RedisService = RedisService;
exports.redisService = new RedisService();
