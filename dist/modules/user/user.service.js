"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const enums_1 = require("../../common/enums");
const service_1 = require("../../common/service");
const config_1 = require("../../config/config");
const token_service_1 = require("../../common/service/token.service");
const exceptions_1 = require("../../common/exceptions");
class UserService {
    redis;
    tokenService;
    constructor() {
        this.redis = service_1.redisService;
        this.tokenService = new token_service_1.TokenService();
    }
    async profile(user) {
        return user.toJSON();
    }
    async logout({ flag }, user, { jti, iat, sub }) {
        let status = 200;
        switch (flag) {
            case enums_1.LogoutEnum.ALL:
                user.changeCredentialsTime = new Date();
                await user.save();
                await this.redis.deleteKey(await this.redis.Keys(this.redis.revokeTokenKey({ userId: sub, jti })));
                break;
            default:
                await this.tokenService.createRevokeToken({ userId: sub, jti, ttl: iat + config_1.REFRESH_EXPIRSES_IN });
                status = 201;
                break;
        }
        return status;
    }
    async rotateToken(user, { jti, iat, sub }, issuer) {
        if ((iat + config_1.ACCESS_EXPIRES_IN) * 1000 >= Date.now() + (30000)) {
            throw new exceptions_1.ConflictException("current token is still valid");
        }
        await this.tokenService.createRevokeToken({ userId: sub, jti, ttl: iat + config_1.REFRESH_EXPIRSES_IN });
        return await this.tokenService.CreateLoginCredentials(user, issuer);
    }
}
exports.default = new UserService();
