import crypto from "crypto";

export const NUMALPHALIST = "0123456789abcdefghijklmnopqrstuvwxyz";
export const ALPHANUMLIST = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
export const ALPHALIST = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
export const CHARLIST = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
export const NUMLIST = "0123456789";

/** Generate a random string of the given length from the character set. */
export function randomString(length: number, chars: string = NUMALPHALIST): string {
    let result = "";
    for (let i = length; i > 0; --i) {
        result += chars[Math.round(Math.random() * (chars.length - 1))];
    }
    return result;
}

/** Generate a cryptographically random 6-digit OTP. */
export const generateOTP = (): string => crypto.randomInt(100_000, 999_999).toString();

/** Generate a unique set of API key, client code, and account ID. */
export function generateKeys() {
    return {
        api_key: randomString(22, CHARLIST),
        client_code: randomString(6, ALPHANUMLIST),
        acct_id: randomString(10, NUMLIST),
    };
}
