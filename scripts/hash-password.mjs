// Usage: npm run admin:hash -- "your-password"
// Prints a value for ADMIN_PASSWORD_HASH (same format as src/lib/auth.ts).
import { randomBytes, scryptSync } from "node:crypto";

const password = process.argv[2];
if (!password || password.length < 10) {
  console.error('Usage: npm run admin:hash -- "a-password-of-at-least-10-characters"');
  process.exit(1);
}
const salt = randomBytes(16).toString("hex");
const hash = scryptSync(password, salt, 64).toString("hex");
console.log(["scrypt", salt, hash].join(":"));
