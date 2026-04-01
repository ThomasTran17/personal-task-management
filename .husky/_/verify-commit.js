import fs from 'fs';

// Read commit message content from Git temporary file
const msgPath = process.argv[2];
if (!msgPath) process.exit(0);

const msg = fs.readFileSync(msgPath, 'utf-8').trim();

// Configuration similar to your commitlint config
const types = ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'chore', 'ci', 'revert'];
const maxLength = 100;

/**
 * Regex explanation:
 * ^([a-z]+)        : Group 1 - Type (must be lowercase)
 * (?:\((.+)\))?    : Group 2 - Scope (optional, enclosed in parentheses)
 * !?               : Breaking change exclamation mark (optional)
 * :\s              : Colon and space (required)
 * (.+)             : Group 3 - Subject
 */
const commitRE = /^([a-z]+)(?:\((.+)\))?!?:\s(.+)/;

const match = commitRE.exec(msg);

if (!match) {
  console.error(
    `❌ Invalid commit message format!\n\n` +
    `  Correct example: feat(auth): add login logic\n` +
    `  Valid types: ${types.join(', ')}\n`
  );
  process.exit(1);
}

const [full, type, scope, subject] = match;

// 1. Check Type-enum
if (!types.includes(type)) {
  console.error(`❌ Type "${type}" is invalid. Only accepts: ${types.join(', ')}`);
  process.exit(1);
}

// 2. Check Header Max Length
if (full.length > maxLength) {
  console.error(`❌ Commit line must not exceed ${maxLength} characters.`);
  process.exit(1);
}

// 3. Check Subject (must not start with uppercase letter)
if (/^[A-Z]/.test(subject)) {
  console.error(`❌ Subject must not start with an uppercase letter.`);
  process.exit(1);
}

// 4. Check ending period
if (subject.endsWith('.')) {
  console.error(`❌ Subject must not end with a period.`);
  process.exit(1);
}

// 5. Check Scope-case (if scope exists, it must be lowercase)
if (scope && scope !== scope.toLowerCase()) {
  console.error(`❌ Scope must be entirely lowercase.`);
  process.exit(1);
}

console.log('✅ Commit message is valid!');
process.exit(0);