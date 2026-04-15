import { FlattenMaps, PopulateOptions, ProjectionType, ReturnsNewDoc, Types, UpdateQuery, UpdateResult, UpdateWithAggregationPipeline } from "mongoose";
import { QueryOptions } from "mongoose";
import { QueryFilter } from "mongoose";
import { HydratedDocument, Model, CreateOptions, AnyKeys } from "mongoose";
import { IUSer } from "../../common/interfaces";
import { DeleteResult, UpdateOptions } from "mongodb";




export abstract class BaseRepository <TRawDoc>{
    
    constructor(protected model:Model<TRawDoc>){}


    async create({
        data
    }:{
        data:AnyKeys<TRawDoc>
    }):Promise<HydratedDocument<TRawDoc>>;

        async create({
        data,
        options
    }:{
        data:AnyKeys<TRawDoc>[]
        options?:CreateOptions | undefined
    }):Promise<HydratedDocument<TRawDoc>[]>;


    async create({
        data,
        options
    }:{
        data:AnyKeys<TRawDoc>[] | AnyKeys<TRawDoc>
        options?:CreateOptions | undefined
    }):Promise<HydratedDocument<TRawDoc>[]|HydratedDocument<TRawDoc>>{
        return await this.model.create(data as any, options) 
    }

        async createOne({
        data,
        options
    }:{
        data:AnyKeys<TRawDoc>
        options?:CreateOptions | undefined
    }):Promise<HydratedDocument<TRawDoc>>{
        const [user] = await this.create({data:[data], options})
        return user as HydratedDocument<TRawDoc>
    }
    //finds
    async findOne({
        filter,
        projection, 
        options
    }:{
    filter?: QueryFilter<TRawDoc>,
    projection?: ProjectionType<TRawDoc> | null | undefined,
    options?: QueryOptions<TRawDoc> & {lean: false} | null | undefined
    }):Promise<HydratedDocument<IUSer> | null>;

    async findOne({
        filter,
        projection, 
        options
    }:{
    filter?: QueryFilter<TRawDoc>,
    projection?: ProjectionType<TRawDoc> | null | undefined,
    options?: QueryOptions<TRawDoc>& {lean: true} | null | undefined
    }):Promise<FlattenMaps<IUSer>| null>;

    async findOne({
        filter,
        projection, 
        options
    }:{
    filter?: QueryFilter<TRawDoc>,
    projection?: ProjectionType<TRawDoc> | null | undefined,
    options?: QueryOptions<TRawDoc> | null | undefined
    }):Promise<any>{
        const doc = this.model.findOne(filter, projection)
        if(options?.populate) doc.populate(options.populate as PopulateOptions[]);
        if(options?.lean) doc.lean(options.lean);
        return await doc.exec() 
    }




    async findById({
        _id,
        projection, 
        options
    }:{
    _id:Types.ObjectId,
    projection?: ProjectionType<TRawDoc> | null | undefined,
    options?: QueryOptions<TRawDoc> & {lean: false} | null | undefined
    }):Promise<HydratedDocument<IUSer> | null>;

    async findById({
        _id,
        projection, 
        options
    }:{
    _id:Types.ObjectId,
    projection?: ProjectionType<TRawDoc> | null | undefined,
    options?: QueryOptions<TRawDoc>& {lean: true} | null | undefined
    }):Promise<FlattenMaps<IUSer>| null>;

    async findById({
        _id,
        projection, 
        options
    }:{
    _id:Types.ObjectId,
    projection?: ProjectionType<TRawDoc> | null | undefined,
    options?: QueryOptions<TRawDoc> | null | undefined
    }):Promise<any>{
        const doc = this.model.findById(_id, projection)
        if(options?.populate) doc.populate(options.populate as PopulateOptions[]);
        if(options?.lean) doc.lean(options.lean);
        return await doc.exec() 
    }
//update


async findOneAndUpdate ({
    filter,
    update,
    options = {new:true}
}:{
    filter: QueryFilter<TRawDoc>,
    update: UpdateQuery<TRawDoc>,
    options: QueryOptions<TRawDoc> & ReturnsNewDoc
    }):Promise<HydratedDocument<TRawDoc>| null>{
        return await this.model.findOneAndUpdate(filter, update, options)
    }

    async findOneByIdAndUpdate ({
    _id,
    update,
    options = {new:true}
}:{
    _id: Types.ObjectId,
    update: UpdateQuery<TRawDoc>,
    options: QueryOptions<TRawDoc> & ReturnsNewDoc
    }):Promise<HydratedDocument<TRawDoc>| null>{
        return await this.model.findOneAndUpdate(_id, update, options)
    }


async updateOne ({
    filter,
    update,
    options
}:{
    filter: QueryFilter<TRawDoc>,
    update: UpdateQuery<TRawDoc> | UpdateWithAggregationPipeline,
    options?: UpdateOptions  | null
    }):Promise<UpdateResult>{
        return await this.model.updateOne(filter, update, options)
    }


async updateMany ({
    filter,
    update,
    options
}:{
    filter: QueryFilter<TRawDoc>,
    update: UpdateQuery<TRawDoc> | UpdateWithAggregationPipeline,
    options?: UpdateOptions  | null
    }):Promise<UpdateResult>{
        return await this.model.updateMany(filter, update, options)
    }

    //delete

    async findOneAndDelete ({
    filter
}:{
    filter: QueryFilter<TRawDoc>,
    }):Promise<HydratedDocument<TRawDoc>| null>{
        return await this.model.findOneAndDelete(filter)
    }


    async findOneByIdAndDelete ({
    _id,
    update,
    options = {new:true}
}:{
    _id: Types.ObjectId,
    update: UpdateQuery<TRawDoc>,
    options: QueryOptions<TRawDoc> & ReturnsNewDoc
    }):Promise<HydratedDocument<TRawDoc>| null>{
        return await this.model.findOneAndDelete(_id)
    }


async deleteOne ({
    filter
}:{
    filter: QueryFilter<TRawDoc>,
    }):Promise<DeleteResult>{
        return await this.model.deleteOne(filter)
    }

    async deleteMany ({
    filter
}:{
    filter: QueryFilter<TRawDoc>,
    }):Promise<DeleteResult>{
        return await this.model.deleteMany(filter)
    }

} 