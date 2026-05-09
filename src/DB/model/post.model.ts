import { HydratedDocument, model, models, Schema, Types } from "mongoose";
import { AvailablityEnum } from "../../common/enums";
import { Ipost } from "../../common/interfaces";




const PostSchema = new Schema<Ipost>({
        folderId:{type:String, required:true},
       content:{type:String, required: function(this){
            return !this.attachements?.length
       }},
       attachements:{type:[String]},
       
       likes:{type:[Types.ObjectId], ref:"User"},
       tags:{type:[Types.ObjectId], ref:"User"},
       createdBy: {type:Types.ObjectId, ref:"User", required:true},
       updatedBy: {type:Types.ObjectId, ref:"User"},
       availablity:{type:Number, enum:AvailablityEnum, default:AvailablityEnum.PUBLIC},

         deletedAt:{type:Date},
         resortedAt:{type:Date},
},{
    timestamps:true,
    strict:true,
    strictQuery:true,
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
})


PostSchema.pre("findOne", function(){
    console.log(this.getQuery())
    const query = this.getQuery()
    if(query.paranoid === false){
    this.setQuery({ ...this.getQuery() })
    }else{
        this.setQuery({ ...this.getQuery(), deletedAt: {$exists: false} })
    }
})



PostSchema.pre(["updateOne", "findOneAndUpdate"], function(){
    const update = this.getUpdate() as HydratedDocument<Ipost>
    if(update.deletedAt){
        this.setUpdate({...update, $unset: {resortedAt:1}})
    }
    if(update.resortedAt){
        this.setUpdate({...update, $unset: {deletedAt:1}})
        this.setQuery({ ...this.getQuery(), deletedAt: {$exists: true} })
    }
    const query = this.getQuery()
    if(query.paranoid === false){
    this.setQuery({ ...query })
    }else{
        this.setQuery({ deletedAt: {$exists: false},  ...query })
    }
})






PostSchema.pre(["deleteOne", "findOneAndDelete"], function(){

    const query = this.getQuery()
    if(query.force === true){
    this.setQuery({ ...query })
    }else{
        this.setQuery({ deletedAt: {$exists: true},  ...query })
    }
})

export const PostModel = models.Post || model<Ipost>('Post', PostSchema)