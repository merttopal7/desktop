import crypto from 'crypto';
const hideAlgorithm = 'aes-256-cbc';
const hideKey = Buffer.from('6571d8b15cf870275d385e9e5f3b803d2687fd42c2bd766dbd08e3ac4439b8ad', 'hex');
import keydata from "@/keydata";

const encrypt = (text) => {
    const iv = Buffer.from(crypto.randomBytes(16), 'utf-8');
    const cipher = crypto.createCipheriv(hideAlgorithm, hideKey, iv);
    let crypted = cipher.update(text, 'utf8', 'hex');
    crypted += cipher.final('hex');
    return crypted + "3c0b8ad1a77f9006fd4a10854d2af46a797c47ac43be4213a53926e95d4cedd3" + iv.toString('hex');
}
const IV_LENGTH = 16;
class LicenseKeyGenerator {
    constructor(lickey = false, selection = []) {
        this.companyKey = lickey ?? ""
        const keys = keydata.typeKeyList;
        this.licenseTypeKeyList = selection.map(index => keys[index]);
    }

    async encrypt(licenseTypeKey, numOfDays = 365) {
        let numOfDaysString = numOfDays.toString().padStart(4, '0')
        let companyKey = this.companyKey
        let iv = crypto.randomBytes(IV_LENGTH);
        let cipher = crypto.createCipheriv('aes-256-ctr', Buffer.from(licenseTypeKey), iv);
        let encrypted = cipher.update(companyKey + numOfDaysString);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        encrypted = iv.toString('hex') + encrypted.toString('hex')
        return encrypted;
    }

    async getLicenseKeyList(numOfDays = 365) {
        let licenseKeyList = []
        for (let i = 0; i < this.licenseTypeKeyList.length; i++) {
            let encrypted = await this.encrypt(this.licenseTypeKeyList[i], numOfDays)
            licenseKeyList.push(encrypted)
        }
        licenseKeyList = licenseKeyList.map(lcs => encrypt(lcs))
        return licenseKeyList
    }

}

export default LicenseKeyGenerator;