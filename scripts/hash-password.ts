// Run once locally to generate ADMIN_PASSWORD_HASH for .env.local:
//   pnpm hash-password "your-password-here"
import bcrypt from "bcryptjs";

const password = process.argv[2];

if (!password) {
  console.error('Usage: pnpm hash-password "your-password-here"');
  process.exit(1);
}

bcrypt.hash(password, 12).then((hash) => {
  // Next.js expands `$` in .env files as variable references, which
  // corrupts a raw bcrypt hash (it's full of `$`-delimited segments) —
  // escape every `$` as `\$` so it survives Next's env loader intact.
  const escaped = hash.replace(/\$/g, "\\$");
  console.log("\nAdd this to .env.local:\n");
  console.log(`ADMIN_PASSWORD_HASH=${escaped}\n`);
});
