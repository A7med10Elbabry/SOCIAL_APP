import { HydratedDocument, Types } from "mongoose";
import { IUSer } from "../../common/interfaces";
import { createPostDTO } from "./post.dto";
import { PostRepository, UserRepository } from "../../DB/repository";
import { notifactionService, NotifactionService, redisService, RedisService, s3Service, S3Service, TokenService } from "../../common/service";
import { BadRequestException, NotFoundException } from "../../common/exceptions";
import { randomUUID } from "node:crypto";
import { string } from "zod";






export class PostService {
    
    private readonly postRepository: PostRepository;
    private readonly UserRepository: UserRepository;
    private readonly redis: RedisService ;
    private readonly notifaction: NotifactionService;
    private readonly s3: S3Service
    constructor(){
        this.UserRepository = new UserRepository()
        this.redis = redisService
        this.notifaction = notifactionService
        this.postRepository = new PostRepository()
        this.s3 = s3Service
    }


    async createPost({availablity, content, files, tags}:createPostDTO, user: HydratedDocument<IUSer>){
        const mentions: Types.ObjectId[] = []
        const FCM_Tokens:string[] = []
        
        if (tags?.length) {
            const mentionedAccounts = await this.UserRepository.find({
                filter:{
                    _id:{$in:tags}
                }
            })
            if(mentionedAccounts.length != tags.length){
                throw new NotFoundException("fail to find some or all mentioned accounts")
            }

            for (const tag of tags) {
                mentions.push(Types.ObjectId.createFromHexString(tag)),
                (await this.redis.getFCMs(tag) || []).map(token=>FCM_Tokens.push(token))
        }
    }
            const folderId = randomUUID()
            let attachements :string[] = []
            if (files?.length) {
                attachements = await this.s3.uploadAssets({
                    files: files as Express.Multer.File[],
                    path: `post/${folderId}`
                })
            }

            const post = await this.postRepository.createOne({
                data:{
                    content,
                    availablity,
                    tags:mentions,
                    attachements,
                    createdBy:user._id,
                    folderId
                }
            })
            
            if(!post) {
                if (attachements.length) {
                    await this.s3.deleteAssets({
                        Keys: attachements.map( ele => { return { Key: ele }})
                    })
                }
                throw new BadRequestException("fail to create post")
            }

            if (FCM_Tokens.length) {
                await this.notifaction.sendNotifactions({
                    tokens:FCM_Tokens,
                    data:{
                    title:"new post",
                    body:`${user.username} mentioned you in a post`,
                    },
                    
                })
                
            }
            return post 
        } 
    }

    
    



export const postService = new PostService()
