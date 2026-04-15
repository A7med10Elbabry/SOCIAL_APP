import crypto from 'crypto'
import { BadRequestException } from '../../exceptions';

const IV_LENGTH = 16;
const ENCRYPTION_SECRET_KEY = Buffer.from("51575367123987456369258741852369")

export const encrypt = (text: string): Promise<string>=>{
    const iv = crypto.randomBytes(IV_LENGTH);

    const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_SECRET_KEY, iv)

    let encryption_data = cipher.update(text, 'utf-8', 'hex')
    encryption_data = cipher.final('hex') 
    
    return  `${iv.toString('hex')}:${encryption_data}`  as string as unknown as  Promise<string>
} 

export const decrypt = (encrypted_data: string): Promise<string>=>{
    const [iv, encryption_text] = encrypted_data.split(':')||[] as string[];


    if(!iv || encryption_text){
        throw new BadRequestException("missing encryption parts")
    }
    const binaryLikeIV = Buffer.from(iv,'hex')

    const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_SECRET_KEY, binaryLikeIV)

    let decypted_data = decipher.update(encrypted_data, 'hex', 'utf-8')
    decypted_data = decipher.final('utf-8')
    
    return `${decypted_data}` as string as unknown as  Promise<string>
} 