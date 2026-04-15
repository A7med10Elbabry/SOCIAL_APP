"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authentication = void 0;
const exceptions_1 = require("../common/exceptions");
const enums_1 = require("../common/enums");
const services_1 = require("../common/services");
const authentication = (tokenType = enums_1.TokenTypeEnum.ACCESS) => {
    const tokenService = new services_1.TokenService();
    return async (req, res, next) => {
        if (!req.headers.authorization) {
            throw new exceptions_1.UnauthorizedException("missing authorization key");
        }
        const { user, decoded } = await tokenService.decodeToken({ token: req.headers?.authorization, tokenType });
        req.user = user;
        req.decoded = decoded;
        next();
    };
};
exports.authentication = authentication;
