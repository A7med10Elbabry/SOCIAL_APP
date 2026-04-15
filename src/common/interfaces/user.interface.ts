import { GenderEnum, ProviderEnum, RoleEnum } from "../enums";






export interface IUSer {
    firstName:string;
    lastName:string;
    email:string;
    username?:string;
    password:string;
    confirmPassword?:string;
    phone?:string;
    profilePicture?:string;
    profileCoverPicture?:string;
    gender:GenderEnum;
    role:RoleEnum;
    provider:ProviderEnum;
    confirmEmail?:Date;
    changeCredentialsTime?:Date
    DOB?:Date;
    createdAt:Date;
    updatedAt:Date;
}