/* eslint-disable @typescript-eslint/no-explicit-any */
import ejs from "ejs";
import nodemailer from "nodemailer";
import path from "path";
import { envVars } from "../config/env";
import AppError from "../errorHelpers/AppError";

// Gmail App Passwords are shown with spaces (e.g. "abcd efgh ijkl mnop")
// but must be used WITHOUT spaces when authenticating
const smtpPass = envVars.EMAIL_SENDER.SMTP_PASS.replace(/\s+/g, "");

const transporter = nodemailer.createTransport({
    host: envVars.EMAIL_SENDER.SMTP_HOST,
    port: Number(envVars.EMAIL_SENDER.SMTP_PORT),
    secure: false,      // false for port 587 (STARTTLS)
    requireTLS: true,   // Gmail requires TLS upgrade on port 587
    auth: {
        user: envVars.EMAIL_SENDER.SMTP_USER,
        pass: smtpPass,
    },
    tls: {
        rejectUnauthorized: false,
    },
});


interface SendEmailOptions {
    from?: string;
    to: string,
    subject: string;
    templateName: string;
    templateData?: Record<string, any>
    attachments?: {
        filename: string,
        content: Buffer | string,
        contentType: string
    }[]
}

export const sendEmail = async ({
    from,
    to,
    subject,
    templateName,
    templateData,
    attachments
}: SendEmailOptions) => {
    try {
        console.log({ from, to, subject, templateName, templateData, attachments });
        const templatePath = path.join(__dirname, `templates/${templateName}.ejs`)
        const html = await ejs.renderFile(templatePath, templateData)
        const info = await transporter.sendMail({
            from: `"SkillShelf" <${envVars.EMAIL_SENDER.SMTP_FROM}>`,
            to: to,
            subject: subject,
            html: html,
            attachments: attachments?.map(attachment => ({
                filename: attachment.filename,
                content: attachment.content,
                contentType: attachment.contentType
            }))
        })
        console.log("SMTP_USER1:", envVars.EMAIL_SENDER.SMTP_USER);
console.log("SMTP_PASS1:", envVars.EMAIL_SENDER.SMTP_PASS);
console.log("info:", info);

        console.log(`\u2709\uFE0F Email sent to ${to}: ${info.messageId}`);
    } catch (error: any) {
        console.error("❌ Email sending failed:", error.message);
        console.error("SMTP Config:", {
            host: envVars.EMAIL_SENDER.SMTP_HOST,
            port: envVars.EMAIL_SENDER.SMTP_PORT,
            user: envVars.EMAIL_SENDER.SMTP_USER,
        });
        throw new AppError(500, `Email sending failed: ${error.message}`)
    }
}

