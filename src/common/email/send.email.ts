import nodemailer from "nodemailer";
import { APPLICATION_NAME, EMAIL_APP, EMAIL_APP_PASSWORD } from "../../config/config";
import Mail from "nodemailer/lib/mailer";
import { BadRequestException } from "../exceptions";




export const sendEmail = async ({
    to,
    cc,
    bcc,
    subject,
    html,
    attachments=[],
}:Mail.Options):Promise<void> =>{
    
  if(!to && !cc&& !bcc){
    throw new BadRequestException("invalid recipient")
  }

    if(!(html as string)?.length && ! attachments?.length){
      throw new BadRequestException("invalid Email content")
    }
    // Create a transporter using SMTP
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: EMAIL_APP,
        pass: EMAIL_APP_PASSWORD,
      },
    });


    const info = await transporter.sendMail({
        to,
        cc, // list of recipients
        bcc,
        subject, // subject line
        attachments,
        html,
        from: `"${APPLICATION_NAME}" <${EMAIL_APP}>`, // sender address
      });

        console.log("Message sent: %s", info.messageId);
}



