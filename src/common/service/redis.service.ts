import { createClient, RedisClientType } from "redis";
import { REDIS_URI } from "../../config/config";
import { EmailEnum } from "../enums";
import { Types } from "mongoose";


type RedisKeyType = {
    email: string,
    subject: EmailEnum
}

export class RedisService{
    private readonly client: RedisClientType
    constructor(){
        this.client = createClient({url: REDIS_URI})
        this.handleEvent()
    } 
    
      private handleEvent = () =>{
        this.client.on("error", (error) => {console.error("Redis error:", error);})
        this.client.on("Ready", () => {console.log("Redis is ready");})
    }
    connect = async () =>{
        await this.client.connect()
        console.log("connected to redis");
    }

 otpKey = ({ email, subject = EmailEnum.CONFIRM_EMAIL }: RedisKeyType): string => {
  return `OTP::User::${email}::${subject}`
}

maxAttemptOtpKey = ({ email, subject = EmailEnum.CONFIRM_EMAIL }: RedisKeyType): string => {
  return `${this.otpKey({ email, subject })}::MaxTrial`
}

blockOtpKey = ({ email, subject = EmailEnum.CONFIRM_EMAIL }: RedisKeyType): string => {
  return `${this.otpKey({ email, subject })}::Block`
}

baseRevokeTokenKey = (userId: Types.ObjectId | string): string => {
  return `RevokeToken::${userId.toString()}`
}

revokeTokenKey = ({ userId, jti }: { userId: Types.ObjectId | string, jti: string }): string => {
  return `${this.baseRevokeTokenKey(userId)}::${jti}`
}

  set = async ({key, value, ttl }:
    {key: string, value: string | object, ttl?: number | undefined}): Promise<string | null> => {
    try {
        const data = typeof value === "string" ? value : JSON.stringify(value);

return ttl ?  await this.client.setEx(key, ttl, data) : await this.client.set(key, data);

    } catch (error) {
        console.error("Redis SET error:", error);
        return null;
    }
}

  get = async (key:string):Promise<any> => {
    try {

        try {
            return JSON.parse(await this.client.get(key) as string);
        } catch {
            return await this.client.get(key);
        }
    } catch (error) {
        console.error("Redis GET error:", error);
        return null;
    }
}


  update = async ({key, value, ttl}:
    {key: string, value: string | object, ttl?: number | undefined }): Promise<number| null |string> => {
    try {
        if (!await this.client.exists(key)) return 0;
        return await this.set({key, value, ttl});
    } catch (error) {
        console.error("Redis UPDATE error:", error);
        return 0;
    }
}

  deleteKey = async (keys:string | string[]): Promise<number> => {
    try {
        if(!keys.length) return 0;
        return await this.client.del(keys);
    } catch (error) {
        console.error("Redis DELETE error:", error);
        return 0;
    }
}


  expire = async ({key, ttl}:{key: string, ttl: number}):Promise<number> => {
    try {
        return await this.client.expire(key, ttl);
    } catch (error) {
        console.error("Redis EXPIRE error:", error);
        return 0;
    }
}


  ttl = async (key:string):Promise<number> => {
    try {
        return await this.client.ttl(key);
    } catch (error) {
        console.error("Redis TTL error:", error);
        return -2;
    }
}
    mGet = async (keys:string[]):Promise<string[]| number| null> => {
        try {
            return await this.client.mGet(keys) as unknown as string[];
        } catch (error) {
            console.log(`ERROR mGet `);
            return [];
        }
    }

  Keys = async (prefix:string): Promise<string[]> => {
    try {
        return await this.client.keys(`${prefix}*`);
    } catch (error) {
        console.log(`Redis KEYS error:`);
        return [];
    }
}

    exists =  async (key:string):Promise<number> =>{
        try {
            return await this.client.exists(key);
        } catch (error) {
            console.error("Redis EXISTS error:", error);
            return -2;
        }
    }

    incr = async (key:string):Promise<number > => {
        try {
            return await this.client.incr(key);
        } catch (error) {
            console.error("Redis INCR error:", error);
            return -2;
        }
    }

}


export const redisService = new RedisService();