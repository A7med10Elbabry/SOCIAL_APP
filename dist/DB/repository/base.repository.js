"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRepository = void 0;
class BaseRepository {
    model;
    constructor(model) {
        this.model = model;
    }
    async create({ data, options }) {
        return await this.model.create(data, options);
    }
    async createOne({ data, options }) {
        const [user] = await this.create({ data: [data], options });
        return user;
    }
    async findOne({ filter, projection, options }) {
        const doc = this.model.findOne(filter, projection);
        if (options?.populate)
            doc.populate(options.populate);
        if (options?.lean)
            doc.lean(options.lean);
        return await doc.exec();
    }
    async findById({ _id, projection, options }) {
        const doc = this.model.findById(_id, projection);
        if (options?.populate)
            doc.populate(options.populate);
        if (options?.lean)
            doc.lean(options.lean);
        return await doc.exec();
    }
    async findOneAndUpdate({ filter, update, options = { new: true } }) {
        return await this.model.findOneAndUpdate(filter, update, options);
    }
    async findOneByIdAndUpdate({ _id, update, options = { new: true } }) {
        return await this.model.findOneAndUpdate(_id, update, options);
    }
    async updateOne({ filter, update, options }) {
        return await this.model.updateOne(filter, update, options);
    }
    async updateMany({ filter, update, options }) {
        return await this.model.updateMany(filter, update, options);
    }
    async findOneAndDelete({ filter }) {
        return await this.model.findOneAndDelete(filter);
    }
    async findOneByIdAndDelete({ _id, update, options = { new: true } }) {
        return await this.model.findOneAndDelete(_id);
    }
    async deleteOne({ filter }) {
        return await this.model.deleteOne(filter);
    }
    async deleteMany({ filter }) {
        return await this.model.deleteMany(filter);
    }
}
exports.BaseRepository = BaseRepository;
