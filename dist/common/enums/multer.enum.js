"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadApproacheEnum = exports.storageApproacheEnum = void 0;
var storageApproacheEnum;
(function (storageApproacheEnum) {
    storageApproacheEnum[storageApproacheEnum["MEMORY"] = 0] = "MEMORY";
    storageApproacheEnum[storageApproacheEnum["DISK"] = 1] = "DISK";
})(storageApproacheEnum || (exports.storageApproacheEnum = storageApproacheEnum = {}));
var uploadApproacheEnum;
(function (uploadApproacheEnum) {
    uploadApproacheEnum[uploadApproacheEnum["SMALL"] = 0] = "SMALL";
    uploadApproacheEnum[uploadApproacheEnum["LARGE"] = 1] = "LARGE";
})(uploadApproacheEnum || (exports.uploadApproacheEnum = uploadApproacheEnum = {}));
