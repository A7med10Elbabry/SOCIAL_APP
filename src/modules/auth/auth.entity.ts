
export interface IloginResopnse {
 access_Token:string,
  refreshToken:string
}


export interface ISignupResopnse extends IloginResopnse {
    username: string
    _id: string
}