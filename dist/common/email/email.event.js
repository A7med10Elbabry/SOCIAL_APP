"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailEvent = void 0;
const events_1 = require("events");
exports.emailEvent = new events_1.EventEmitter();
exports.emailEvent.on("sendEmail", async (fu) => {
    try {
        await fu();
    }
    catch (error) {
        console.log("fail to send mail to user");
    }
});
