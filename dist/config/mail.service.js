import nodemailer from "nodemailer";
import validate from "./validate.js";
export const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: validate.MAIL_USER,
        pass: validate.MAIL_PASSWORD,
    },
});
//# sourceMappingURL=mail.service.js.map