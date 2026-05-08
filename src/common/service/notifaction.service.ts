import admin from "firebase-admin"
import { readFileSync } from "node:fs";
import { resolve } from "node:path";




export class NotifactionService {

    private readonly client: admin.app.App;
    constructor(){
        var serviceAccount = JSON.parse(readFileSync(
    resolve("./src/config/app-notifaction-c4375-firebase-adminsdk-fbsvc-6a99604623.json")
) as unknown as string)
    this.client = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
    }

    async sendNotifaction({
        token,
        data
    }:{
        token:string,
        data:{
            title:string,
            body:string
        }
    }) {
     
        const massege = {
            token,
            data
        }

    return await this.client.messaging().send(massege)


    }


  async sendNotifactions({
        tokens,
        data
    }:{
        tokens:string[],
        data:{
            title:string,
            body:string
        }
    }) {
     
    

    Promise.allSettled(
        tokens.map((token)=> {
            return this.sendNotifaction({token, data})
        }))

}

}

export const notifactionService = new NotifactionService();