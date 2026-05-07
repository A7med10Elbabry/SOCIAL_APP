import { CompleteMultipartUploadCommandOutput, DeleteObjectCommand, DeleteObjectCommandOutput, DeleteObjectsCommand, GetObjectCommand, GetObjectCommandOutput, ObjectCannedACL, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { APPLICATION_NAME, AWS_ACCESS_KEY_ID, AWS_BUCKET_NAME, AWS_EXPIRES_IN, AWS_REGION, AWS_SECRET_ACCESS_KEY } from "../../config/config";
import { randomUUID } from "node:crypto";
import { BadRequestException } from "../exceptions";
import { storageApproacheEnum, uploadApproacheEnum } from "../enums";
import { createReadStream } from "node:fs";
import { Upload } from "@aws-sdk/lib-storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";



export class S3Service {
    private client: S3Client;
    constructor() {
        this.client = new S3Client({
            region: AWS_REGION,
            credentials: {
                accessKeyId: AWS_ACCESS_KEY_ID,
                secretAccessKey: AWS_SECRET_ACCESS_KEY
            }
        })
    }

    async uploadAsset({
        storageApproache = storageApproacheEnum.MEMORY,
        Bucket = AWS_BUCKET_NAME,
        path = "general",
        ACL = ObjectCannedACL.private,
        file,
        ContentType
    }: {
        storageApproache?: storageApproacheEnum,
        Bucket?: string,
        path?: string,
        ACL?: ObjectCannedACL,
        file: Express.Multer.File,
        ContentType?: string | undefined
    }) {
        const command = new PutObjectCommand({
            Bucket,
            Key: `${APPLICATION_NAME}/${path}/${randomUUID()}__${file.originalname}`,
            ACL,
            Body: storageApproache === storageApproacheEnum.MEMORY ? file.buffer : createReadStream(file.path),
            ContentType: file.mimetype || ContentType
        })
        if (!command.input?.Key) {
            throw new BadRequestException("fail to upload this asset")
        }
        await this.client.send(command)
        return command.input?.Key
    }


    async uploadLargeAsset({
        storageApproache = storageApproacheEnum.DISK,
        Bucket = AWS_BUCKET_NAME,
        path = "general",
        ACL = ObjectCannedACL.private,
        file,
        ContentType,
        partSize = 5
    }: {
        storageApproache?: storageApproacheEnum,
        Bucket?: string,
        path?: string,
        ACL?: ObjectCannedACL,
        file: Express.Multer.File,
        ContentType?: string | undefined
        partSize?: number
    }): Promise<CompleteMultipartUploadCommandOutput> {


        const uploadFile = new Upload({
            client: this.client,
            params:{
                Bucket,
                ACL,
                ContentType: file.mimetype || ContentType,
                Key: `${APPLICATION_NAME}/${path}/${randomUUID()}__${file.originalname}`,
                Body: storageApproache === storageApproacheEnum.MEMORY ? file.buffer : createReadStream(file.path)
            },
            partSize: partSize * 1024 * 1024
        })

        uploadFile.on("httpUploadProgress", (progress) => {
            console.log(progress)
            console.log(`file upload is ${((progress.loaded as number)/(progress.total as number))*100}%`);
            
        })

       return await uploadFile.done()
     
       
    }


    async uploadAssets({
        files,
        storageApproache = storageApproacheEnum.MEMORY,
        uploadApproache = uploadApproacheEnum.SMALL,
        Bucket = AWS_BUCKET_NAME,
        path = "general",
        ACL = ObjectCannedACL.private,
}: {
  files: Express.Multer.File[];
  uploadApproache?:uploadApproacheEnum,
  storageApproache?: storageApproacheEnum,
        Bucket?: string,
        path?: string,
        ACL?: ObjectCannedACL,
}): Promise<string[]> {

    let urls :string[] = []

    if (uploadApproache ===  uploadApproacheEnum.LARGE) {
        const data =  await Promise.all(
    files.map((file) => this.uploadLargeAsset({ storageApproache, Bucket, ACL, path, file }))
  );
    urls = data.map(ele => ele.Key as string)
    } else {
        urls =  await Promise.all(
    files.map((file) => this.uploadAsset({ storageApproache, Bucket, ACL, path, file }))
  );
    }
  
  return urls;
};

   async createPresignedUploadLink({
        Bucket = AWS_BUCKET_NAME,
        path = "general",
        ContentType,
        originalname,
        expiresIn = AWS_EXPIRES_IN
    }: {
        Bucket?: string,
        path?: string,
        ContentType: string | undefined,
        originalname:string,
        expiresIn?:number
    }) {
        const command = new PutObjectCommand({
            Bucket,
            Key: `${APPLICATION_NAME}/${path}/${randomUUID()}__${originalname}`,
            ContentType: ContentType
        })
        if (!command.input?.Key) {
            throw new BadRequestException("fail to upload this asset")
        }
        const url = await getSignedUrl(this.client, command,{expiresIn})
        return {url , key:command.input.Key}
    }

    async getAsset({
        Key,
        Bucket = AWS_BUCKET_NAME,
    }: {
        Bucket?: string,
        Key: string,
    }): Promise<GetObjectCommandOutput> {
        const command = new GetObjectCommand({
            Bucket,
            Key,
        })
    
     return   await this.client.send(command)
    }

     async createPresignedFetchLink({
        Bucket = AWS_BUCKET_NAME,
        Key,
        expiresIn = AWS_EXPIRES_IN,
        fileName,
        download
    }: {
        Bucket?: string,
        Key: string,
        expiresIn?:number,
        fileName?: string,
        download?: string
    }): Promise<string> {
        const command = new GetObjectCommand({
            Bucket,
            Key,
            ResponseContentDisposition: download === "true" ? `attachment; filename="${fileName || Key.split("/").pop()}"`: undefined,
        })

        const url = await getSignedUrl(this.client, command,{expiresIn})
        return url
    }

    async deleteAsset({
        Key,
        Bucket = AWS_BUCKET_NAME,
    }: {
        Bucket?: string,
        Key: string,
    }): Promise<DeleteObjectCommandOutput> {
        const command = new DeleteObjectCommand({
            Bucket,
            Key,
        })
        return await this.client.send(command)
    }


     async deleteAssets({
        Keys,
        Bucket = AWS_BUCKET_NAME,
    }: {
        Bucket?: string,
        Keys: {Key: string}[],
    }): Promise<DeleteObjectCommandOutput> {
        const command = new DeleteObjectsCommand({
            Bucket,
            Delete: {
                Objects: Keys,
                Quiet: true
            }
        })
        return await this.client.send(command)
    }
}


export const s3Service = new S3Service()