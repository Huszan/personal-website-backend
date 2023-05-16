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
