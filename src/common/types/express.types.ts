import { HydratedDocument } from "mongoose";
import { IUSer } from "../interfaces";
import { JwtPayload } from "jsonwebtoken";


declare module "express-serve-static-core"{
    interface Request {
        user: HydratedDocument<IUSer>,
        decoded:JwtPayload
    }
}