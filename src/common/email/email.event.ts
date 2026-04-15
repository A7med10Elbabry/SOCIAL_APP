import { EventEmitter } from "events";



export const emailEvent= new EventEmitter()
emailEvent.on("sendEmail" , async(fu)=>{
    try {
      await fu()
    } catch (error) {
        console.log("fail to send mail to user");
        
    }
})