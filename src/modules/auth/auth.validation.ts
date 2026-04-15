import z from "zod"
import { genralValidationFeilds } from "../../common/validation"



export const resendConfirmEmail = {
    body:z.strictObject({
        email:genralValidationFeilds.email
    })
}

export const login = {
    body:resendConfirmEmail.body.safeExtend({
        password:genralValidationFeilds.password
    })
}

export const signup = {
    body:login.body.safeExtend({
        username:genralValidationFeilds.username,
        phone: genralValidationFeilds.phone,
        confirmPassword:genralValidationFeilds.confirmPassword,
    }).refine((data:{password:string, confirmPassword:string})=>{
        return data.password === data.confirmPassword
    },{
        error: "confirmPassword doesn't match with password"
    })
}


export const confirmEmail = {
    body:resendConfirmEmail.body.safeExtend({
        otp: genralValidationFeilds.otp
    })
}