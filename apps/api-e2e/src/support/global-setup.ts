import { waitForPortOpen } from '@nx/node/utils';

export default async function globalSetup() {
  console.log('\nSetting up e2e tests...\n');

  const host = process.env['HOST'] ?? 'localhost';
  const port = process.env['PORT'] ? Number(process.env['PORT']) : 3001;

  await waitForPortOpen(port, { host });

  return async () => {
    console.log('\nTearing down e2e tests...\n');
  };
}
