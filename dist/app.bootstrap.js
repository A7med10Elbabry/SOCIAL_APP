"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bootstrap = void 0;
const express_1 = __importDefault(require("express"));
const modules_1 = require("./modules");
const cors_1 = __importDefault(require("cors"));
const middleware_1 = require("./middleware");
const config_1 = require("./config/config");
const connection_db_1 = __importDefault(require("./DB/connection.db"));
const services_1 = require("./common/services");
const user_1 = require("./modules/user");
const bootstrap = async () => {
    const app = (0, express_1.default)();
    app.use((0, cors_1.default)(), express_1.default.json());
    app.get("/", (req, res) => {
        res.json({ message: "Hello World" });
    });
    app.use("/auth", modules_1.authRouter);
    app.use("/user", user_1.userRouter);
    app.use("/*dummy", (req, res) => {
        res.status(404).json({ message: "page not found" });
    });
    app.use(middleware_1.globalErrorHandler);
    await (0, connection_db_1.default)();
    await services_1.redisService.connect();
    app.listen(config_1.PORT, () => {
        console.log(`Server is running on port ${config_1.PORT}`);
    });
};
exports.bootstrap = bootstrap;
