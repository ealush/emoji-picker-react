import { tmpdir } from 'node:os';
import { join } from 'node:path';

export const E2E_CONSUMER_PORT = 6030;

/** Scratch install shared by prepare.ts and serve.ts (EPR_E2E_DIR overrides). */
export function e2eConsumerDir(): string {
  return process.env.EPR_E2E_DIR ?? join(tmpdir(), 'epr-e2e-consumer');
}
