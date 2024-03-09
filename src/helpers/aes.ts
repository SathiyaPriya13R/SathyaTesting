const CryptoJS = require("crypto-js");

const secretKey = "YourSecretKey";
// const iv = CryptoJS.enc.Hex.parse('7d cc 47 e0 51 a2 ad 31 71 ff 01 65 04 63 da 05');
const iv = CryptoJS.enc.Hex.parse('yourInitializationVector');


export function encrypt(text: any) {
    try {
        const encryptedData = CryptoJS.AES.encrypt(text, secretKey, {
            iv,
            mode: CryptoJS.mode.CBC,
        }).toString();
        return encryptedData
    } catch (error: any) {
        throw new error;
    }
}

export function decrypt(encrypt_data: any) {
    try {
        const decryptedData = CryptoJS.AES.decrypt(encrypt_data, secretKey, {
            iv,
            mode: CryptoJS.mode.CBC,
        }).toString(CryptoJS.enc.Utf8);
        return decryptedData;
    } catch (error: any) {
        throw new error;
    }
}


