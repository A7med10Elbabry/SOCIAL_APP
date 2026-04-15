import { IUSer } from "../../common/interfaces";
import { UserModel } from "../model/user.model";
import { BaseRepository } from "./base.repository";


export class UserRepository extends BaseRepository<IUSer>{
    constructor(){
        super(UserModel)
    }
}