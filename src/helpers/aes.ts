const CryptoJS = require("crypto-js");

const secretKey = "YourSecretKey";
const iv = CryptoJS.enc.Hex.parse('yourInitializationVector');

export function encrypt(text: any) {
    const encryptedData = CryptoJS.AES.encrypt(text, secretKey, {
        iv,        
        mode: CryptoJS.mode.CBC,
    }).toString();
    return encryptedData
}

export function decrypt(encrypt_data: any) {
    const decryptedData = CryptoJS.AES.decrypt(encrypt_data, secretKey, {
        iv,
        mode: CryptoJS.mode.CBC,
    }).toString(CryptoJS.enc.Utf8);
    return decryptedData;
}
