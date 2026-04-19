"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const mongoose_1 = require("mongoose");
const enums_1 = require("../../common/enums");
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
UserSchema.pre("deleteOne", function () {
    console.log(this.getQuery());
    if (this.getQuery().force === false) {
        this.setQuery({ ...this.getQuery() });
    }
    else {
        this.setQuery({ ...this.getQuery(), deletedAt: Date.now() });
    }
});
exports.UserModel = mongoose_1.models.User || (0, mongoose_1.model)('User', UserSchema);
