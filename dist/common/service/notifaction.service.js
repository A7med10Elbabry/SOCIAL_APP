"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notifactionService = exports.NotifactionService = void 0;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
class NotifactionService {
    client;
    constructor() {
        var serviceAccount = JSON.parse((0, node_fs_1.readFileSync)((0, node_path_1.resolve)("./src/config/app-notifaction-c4375-firebase-adminsdk-fbsvc-6a99604623.json")));
        this.client = firebase_admin_1.default.initializeApp({
            credential: firebase_admin_1.default.credential.cert(serviceAccount)
        });
    }
    async sendNotifaction({ token, data }) {
        const massege = {
            token,
            data
        };
        return await this.client.messaging().send(massege);
    }
    async sendNotifactions({ tokens, data }) {
        Promise.allSettled(tokens.map((token) => {
            return this.sendNotifaction({ token, data });
        }));
    }
}
exports.NotifactionService = NotifactionService;
exports.notifactionService = new NotifactionService();
