import { z } from "zod";


export const genralValidationFeilds = {
    email:z.email({error:"email is required"}),
    password:z.string({error:"password is required"}).regex(/^(?=.*[A-Z])(?=.*[\W_]).{8,50}$/, {error:"password must contain at least one uppercase letter and one special character"}).min(8).max(50),
    username:z.string({error:"username is required"}).min(2, {error:"username must be at least 2 characters"}).max(25, {error:"username maximum length is 25 characters"}),
    phone: z.string().regex(/^(00201|\+201|01)(0|1|2|5)\d{8}$/).optional(),
    otp: z.string().regex(/^\d{6}$/),
    confirmPassword:z.string()
}