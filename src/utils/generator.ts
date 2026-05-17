import crypto from "crypto";

export const NUMALPHALIST = "0123456789abcdefghijklmnopqrstuvwxyz";
export const ALPHANUMLIST = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
export const ALPHALIST = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
export const CHARLIST = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
export const NUMLIST = "0123456789"; // "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function randomString(length: number, chars: string = NUMALPHALIST) {
	var result = "";
	for (var i = length; i > 0; --i)
		result += chars[Math.round(Math.random() * (chars.length - 1))];
	return result;
}
export const generateOTP = () => {
	return crypto.randomInt(100000, 999999).toString();
};

// export const validateOTP = (storedOTP: string, providedOTP: string, createdAt: number) => {
// 	const tenMinutes = 10 * 60 * 1000; // 10 minutes in milliseconds
// 	const isExpired = Date.now() - createdAt > tenMinutes;

// 	return !isExpired && storedOTP === providedOTP;
// };

export function generateKeys() {
	const api_key = randomString(22, CHARLIST);
	const client_code = randomString(6, ALPHANUMLIST);
	const acct_id = randomString(10, NUMLIST);
	const num_list = randomString(10, NUMLIST);

	return {
		api_key,
		client_code,
		acct_id,
		num_list,
	};
}
