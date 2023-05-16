import * as EmailHandler from "./email-handler";
import {User} from "../entity/User";

const randomstring = require("randomstring");
const bcrypt = require('bcrypt');

export function getRandomString() {
    return randomstring.generate();
}

export function hashPassword(password: string) {
    return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string) {
    return bcrypt.compare(password, hash);
}

export function sendConfirmationEmail(url: string, user: User, callback?: Function) {
    EmailHandler.sendCustomMail(
        {
            from: 'Manga-dot',
            to: user.email,
            subject: 'Manga-dot: activate account',
            text: `To activate your account, please click this link - 
                                \n${url}?code=${user.verificationCode}`
        },
        callback
    )
}
