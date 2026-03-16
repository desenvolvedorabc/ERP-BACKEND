import * as nodemailer from "nodemailer";

export const sendEmail = async (
  email: string,
  subject: string,
  html: string,
) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      service: process.env.MAIL_SERVICE,
      port: Number(process.env.MAIL_PORT),
      secure: process.env.MAIL_SECURE === 'true',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    await transporter.sendMail({
      from: process.env.MAIL_REPLY,
      to: email,
      subject,
      html,
    });

    console.log("email sent sucessfully");
  } catch (error) {
    console.log(`email not sent because of: ${JSON.stringify(error)}`);
  }
};
