"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const repository_1 = require("../../DB/repository");
const exceptions_1 = require("../../common/exceptions");
const security_1 = require("../../common/utils/security");
const email_1 = require("../../common/email");
const service_1 = require("../../common/service");
const enums_1 = require("../../common/enums");
const utils_1 = require("../../common/utils");
const token_service_1 = require("../../common/service/token.service");
class AuthService {
    UserRepository;
    redis;
    tokenService;
    constructor() {
        this.UserRepository = new repository_1.UserRepository();
        this.redis = service_1.redisService;
        this.tokenService = new token_service_1.TokenService();
    }
    async login(inputs, issuer) {
        const { email, password } = inputs;
        const user = await this.UserRepository.findOne({
            filter: { email, provider: enums_1.ProviderEnum.SYSTEM, confirmedEmail: { $exists: true } }
        });
        if (!user) {
            throw new exceptions_1.NotFoundException("invalid login credentials");
        }
        if (!await (0, security_1.compare_hash)({ plain_text: password, cipher_text: user.password })) {
            throw new exceptions_1.NotFoundException("invalid login credentials");
        }
        return await this.tokenService.CreateLoginCredentials(user, issuer);
    }
    async sendEmailOtp({ email, subject, title }) {
        const isBlockedTTL = await this.redis.ttl(this.redis.blockOtpKey({ email, subject }));
        if (isBlockedTTL > 0) {
            throw new exceptions_1.BadRequestException(`Sorry we cannot request new otp while are blocked please try again after ${isBlockedTTL}`);
        }
        const remainingOtpTTL = await this.redis.ttl(this.redis.otpKey({ email, subject }));
        if (remainingOtpTTL > 0) {
            throw new exceptions_1.BadRequestException(`Sorry we cannot request new otp while current orp still active please try again after ${remainingOtpTTL}`);
        }
        const maxTrial = await this.redis.get(this.redis.maxAttemptOtpKey({ email, subject }));
        if (maxTrial >= 3) {
            await this.redis.set({
                key: this.redis.blockOtpKey({ email, subject }),
                value: 1,
                ttl: 7 * 60
            });
            throw new exceptions_1.BadRequestException("you have reached the max trial");
        }
        const code = (0, utils_1.createRandomOtp)();
        await this.redis.set({
            key: this.redis.otpKey({ email, subject }),
            value: await (0, security_1.generate_hash)({ plain_text: `${code}` }),
            ttl: 120
        });
        email_1.emailEvent.emit("sendEmail", async () => {
            await (0, email_1.sendEmail)({
                to: email,
                subject,
                html: (0, email_1.emailTemplete)({ code, title })
            });
            await this.redis.incr(this.redis.maxAttemptOtpKey({ email, subject }));
        });
    }
    async signup({ email, password, username, phone }) {
        const checkUserExist = await this.UserRepository.findOne({ filter: { email },
            projection: "email",
        });
        if (checkUserExist) {
            checkUserExist.save();
            throw new exceptions_1.ConflictException("Email exists");
        }
        const user = await this.UserRepository.createOne({
            data: {
                email,
                password: await (0, security_1.generate_hash)({ plain_text: password }),
                username,
                phone: phone ? await (0, security_1.encrypt)(phone) : undefined
            }
        });
        await this.sendEmailOtp({ email, subject: enums_1.EmailEnum.CONFIRM_EMAIL, title: "Verfiy Email" });
        return user.toJSON();
    }
    async confirmEmail({ email, otp }) {
        const hashedOTP = await this.redis.get(this.redis.otpKey({ email, subject: enums_1.EmailEnum.CONFIRM_EMAIL }));
        if (!hashedOTP) {
            throw new exceptions_1.NotFoundException("Expired OTP");
        }
        const account = await this.UserRepository.findOne({ filter: { email, confirmEmail: { $exists: false }, provider: enums_1.ProviderEnum.SYSTEM, }, });
        if (!account) {
            throw new exceptions_1.NotFoundException("fail to finding matching account");
        }
        if (!await (0, security_1.compare_hash)({ plain_text: otp, cipher_text: hashedOTP })) {
            throw new exceptions_1.ConflictException("Invalid OTP");
        }
        account.confirmEmail = new Date();
        await account.save();
        await this.redis.deleteKey(await this.redis.Keys(this.redis.otpKey({ email, subject: enums_1.EmailEnum.CONFIRM_EMAIL })));
        return;
    }
    ;
    async resendConfirmEmail({ email }) {
        const account = await this.UserRepository.findOne({
            filter: {
                email,
                confirmEmail: { $exists: false },
                provider: enums_1.ProviderEnum.SYSTEM,
            },
        });
        if (!account) {
            throw new exceptions_1.NotFoundException("fail to finding matching account");
        }
        await this.sendEmailOtp({ email, subject: enums_1.EmailEnum.CONFIRM_EMAIL, title: "Verfiy Email" });
        return;
    }
    ;
}
exports.default = new AuthService();
