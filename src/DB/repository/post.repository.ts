import { Ipost } from "../../common/interfaces";
import { PostModel } from "../model";
import { BaseRepository } from "./base.repository";


export class PostRepository extends BaseRepository<Ipost>{
    constructor(){
        super(PostModel)
    }
}