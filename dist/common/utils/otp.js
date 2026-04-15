"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRandomOtp = void 0;
const createRandomOtp = () => {
    return Math.floor(Math.random() * (999999 - 100000 + 1) + 100000);
};
exports.createRandomOtp = createRandomOtp;
