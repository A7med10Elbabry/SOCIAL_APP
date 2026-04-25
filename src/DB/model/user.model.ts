import { HydratedDocument, model, models, Schema } from "mongoose";
import { IUSer } from "../../common/interfaces";
import { GenderEnum, ProviderEnum, RoleEnum } from "../../common/enums";
import { any } from "zod";
import { encrypt, generate_hash } from "../../common/utils/security";




const UserSchema = new Schema<IUSer>({
    firstName:{type:String, required:true},
    lastName:{type:String, required:true},
    email:{type:String, required:true, unique:true},
    password:{type:String, required:function(this)
        {return this.provider === ProviderEnum.SYSTEM}},
    phone:{type:String},
    profilePicture:{type:String},
    profileCoverPicture:{type:[String]},
    gender:{type:Number, enum:GenderEnum,default:GenderEnum.MALE},
    role:{type:Number, enum:RoleEnum,default:RoleEnum.USER},
    provider:{type:Number, enum:ProviderEnum,default:ProviderEnum.SYSTEM},
    confirmEmail:{type:Date},
    changeCredentialsTime:{type:Date},
    DOB:{type:Date},
    deletedAt:{type:Date},
    resortedAt:{type:Date}
},{
    timestamps:true,
    strict:true,
    strictQuery:true,
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
})

UserSchema.virtual("username").set(function(value: string){
    const [firstName, lastName] = value.split(" ") || []
    this.firstName = firstName as string 
    this.lastName = lastName    as string
}).get(function(){
    return `${this.firstName} ${this.lastName}`
})


UserSchema.pre("save", async function(){
    if (this.isModified("password")) {
        this.password = await generate_hash({plain_text:this.password})
    }

    if (this.phone && this.isModified("phone")) {
        this.phone = await encrypt(this.phone as string)
    }
})


UserSchema.pre("findOne", function(){
    console.log(this.getQuery())
    const query = this.getQuery()
    if(query.paranoid === false){
    this.setQuery({ ...this.getQuery() })
    }else{
        this.setQuery({ ...this.getQuery(), deletedAt: {$exists: false} })
    }
})



UserSchema.pre(["updateOne", "findOneAndUpdate"], function(){
    const update = this.getUpdate() as HydratedDocument<IUSer>
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






UserSchema.pre(["deleteOne", "findOneAndDelete"], function(){

    const query = this.getQuery()
    if(query.force === true){
    this.setQuery({ ...query })
    }else{
        this.setQuery({ deletedAt: {$exists: true},  ...query })
    }
})

export const UserModel = models.User || model<IUSer>('User', UserSchema)