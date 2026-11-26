// Sends ONE real test SMS through MSG91. Manual use only; not part of the build.
//   npm run test:sms -- 9876543210
// Reads MSG91_AUTH_KEY and MSG91_OTP_TEMPLATE_ID from the environment.
import { sendViaMsg91, smsConfigured } from '../api/sms.ts';
import { normalizeMobile } from '../api/validate.ts';

const TEST_OTP = '123456'; // fixed dummy code, so you can check it appears in the SMS

function die(message: string): never {
  console.error(message);
  process.exit(1);
}

const mobile = normalizeMobile(process.argv[2]);
if (!mobile) die('Usage: npm run test:sms -- <10-digit Indian mobile number>');
if (!smsConfigured()) die('Set MSG91_AUTH_KEY and MSG91_OTP_TEMPLATE_ID in the environment first.');

const result = await sendViaMsg91(mobile, TEST_OTP);
if (!result.ok) die(`FAILED (HTTP ${result.status ?? 'no response'}): ${result.error}`);
console.log(`SUCCESS (HTTP ${result.status}): MSG91 accepted the message for +91 ${mobile}. Request ID: ${result.requestId}`);
console.log(`Check that the SMS arrives and shows the code ${TEST_OTP}. "Accepted" does not guarantee delivery.`);
