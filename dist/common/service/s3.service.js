"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.s3Service = exports.S3Service = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const config_1 = require("../../config/config");
const node_crypto_1 = require("node:crypto");
const exceptions_1 = require("../exceptions");
const enums_1 = require("../enums");
const node_fs_1 = require("node:fs");
const lib_storage_1 = require("@aws-sdk/lib-storage");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
class S3Service {
    client;
    constructor() {
        this.client = new client_s3_1.S3Client({
            region: config_1.AWS_REGION,
            credentials: {
                accessKeyId: config_1.AWS_ACCESS_KEY_ID,
                secretAccessKey: config_1.AWS_SECRET_ACCESS_KEY
            }
        });
    }
    async uploadAsset({ storageApproache = enums_1.storageApproacheEnum.MEMORY, Bucket = config_1.AWS_BUCKET_NAME, path = "general", ACL = client_s3_1.ObjectCannedACL.private, file, ContentType }) {
        const command = new client_s3_1.PutObjectCommand({
            Bucket,
            Key: `${config_1.APPLICATION_NAME}/${path}/${(0, node_crypto_1.randomUUID)()}__${file.originalname}`,
            ACL,
            Body: storageApproache === enums_1.storageApproacheEnum.MEMORY ? file.buffer : (0, node_fs_1.createReadStream)(file.path),
            ContentType: file.mimetype || ContentType
        });
        if (!command.input?.Key) {
            throw new exceptions_1.BadRequestException("fail to upload this asset");
        }
        await this.client.send(command);
        return command.input?.Key;
    }
    async uploadLargeAsset({ storageApproache = enums_1.storageApproacheEnum.DISK, Bucket = config_1.AWS_BUCKET_NAME, path = "general", ACL = client_s3_1.ObjectCannedACL.private, file, ContentType, partSize = 5 }) {
        const uploadFile = new lib_storage_1.Upload({
            client: this.client,
            params: {
                Bucket,
                ACL,
                ContentType: file.mimetype || ContentType,
                Key: `${config_1.APPLICATION_NAME}/${path}/${(0, node_crypto_1.randomUUID)()}__${file.originalname}`,
                Body: storageApproache === enums_1.storageApproacheEnum.MEMORY ? file.buffer : (0, node_fs_1.createReadStream)(file.path)
            },
            partSize: partSize * 1024 * 1024
        });
        uploadFile.on("httpUploadProgress", (progress) => {
            console.log(progress);
            console.log(`file upload is ${(progress.loaded / progress.total) * 100}%`);
        });
        return await uploadFile.done();
    }
    async uploadAssets({ files, storageApproache = enums_1.storageApproacheEnum.MEMORY, uploadApproache = enums_1.uploadApproacheEnum.SMALL, Bucket = config_1.AWS_BUCKET_NAME, path = "general", ACL = client_s3_1.ObjectCannedACL.private, }) {
        let urls = [];
        if (uploadApproache === enums_1.uploadApproacheEnum.LARGE) {
            const data = await Promise.all(files.map((file) => this.uploadLargeAsset({ storageApproache, Bucket, ACL, path, file })));
            urls = data.map(ele => ele.Key);
        }
        else {
            urls = await Promise.all(files.map((file) => this.uploadAsset({ storageApproache, Bucket, ACL, path, file })));
        }
        return urls;
    }
    ;
    async createPresignedUploadLink({ Bucket = config_1.AWS_BUCKET_NAME, path = "general", ContentType, originalname, expiresIn = config_1.AWS_EXPIRES_IN }) {
        const command = new client_s3_1.PutObjectCommand({
            Bucket,
            Key: `${config_1.APPLICATION_NAME}/${path}/${(0, node_crypto_1.randomUUID)()}__${originalname}`,
            ContentType: ContentType
        });
        if (!command.input?.Key) {
            throw new exceptions_1.BadRequestException("fail to upload this asset");
        }
        const url = await (0, s3_request_presigner_1.getSignedUrl)(this.client, command, { expiresIn });
        return { url, key: command.input.Key };
    }
    async getAsset({ Key, Bucket = config_1.AWS_BUCKET_NAME, }) {
        const command = new client_s3_1.GetObjectCommand({
            Bucket,
            Key,
        });
        return await this.client.send(command);
    }
    async createPresignedFetchLink({ Bucket = config_1.AWS_BUCKET_NAME, Key, expiresIn = config_1.AWS_EXPIRES_IN, fileName, download }) {
        const command = new client_s3_1.GetObjectCommand({
            Bucket,
            Key,
            ResponseContentDisposition: download === "true" ? `attachment; filename="${fileName || Key.split("/").pop()}"` : undefined,
        });
        const url = await (0, s3_request_presigner_1.getSignedUrl)(this.client, command, { expiresIn });
        return url;
    }
    async deleteAsset({ Key, Bucket = config_1.AWS_BUCKET_NAME, }) {
        const command = new client_s3_1.DeleteObjectCommand({
            Bucket,
            Key,
        });
        return await this.client.send(command);
    }
    async deleteAssets({ Keys, Bucket = config_1.AWS_BUCKET_NAME, }) {
        const command = new client_s3_1.DeleteObjectsCommand({
            Bucket,
            Delete: {
                Objects: Keys,
                Quiet: true
            }
        });
        return await this.client.send(command);
    }
}
exports.S3Service = S3Service;
exports.s3Service = new S3Service();
