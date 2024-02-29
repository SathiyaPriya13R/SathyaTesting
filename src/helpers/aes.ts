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

const data = "U2FsdGVkX1+0bzw+hB1rPU72rguK01b2W5g+vLIq051G/hd9oOluapALosWK+9h+diyUjewhWiU4eYs8ik56eXE8/+QZaZGI54peRr78URkDwAfNG0S0kAPku2bdwB5ndguyemly6oqz8IzsSYTaF3twSV1Q/6xiPlQAuSp4eHke/ErSBpoo+w9cviS8cwNZZrQFW0dbgn11smeH7ndPK0rUFZFwpkD/mD+VbULILNSy8NmyTz9aO0dIBa7o+W2xzFpkFt+K6JAIkxrOfFZkdCUvvH/pNs4SHqv5jEEZlvs+6ewhk5GuXPXRJfAT39m2/+e6ljXi5rllDSwtMgn/vvkKT9EIcO4rIXmLjyo0yqk="
console.log(decrypt(data));
