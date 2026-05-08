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
const service_1 = require("./common/service");
const user_1 = require("./modules/user");
const response_1 = require("./common/response");
const node_stream_1 = require("node:stream");
const node_util_1 = require("node:util");
const s3WriteStream = (0, node_util_1.promisify)(node_stream_1.pipeline);
const bootstrap = async () => {
    const app = (0, express_1.default)();
    app.use(express_1.default.json(), (0, cors_1.default)());
    app.get("/", (req, res) => {
        res.json({ message: "Hello World" });
    });
    app.use("/auth", modules_1.authRouter);
    app.use("/user", user_1.userRouter);
    app.get("/uploads/*path", async (req, res) => {
        const { download, fileName } = req.query;
        const { path } = req.params;
        const Key = path.join("/");
        const { Body, ContentType } = await service_1.s3Service.getAsset({ Key });
        res.setHeader("Content-Type", ContentType || "application/octet-stream");
        res.set("Cross-Origin-Resource-Policy", "cross-origin");
        if (download === "true") {
            res.setHeader("Content-Disposition", `attachment; filename="${fileName || Key.split("/").pop()}"`);
        }
        return await s3WriteStream(Body, res);
    });
    app.get("/presigned/*path", async (req, res) => {
        const { download, fileName } = req.query;
        const { path } = req.params;
        const Key = path.join("/");
        const url = await service_1.s3Service.createPresignedFetchLink({ Key, download, fileName });
        return (0, response_1.successResponse)({ res, data: { url } });
    });
    app.use("/*dummy", (req, res) => {
        res.status(404).json({ message: "page not found" });
    });
    app.use(middleware_1.globalErrorHandler);
    await (0, connection_db_1.default)();
    await service_1.redisService.connect();
    app.listen(config_1.PORT, () => {
        console.log(`Server is running on port ${config_1.PORT}`);
    });
};
exports.bootstrap = bootstrap;
