import { model, models, Schema } from "mongoose";
import { IUSer } from "../../common/interfaces";
import { GenderEnum, ProviderEnum, RoleEnum } from "../../common/enums";
import { any } from "zod";




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

UserSchema.pre("findOne", function(){
    console.log(this.getQuery())
    const query = this.getQuery()
    if(query.paranoid === false){
    this.setQuery({ ...this.getQuery() })
    }else{
        this.setQuery({ ...this.getQuery(), deletedAt: {$exists: false} })
    }
})
UserSchema.pre("deleteOne", function(){
    console.log(this.getQuery())
    if(this.getQuery().force === false){
        this.setQuery({ ...this.getQuery() })
    }else{
        this.setQuery({ ...this.getQuery(), deletedAt: Date.now() });
}
})

export const UserModel = models.User || model<IUSer>('User', UserSchema)