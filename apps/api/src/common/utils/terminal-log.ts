/** ANSI colors for clear DB lifecycle messages in the Nest terminal. */
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';

export function logDbConnected(message: string): void {
  console.log(`${BOLD}${GREEN}✓ ${message}${RESET}`);
}

export function logDbDisconnected(message: string): void {
  console.error(`${BOLD}${RED}✗ ${message}${RESET}`);
}
