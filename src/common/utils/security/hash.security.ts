import { hash , compare } from "bcrypt";
import { SALT_ROUND } from "../../../config/config.js";


export const generate_hash = async ({
    plain_text,
    salt = SALT_ROUND
}:{
    plain_text: string
    salt?:number
}):Promise<string>=>{
    return await hash(plain_text, salt)
}





export const compare_hash = async ({plain_text, cipher_text}:{plain_text:string, cipher_text: string}):Promise<boolean>=>{
   
    return await compare(plain_text, cipher_text)
    
}