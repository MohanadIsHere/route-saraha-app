import CryptoJS from 'crypto-js';
export const encrypt = ({plainText,secret} = {}) => {
    return CryptoJS.AES.encrypt(
        plainText,
        secret
      ).toString();
}
export const decrypt = ({cipherText, secret} = {}) => {
    return  CryptoJS.AES.decrypt(
          cipherText,
          secret
        ).toString(CryptoJS.enc.Utf8);
}