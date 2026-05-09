import { Types } from "mongoose";
import { IUSer } from "./user.interface";
import { AvailablityEnum } from "../enums";



export interface Ipost  {
    folderId: string,
    content?: string,
    attachements?: string[],
    
    likes?: Types.ObjectId[] | IUSer[],
    tags?: Types.ObjectId[] | IUSer[],
    createdBy: Types.ObjectId | IUSer,
    updatedBy?: Types.ObjectId | IUSer,
    availablity?:AvailablityEnum


    createdAt: Date
    updatedAt?: Date
    deletedAt?: Date
    resortedAt?: Date
    
}