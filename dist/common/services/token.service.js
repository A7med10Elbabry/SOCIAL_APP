"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../../config/config");
const enums_1 = require("../enums");
const token_enum_1 = require("../enums/token.enum");
const exceptions_1 = require("../exceptions");
const repository_1 = require("../../DB/repository");
const redis_service_1 = require("./redis.service");
const node_crypto_1 = require("node:crypto");
class TokenService {
    userRepository;
    redis;
    constructor() {
        this.userRepository = new repository_1.UserRepository();
        this.redis = redis_service_1.redisService;
    }
    async sign({ payload, secret = config_1.USER_TOKEN_SECERET_KEY, options }) {
        return jsonwebtoken_1.default.sign(payload, secret, options);
    }
    async verify({ token, secret = config_1.USER_TOKEN_SECERET_KEY }) {
        return jsonwebtoken_1.default.verify(token, secret);
    }
    getSignatureLevel = async (tokenType, signatureLevel) => {
        const signatures = await this.getTokenSignature(signatureLevel);
        let signature;
        switch (tokenType) {
            case token_enum_1.TokenTypeEnum.REFRESH:
                signature = signatures.RefreshSignature;
                break;
            default:
                signature = signatures.accessSignature;
                break;
        }
        return signature;
    };
    getTokenSignature = async (role) => {
        let signature;
        switch (role) {
            case enums_1.RoleEnum.ADMIN:
                signature = {
                    accessSignature: config_1.SYSTEM_TOKEN_SECERET_KEY,
                    RefreshSignature: config_1.SYSTEM_REFRESH_TOKEN_SECERET_KEY
                };
                break;
            default:
                signature = {
                    accessSignature: config_1.USER_TOKEN_SECERET_KEY,
                    RefreshSignature: config_1.USER_REFRESH_TOKEN_SECERET_KEY
                };
                break;
        }
        return signature;
    };
    CreateLoginCredentials = async (user, issuer) => {
        const { accessSignature, RefreshSignature } = await this.getTokenSignature(user.role);
        const jwtid = (0, node_crypto_1.randomUUID)();
        const access_Token = await this.sign({
            payload: { sub: user._id },
            secret: accessSignature,
            options: {
                issuer,
                audience: [token_enum_1.TokenTypeEnum.ACCESS, user.role],
                expiresIn: config_1.ACCESS_EXPIRES_IN,
                jwtid
            }
        });
        const refreshToken = await this.sign({
            payload: { sub: user._id },
            secret: RefreshSignature,
            options: {
                issuer,
                audience: [token_enum_1.TokenTypeEnum.REFRESH, user.role],
                expiresIn: config_1.REFRESH_EXPIRSES_IN,
                jwtid
            }
        });
        return { access_Token, refreshToken };
    };
    decodeToken = async ({ token, tokenType = token_enum_1.TokenTypeEnum.ACCESS }) => {
        const decoded = jsonwebtoken_1.default.decode(token);
        console.log(decoded);
        if (!decoded?.aud?.length) {
            throw new Error("fail to decode this token", { cause: { status: 404 } });
        }
        const [tokenApproach, signatureLevel] = decoded.aud;
        if (tokenApproach == undefined || signatureLevel == undefined) {
            throw new exceptions_1.BadRequestException("missing token audience");
        }
        if (tokenType != tokenApproach) {
            throw new exceptions_1.BadRequestException("invalid token type");
        }
        console.log(this.redis.revokeTokenKey({ userId: decoded.sub, jti: decoded.jti }));
        if (decoded.jti && await this.redis.get(this.redis.revokeTokenKey({ userId: decoded.sub, jti: decoded.jti }))) {
            throw new exceptions_1.UnauthorizedException("Invalid login session");
        }
        const { accessSignature, RefreshSignature } = await this.getTokenSignature(signatureLevel);
        const verifyDate = await this.verify({
            token,
            secret: tokenType == token_enum_1.TokenTypeEnum.REFRESH ? RefreshSignature : accessSignature
        });
        const user = await this.userRepository.findOne({ filter: { _id: verifyDate.sub } });
        if (!user) {
            throw new Error(" not register account", { cause: { status: 404 } });
        }
        console.log({ verifyDate });
        if (user.changeCredentialsTime && user.changeCredentialsTime.getTime() >= (decoded.iat || 0) * 1000) {
            throw new exceptions_1.NotFoundException("invalid login session");
        }
        return { user, decoded };
    };
}
exports.TokenService = TokenService;
