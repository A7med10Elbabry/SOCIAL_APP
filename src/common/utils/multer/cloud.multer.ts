import multer from "multer";
import { storageApproacheEnum } from "../../enums";
import { Request } from "express";
import { tmpdir } from "node:os";
import { randomUUID } from "node:crypto";
import { fileFilter } from "./validation.multer";


export const cloudFileUpload = ({
    storageApproache = storageApproacheEnum.MEMORY,
    validation = [],
    maxSize = 2
}:{
    storageApproache?: storageApproacheEnum,
    validation?: string[],
    maxSize?: number
}) => {

    const storage = storageApproache == storageApproacheEnum.MEMORY ? multer.memoryStorage() : multer.diskStorage({
        destination: function (req:Request, file:Express.Multer.File,callback:(error: Error | null, destination: string)=> void){
            callback(null, tmpdir())
        },
        filename:  function (req:Request, file:Express.Multer.File,callback:(error: Error | null, destination: string)=> void){
            callback(null, `${randomUUID()}__${file.originalname}`)
        }
    })

    return multer({fileFilter: fileFilter(validation), storage, limits:{fieldSize:maxSize*1024}})
}