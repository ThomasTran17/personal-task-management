#!/usr/bin/env node

/**
 * Check branch name convention
 * Allowed patterns:
 * - main
 * - develop
 * - feature/<feature-name>
 * - fix/<fix-name>
 * - hotfix/<hotfix-name>
 * - release/<version>
 */

import { execSync } from 'child_process';

const BRANCH_PATTERNS = [
  /^main$/,
  /^develop$/,
  /^feature\/[a-z0-9-]+$/,
  /^fix\/[a-z0-9-]+$/,
  /^hotfix\/[a-z0-9-]+$/,
  /^release\/v?\d+\.\d+\.\d+$/,
];

try {
  // Get current branch name
  const branchName = execSync('git rev-parse --abbrev-ref HEAD', {
    encoding: 'utf-8',
  }).trim();

  // Check if branch name matches any allowed pattern
  const isValid = BRANCH_PATTERNS.some((pattern) => pattern.test(branchName));

  if (!isValid) {
    console.error(
      `\n❌ Invalid branch name: "${branchName}"\n\nAllowed patterns:\n  - main\n  - develop\n  - feature/<feature-name>\n  - fix/<fix-name>\n  - hotfix/<hotfix-name>\n  - release/v<version>\n\nExamples:\n  - feature/user-authentication\n  - fix/navigation-bug\n  - release/v1.0.0\n`,
    );
    process.exit(1);
  }

} catch (error) {
  console.error('Error checking branch name:', error.message);
  process.exit(1);
}
