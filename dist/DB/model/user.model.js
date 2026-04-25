"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const mongoose_1 = require("mongoose");
const enums_1 = require("../../common/enums");
const security_1 = require("../../common/utils/security");
const UserSchema = new mongoose_1.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: function () { return this.provider === enums_1.ProviderEnum.SYSTEM; } },
    phone: { type: String },
    profilePicture: { type: String },
    profileCoverPicture: { type: [String] },
    gender: { type: Number, enum: enums_1.GenderEnum, default: enums_1.GenderEnum.MALE },
    role: { type: Number, enum: enums_1.RoleEnum, default: enums_1.RoleEnum.USER },
    provider: { type: Number, enum: enums_1.ProviderEnum, default: enums_1.ProviderEnum.SYSTEM },
    confirmEmail: { type: Date },
    changeCredentialsTime: { type: Date },
    DOB: { type: Date },
    deletedAt: { type: Date },
    resortedAt: { type: Date }
}, {
    timestamps: true,
    strict: true,
    strictQuery: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
UserSchema.virtual("username").set(function (value) {
    const [firstName, lastName] = value.split(" ") || [];
    this.firstName = firstName;
    this.lastName = lastName;
}).get(function () {
    return `${this.firstName} ${this.lastName}`;
});
UserSchema.pre("save", async function () {
    if (this.isModified("password")) {
        this.password = await (0, security_1.generate_hash)({ plain_text: this.password });
    }
    if (this.phone && this.isModified("phone")) {
        this.phone = await (0, security_1.encrypt)(this.phone);
    }
});
UserSchema.pre("findOne", function () {
    console.log(this.getQuery());
    const query = this.getQuery();
    if (query.paranoid === false) {
        this.setQuery({ ...this.getQuery() });
    }
    else {
        this.setQuery({ ...this.getQuery(), deletedAt: { $exists: false } });
    }
});
UserSchema.pre(["updateOne", "findOneAndUpdate"], function () {
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
UserSchema.pre(["deleteOne", "findOneAndDelete"], function () {
    const query = this.getQuery();
    if (query.force === true) {
        this.setQuery({ ...query });
    }
    else {
        this.setQuery({ deletedAt: { $exists: true }, ...query });
    }
});
exports.UserModel = mongoose_1.models.User || (0, mongoose_1.model)('User', UserSchema);
