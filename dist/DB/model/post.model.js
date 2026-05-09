"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostModel = void 0;
const mongoose_1 = require("mongoose");
const enums_1 = require("../../common/enums");
const PostSchema = new mongoose_1.Schema({
    folderId: { type: String, required: true },
    content: { type: String, required: function () {
            return !this.attachements?.length;
        } },
    attachements: { type: [String] },
    likes: { type: [mongoose_1.Types.ObjectId], ref: "User" },
    tags: { type: [mongoose_1.Types.ObjectId], ref: "User" },
    createdBy: { type: mongoose_1.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: mongoose_1.Types.ObjectId, ref: "User" },
    availablity: { type: Number, enum: enums_1.AvailablityEnum, default: enums_1.AvailablityEnum.PUBLIC },
    deletedAt: { type: Date },
    resortedAt: { type: Date },
}, {
    timestamps: true,
    strict: true,
    strictQuery: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
PostSchema.pre("findOne", function () {
    console.log(this.getQuery());
    const query = this.getQuery();
    if (query.paranoid === false) {
        this.setQuery({ ...this.getQuery() });
    }
    else {
        this.setQuery({ ...this.getQuery(), deletedAt: { $exists: false } });
    }
});
PostSchema.pre(["updateOne", "findOneAndUpdate"], function () {
    const update = this.getUpdate();
    if (update.deletedAt) {
        this.setUpdate({ ...update, $unset: { resortedAt: 1 } });
    }
    if (update.resortedAt) {
        this.setUpdate({ ...update, $unset: { deletedAt: 1 } });
        this.setQuery({ ...this.getQuery(), deletedAt: { $exists: true } });
    }
    const query = this.getQuery();
    if (query.paranoid === false) {
        this.setQuery({ ...query });
    }
    else {
        this.setQuery({ deletedAt: { $exists: false }, ...query });
    }
});
PostSchema.pre(["deleteOne", "findOneAndDelete"], function () {
    const query = this.getQuery();
    if (query.force === true) {
        this.setQuery({ ...query });
    }
    else {
        this.setQuery({ deletedAt: { $exists: true }, ...query });
    }
});
exports.PostModel = mongoose_1.models.Post || (0, mongoose_1.model)('Post', PostSchema);
